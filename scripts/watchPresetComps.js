#!/usr/bin/env node
/**
 * Vigila src/data/presetComps/ y regenera el index cuando aparece o desaparece
 * una comp.
 *
 * El problema que resuelve: el barril se genera en `prestart`, asi que la
 * libreria que ve la app es la que habia al arrancar el servidor. Sueltas un
 * `.json` en la carpeta y no existe para nadie hasta que reinicias -- de ahi la
 * rutina de escribir cinco comps y volver a levantar todo.
 *
 * Con esto no hace falta: el index se regenera solo, el servidor de desarrollo
 * ya vigila `index.js` porque esta en el grafo de modulos, y la pagina se
 * recarga con las comps nuevas dentro.
 *
 * Dos detalles que lo hacen usable:
 *
 *  - **Antirrebote.** Copiar un fichero dispara varios eventos, y soltar diez de
 *    golpe dispara decenas. Se espera a que pare y se regenera una vez.
 *  - **Solo escribe si cambia** (lo hace `generatePresetCompsIndex`). Reescribir
 *    el mismo contenido dejaria a webpack recompilando en bucle.
 *
 * Usage:
 *   node scripts/watchPresetComps.js      (o `npm run comps:watch`)
 */
const fs = require('fs');
const { generatePresetCompsIndex, presetCompsDir } = require('./generatePresetCompsIndex');

const DEBOUNCE_MS = 300;

const stamp = () => new Date().toLocaleTimeString();

const regenerate = () => {
  try {
    const { files, changed } = generatePresetCompsIndex();
    if (changed) console.log(`[${stamp()}] index regenerado: ${files.length} comps`);
  } catch (err) {
    // Un fallo puntual no puede tumbar el vigilante: el siguiente evento
    // reintenta, y mientras tanto sigues teniendo el index de antes.
    console.error(`[${stamp()}] no se ha podido regenerar el index: ${err.message}`);
  }
};

const initial = generatePresetCompsIndex();
console.log(
  `Vigilando ${presetCompsDir}\n` +
    `${initial.files.length} comps${initial.changed ? ' (index actualizado al arrancar)' : ''}. ` +
    'Ctrl+C para parar.'
);

let timer = null;
fs.watch(presetCompsDir, (eventType, fileName) => {
  // Solo las comps. `index.js` lo escribimos nosotros, y responder a nuestra
  // propia escritura seria el bucle que el antirrebote no arreglaria.
  if (fileName && !fileName.endsWith('.json')) return;
  clearTimeout(timer);
  timer = setTimeout(regenerate, DEBOUNCE_MS);
});
