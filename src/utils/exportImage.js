/**
 * Sacar un PNG de un trozo de la pagina.
 *
 * ## Por que existe este fichero
 *
 * La exportacion estaba rota, y no por el codigo que la llamaba. `html2canvas`
 * 1.4.1 solo sabe leer cuatro funciones de color -- `rgb`, `rgba`, `hsl`,
 * `hsla`-- y **lanza** con cualquier otra:
 *
 *     Attempting to parse an unsupported color function "oklch"
 *
 * Tailwind v4 escribe su paleta entera en `oklch()` (97 variables en la hoja
 * compilada) y cada utilidad con opacidad -- `bg-gray-800/90`, que es el fondo
 * del propio panel de la party-- en `color-mix()` (309 usos). O sea: la primera
 * propiedad de color que mira `html2canvas` ya lo tumba. La excepcion subia
 * hasta el `catch` de quien llamaba y salia el toast de "Error exporting
 * image", que es justo lo que se veia.
 *
 * No es culpa de nadie: la app se migro de Tailwind v3 (hex) a v4 (oklch) y la
 * exportacion dejo de funcionar sin que nada mas cambiara.
 *
 * ## Como se arregla
 *
 * Traduciendo los colores a `rgb()` **antes** de la captura, y quien traduce es
 * el propio navegador: se pinta el color en un canvas de 1x1 y se lee el pixel.
 * Eso vale para cualquier sintaxis que el navegador entienda, incluidas las que
 * aun no existen, en vez de una tabla de conversion que habria que mantener.
 *
 * La traduccion se aplica como estilo en linea sobre los elementos de verdad,
 * no sobre un clon: cada color se sustituye por su propio valor en sRGB, asi
 * que aunque el navegador llegue a repintar, se ve exactamente igual. Al
 * terminar se restaura el atributo `style` tal cual estaba.
 *
 * ## Y de paso, la descarga
 *
 * `canvas.toDataURL()` genera una URI de varios megas con `scale: 2`, y Chrome
 * corta las navegaciones a `data:` sobre ~2 MB; un `<a download>` que no esta
 * en el documento tampoco dispara en Firefox. Es el mismo problema que
 * `download.js` ya documenta para el JSON, con la misma solucion: un `Blob`,
 * un object URL y el ancla metida en el DOM.
 */

const OBJECT_URL_LIFETIME_MS = 60_000;

// Lo que `html2canvas` mira y parsea como color. `background-image` entra por
// los degradados, que llevan sus paradas de color dentro.
const COLOR_PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'text-decoration-color',
  '-webkit-text-stroke-color',
  'box-shadow'
];

// De mas larga a mas corta: `color-mix` tiene que ganarle a `color`.
const COLOR_FUNCTIONS = ['color-mix', 'oklch', 'oklab', 'lch', 'lab', 'hwb', 'color'];

const IDENT_CHAR = /[A-Za-z0-9_-]/;

/** Donde empieza la siguiente funcion de color moderna, o null. */
const findColorFunction = (text, from) => {
  for (let i = from; i < text.length; i += 1) {
    for (const name of COLOR_FUNCTIONS) {
      if (!text.startsWith(name, i)) continue;
      if (text[i + name.length] !== '(') continue;
      // No partir un identificador mas largo por la mitad.
      if (i > 0 && IDENT_CHAR.test(text[i - 1])) continue;
      return { index: i, name };
    }
  }
  return null;
};

/** El indice del parentesis que cierra el que abre en `open`, o -1. */
const closingParen = (text, open) => {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
};

/** ¿Hay algo aqui que `html2canvas` no sepa leer? */
export const hasModernColor = (value) =>
  typeof value === 'string' && findColorFunction(value, 0) !== null;

let sharedContext;

const measuringContext = () => {
  if (sharedContext !== undefined) return sharedContext;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    sharedContext = canvas.getContext('2d') || null;
  } catch {
    sharedContext = null;
  }
  return sharedContext;
};

const rgbCache = new Map();

/**
 * Cualquier color CSS -> `rgb()` / `rgba()`, preguntandoselo al navegador.
 *
 * `null` cuando no se puede traducir: sin canvas (jsdom), sintaxis que el
 * navegador tampoco entiende, o un color totalmente transparente -- y ese
 * ultimo caso no hace falta traducirlo, porque `transparent` ya se lee bien.
 */
export const cssColorToRgb = (value) => {
  if (rgbCache.has(value)) return rgbCache.get(value);

  const ctx = measuringContext();
  let result = null;
  if (ctx) {
    try {
      ctx.clearRect(0, 0, 1, 1);
      // Un valor que no se entiende se ignora en silencio y `fillStyle` se
      // queda como estaba; partiendo de transparente, el pixel sale con alfa 0
      // y eso es lo que se detecta abajo.
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      if (a !== 0) {
        result = a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
      }
    } catch {
      result = null;
    }
  }

  rgbCache.set(value, result);
  return result;
};

