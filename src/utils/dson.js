/**
 * Reader for Darkest Dungeon's own save format.
 *
 * The files in `Documents/Darkest/profile_N/` are named `persist.*.json` but
 * none of them is JSON: they are a binary format the community calls **DSON**,
 * starting with the magic `01 B1 00 00`. Scanning one for printable strings —
 * which is what this app used to do — cannot tell a living hero from a corpse
 * in the campaign log or a recruit standing in the Stage Coach, because all
 * three spell their class the same way. Reading the structure can.
 *
 * Layout (all little-endian):
 *
 * | offset | size | what |
 * | --- | --- | --- |
 * | 0x00 | 4 | magic `0x0000B101` |
 * | 0x04 | 4 | revision |
 * | 0x08 | 4 | header length, always 0x40 |
 * | 0x10 | 4 | meta1 size | 0x14 | 4 | meta1 count | 0x18 | 4 | meta1 offset |
 * | 0x2C | 4 | meta2 count | 0x30 | 4 | meta2 offset |
 * | 0x38 | 4 | data length | 0x3C | 4 | data offset |
 *
 * **meta1** is one 16-byte record per object, and only its `numDirectChildren`
 * is load-bearing here — that is what rebuilds the tree, since the fields
 * themselves are a flat pre-order list. **meta2** is one 12-byte record per
 * field: a name hash, the field's offset inside the data section, and a packed
 * `fieldInfo` carrying the object flag, the name length and the meta1 index.
 *
 * Two details are easy to get wrong and both are pinned by tests:
 *
 * 1. **The bytes between a field's name and its value are junk, not padding.**
 *    The game aligns values to 4 bytes but never clears what was in the buffer,
 *    so the gap routinely holds the tail of some earlier name. Skipping to the
 *    alignment boundary is mandatory; reading the gap gives nonsense.
 * 2. **Booleans are the exception: they are written unaligned**, one byte
 *    straight after the name. A bool is therefore recognised by its raw length
 *    being exactly 1, before any alignment is applied.
 *
 * A hero is stored as a whole DSON file nested inside its parent's `raw_data`
 * field, so decoding recurses.
 */

const MAGIC = 0x0000b101;
const HEADER_SIZE = 0x40;

// Four bytes mean nothing on their own, so the few fields the game stores as
// floats have to be named. Everything else numeric reads as a signed int —
// `wallet.amount` included, which is why "anything that looks like a float"
// is not a workable rule.
const FLOAT_FIELDS = new Set([
  'current_hp',
  'm_Stress',
  'damage_source_data',
  'actor_hp',
  // Seconds of play in persist.game.json. Read as an int it comes out as
  // 1153022976, which looks like a plausible counter and is not one.
  'totalelapsed'
]);

const toBytes = (input) => {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError('Expected an ArrayBuffer or a typed array');
};

const isPrintable = (b) => b >= 32 && b <= 126;

/** ASCII only: every string the game writes into a save is ASCII. */
const readAscii = (bytes, start, end) => {
  let out = '';
  for (let i = start; i < end; i++) out += String.fromCharCode(bytes[i]);
  return out;
};

export const isDsonBuffer = (input) => {
  try {
    const bytes = toBytes(input);
    if (bytes.length < HEADER_SIZE) return false;
    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true) === MAGIC;
  } catch {
    return false;
  }
};

/**
 * Splits a DSON buffer into its flat list of fields. Exported for the tests,
 * which assert the framing separately from the value typing.
 */
