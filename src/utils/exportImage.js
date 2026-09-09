/**
 * Sacar un PNG de un trozo de la pagina.
 *
 * ## El color
 *
 * `html2canvas` 1.4.1 solo sabe leer `rgb`, `rgba`, `hsl` y `hsla`, y **lanza**
 * con cualquier otra:
 *
 *     Attempting to parse an unsupported color function "oklch"
 *
 * Tailwind v4 escribe su paleta entera en `oklch()` y cada utilidad con opacidad
 * -- `bg-gray-800/90`, que es el fondo del propio panel de la party -- en
 * `color-mix()`. O sea: la primera propiedad de color que miraba ya lo tumbaba,
 * y salia el toast de "Error exporting image".
 *
 * Esto se arreglo primero traduciendo cada color a `rgb()` antes de capturar,
 * pintandolo en un canvas de 1x1 para que tradujera el navegador. Funcionaba,
 * pero eran ~180 lineas recorriendo el arbol y escribiendo estilos en linea
 * sobre los elementos de verdad para restaurarlos despues.
 *
 * `html2canvas-pro` es la fork mantenida que parsea CSS Color 4 -- `oklch`,
 * `oklab`, `color-mix` -- de serie. La API es la misma, asi que el arreglo
 * pasa a ser la dependencia y la traduccion sobra entera.
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

const DEFAULT_CAPTURE = {
  backgroundColor: '#1f2937', // gray-800
  scale: 2,
  useCORS: true, // los assets viven en raw.githubusercontent.com
  allowTaint: true,
  logging: false
};

/**
 * `html2canvas-pro` sobre un elemento.
 * @returns {Promise<HTMLCanvasElement>}
 */
export const captureElement = async (element, options = {}) => {
  const html2canvas = (await import('html2canvas-pro')).default;
  return html2canvas(element, { ...DEFAULT_CAPTURE, ...options });
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