/**
 * Reescribe cada funcion de color moderna de un valor CSS.
 *
 * Sirve tanto para un color suelto (`background-color`) como para un valor
 * compuesto que lleva varios dentro (`box-shadow`, un degradado): se recorre
 * el texto y se sustituye cada aparicion, dejando el resto igual.
 *
 * @param {string} value
 * @param {(color: string) => string|null} [convert] inyectable para los tests
 */
export const rewriteModernColors = (value, convert = cssColorToRgb) => {
  if (typeof value !== 'string' || !value) return value;

  let out = '';
  let cursor = 0;

  for (;;) {
    const found = findColorFunction(value, cursor);
    if (!found) break;
    const open = found.index + found.name.length;
    const close = closingParen(value, open);
    if (close === -1) break;

    const original = value.slice(found.index, close + 1);
    const converted = convert(original);
    out += value.slice(cursor, found.index) + (converted || original);
    cursor = close + 1;
  }

  return out + value.slice(cursor);
};

/**
 * Deja el arbol de `root` en colores que `html2canvas` sepa leer.
 *
 * @returns {() => void} la funcion que lo devuelve todo a su sitio. Hay que
 *   llamarla siempre, tambien si la captura falla.
 */
export const normalizeModernColors = (root) => {
  const restore = [];
  if (!root || typeof window === 'undefined' || !window.getComputedStyle) {
    return () => {};
  }

  const elements = [root, ...root.querySelectorAll('*')];
  elements.forEach((element) => {
    let computed;
    try {
      computed = window.getComputedStyle(element);
    } catch {
      return;
    }
    if (!computed) return;

    const patches = [];
    COLOR_PROPS.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      if (!value || !hasModernColor(value)) return;
      const rewritten = rewriteModernColors(value);
      if (rewritten !== value) patches.push([prop, rewritten]);
    });
    if (!patches.length) return;

    // El atributo entero, no propiedad a propiedad: restaurar asi no puede
    // dejarse nada puesto ni borrar un estilo en linea que ya estuviera.
    restore.push([element, element.getAttribute('style')]);
    patches.forEach(([prop, value]) => element.style.setProperty(prop, value, 'important'));
  });

  return () => {
    restore.forEach(([element, style]) => {
      if (style === null) element.removeAttribute('style');
      else element.setAttribute('style', style);
    });
  };
};

const DEFAULT_CAPTURE = {
  backgroundColor: '#1f2937', // gray-800
  scale: 2,
  useCORS: true, // los assets viven en raw.githubusercontent.com
  allowTaint: true,
  logging: false
};

/**
 * `html2canvas` sobre un elemento, con los colores ya traducidos.
 * @returns {Promise<HTMLCanvasElement>}
 */
export const captureElement = async (element, options = {}) => {
  const html2canvas = (await import('html2canvas')).default;
  const restore = normalizeModernColors(element);
  try {
    return await html2canvas(element, { ...DEFAULT_CAPTURE, ...options });
  } finally {
    restore();
  }
};

const clickToDownload = (href, fileName) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = href;
  // Firefox ignora un ancla que no este en el documento.
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Guarda un canvas como PNG.
 *
 * Por `Blob` y no por `toDataURL`: a `scale: 2` un panel de party pasa de los
 * 2 MB que Chrome admite en una navegacion `data:`, y lo que se ve entonces es
 * una descarga que no ocurre.
 *
 * @returns {Promise<boolean>} si la descarga llego a empezar
 */
export const downloadCanvas = (canvas, fileName) =>
  new Promise((resolve) => {
    const supportsBlob =
      typeof canvas.toBlob === 'function' &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL === 'function';

    if (!supportsBlob) {
      clickToDownload(canvas.toDataURL('image/png'), fileName);
      resolve(true);
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        clickToDownload(canvas.toDataURL('image/png'), fileName);
        resolve(true);
        return;
      }
      const url = URL.createObjectURL(blob);
      clickToDownload(url, fileName);
      // Revocar de inmediato puede cortar la descarga; un temporizador es el
      // arreglo de siempre, igual que en `download.js`.
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_LIFETIME_MS);
      resolve(true);
    }, 'image/png');
  });

/** Capturar y descargar, que es lo que quieren los dos sitios que lo usan. */
export const exportElementToPNG = async (element, fileName, options = {}) => {
  const canvas = await captureElement(element, options);
  return downloadCanvas(canvas, fileName);
};