export const readFields = (input) => {
  const bytes = toBytes(input);
  if (bytes.length < HEADER_SIZE) throw new Error('Not a Darkest Dungeon save file: too short.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== MAGIC) throw new Error('Not a Darkest Dungeon save file: bad magic number.');

  const numMeta1 = view.getUint32(0x14, true);
  const meta1Offset = view.getUint32(0x18, true);
  const numMeta2 = view.getUint32(0x2c, true);
  const meta2Offset = view.getUint32(0x30, true);
  const dataLength = view.getUint32(0x38, true);
  const dataOffset = view.getUint32(0x3c, true);

  if (dataOffset + dataLength > bytes.length) throw new Error('Truncated Darkest Dungeon save file.');

  const childCounts = new Array(numMeta1);
  for (let i = 0; i < numMeta1; i++) childCounts[i] = view.getInt32(meta1Offset + i * 16 + 8, true);

  const fields = new Array(numMeta2);
  for (let i = 0; i < numMeta2; i++) {
    const entry = meta2Offset + i * 12;
    const offset = view.getUint32(entry + 4, true);
    const fieldInfo = view.getUint32(entry + 8, true);

    const isObject = (fieldInfo & 0b1) === 1;
    const nameLength = (fieldInfo & 0b11111111100) >>> 2;
    // The top bit is a flag of its own, so the meta1 index is masked out of the
    // remaining 20 bits rather than shifted off the whole word.
    const meta1Index = (fieldInfo & 0x7ffff800) >>> 11;

    const nameStart = dataOffset + offset;
    const dataStart = nameStart + nameLength;
    const nextOffset = i + 1 < numMeta2 ? view.getUint32(meta2Offset + (i + 1) * 12 + 4, true) : dataLength;

    fields[i] = {
      name: readAscii(bytes, nameStart, nameStart + Math.max(0, nameLength - 1)),
      isObject,
      numDirectChildren: isObject ? childCounts[meta1Index] || 0 : 0,
      raw: bytes.subarray(dataStart, dataOffset + nextOffset),
      // Distance from the end of the name to the 4-byte boundary the value
      // actually starts on. Whatever sits in between is uninitialised junk.
      pad: (4 - (dataStart % 4)) % 4
    };
  }

  return fields;
};

/** Reads one field's payload, inferring its type from shape and name. */
const readValue = (field) => {
  const { raw, pad, name } = field;

  // Bools skip alignment entirely, so this test has to come first.
  if (raw.length === 1) return raw[0] !== 0;

  const data = raw.subarray(pad);
  const n = data.length;
  if (n === 0) return null;
  if (n === 1) return data[0] !== 0;

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // A nested save file: a length prefix followed by a whole DSON document.
  if (n >= 4 + HEADER_SIZE && view.getUint32(0, true) === n - 4 && view.getUint32(4, true) === MAGIC) {
    return parseDson(data.subarray(4));
  }

  if (n >= 5) {
    // String: length prefix (counting the terminator), printable body, NUL.
    const length = view.getUint32(0, true);
    if (length > 0 && length === n - 4 && data[n - 1] === 0) {
      let printable = true;
      for (let i = 4; i < n - 1; i++) {
        if (!isPrintable(data[i])) { printable = false; break; }
      }
      if (printable) return readAscii(data, 4, n - 1);
    }

    // String vector: a count, then that many length-prefixed strings.
    const count = view.getUint32(0, true);
    if (count > 0 && count < n) {
      const out = [];
      let p = 4;
      let ok = true;
      for (let k = 0; k < count && ok; k++) {
        if (p + 4 > n) { ok = false; break; }
        const size = view.getUint32(p, true);
        p += 4;
        if (size <= 0 || p + size > n || data[p + size - 1] !== 0) { ok = false; break; }
        for (let i = p; i < p + size - 1; i++) {
          if (!isPrintable(data[i])) { ok = false; break; }
        }
        out.push(readAscii(data, p, p + size - 1));
        p += size;
      }
      if (ok && p === n) return out;
    }
  }

  if (n === 4) return FLOAT_FIELDS.has(name) ? view.getFloat32(0, true) : view.getInt32(0, true);

  if (n % 4 === 0) {
    const count = view.getUint32(0, true);
    const out = [];
    // Int vector: leading count, then exactly that many ints.
    if (count === (n - 4) / 4) {
      for (let k = 0; k < count; k++) out.push(view.getInt32(4 + k * 4, true));
      return out;
    }
    for (let k = 0; k < n / 4; k++) out.push(view.getInt32(k * 4, true));
    return out;
  }

  return null;
};

/**
 * Decodes a DSON buffer into a plain object. Objects become objects, and the
 * game's numeric keys (`heroes.17`) stay strings, so a roster reads as
 * `{ heroes: { '17': … } }`.
 */
export const parseDson = (input) => {
  const fields = readFields(input);
  let cursor = 0;

  const build = (count) => {
    const out = {};
    for (let k = 0; k < count && cursor < fields.length; k++) {
      const field = fields[cursor++];
      out[field.name] = field.isObject ? build(field.numDirectChildren) : readValue(field);
    }
    return out;
  };

  const root = fields[0];
  if (!root) return {};
  cursor = 1;
  return root.isObject ? build(root.numDirectChildren) : build(fields.length);
};

export default parseDson;
