import { hasModernColor, rewriteModernColors, normalizeModernColors } from '../exportImage';

// El navegador de verdad traduce con un canvas; jsdom no tiene, asi que aqui se
// inyecta un traductor de mentira. Lo que se prueba es el ESCANEO -- encontrar
// las funciones de color y respetar los parentesis anidados-- que es la parte
// que puede equivocarse.
const fakeConvert = (color) => `rgb(<${color}>)`;

describe('hasModernColor', () => {
  it('reconoce lo que html2canvas 1.4.1 no sabe leer', () => {
    expect(hasModernColor('oklch(27.8% 0.033 256.848)')).toBe(true);
    expect(hasModernColor('color-mix(in oklab, oklch(21% 0.034 264.665) 90%, transparent)')).toBe(true);
    expect(hasModernColor('color(srgb 0.12 0.16 0.21)')).toBe(true);
    expect(hasModernColor('lab(50% 40 59.5)')).toBe(true);
    expect(hasModernColor('oklab(59% 0.1 0.1)')).toBe(true);
    expect(hasModernColor('hwb(194 0% 0%)')).toBe(true);
  });

  it('deja en paz lo que si sabe leer', () => {
    expect(hasModernColor('rgb(31, 41, 55)')).toBe(false);
    expect(hasModernColor('rgba(212, 175, 55, 0.6)')).toBe(false);
    expect(hasModernColor('hsl(0, 100%, 27%)')).toBe(false);
    expect(hasModernColor('#8B0000')).toBe(false);
    expect(hasModernColor('transparent')).toBe(false);
    expect(hasModernColor('none')).toBe(false);
  });

  it('no confunde una palabra que contiene el nombre de una funcion', () => {
    // "color" dentro de un identificador mas largo no abre una funcion.
    expect(hasModernColor('var(--dd-gold-color)')).toBe(false);
    expect(hasModernColor('background-color')).toBe(false);
  });
});

describe('rewriteModernColors', () => {
  it('sustituye un color suelto', () => {
    expect(rewriteModernColors('oklch(27.8% 0.033 256.848)', fakeConvert))
      .toBe('rgb(<oklch(27.8% 0.033 256.848)>)');
  });

  it('respeta los parentesis anidados de color-mix', () => {
    // El fallo facil aqui es cortar en el primer ")" y dejar basura detras.
    const value = 'color-mix(in oklab, oklch(21% 0.034 264.665) 90%, transparent)';
    expect(rewriteModernColors(value, fakeConvert)).toBe(`rgb(<${value}>)`);
  });

  it('sustituye cada color de un valor compuesto y conserva el resto', () => {
    const shadow = '0 0 8px oklch(70% 0.19 22), inset 0 1px 0 rgba(212, 175, 55, 0.16)';
    expect(rewriteModernColors(shadow, fakeConvert))
      .toBe('0 0 8px rgb(<oklch(70% 0.19 22)>), inset 0 1px 0 rgba(212, 175, 55, 0.16)');
  });

  it('entra en los degradados, que llevan los colores dentro', () => {
    const gradient = 'linear-gradient(180deg, oklch(50% 0.1 20), oklch(30% 0.1 20))';
    expect(rewriteModernColors(gradient, fakeConvert))
      .toBe('linear-gradient(180deg, rgb(<oklch(50% 0.1 20)>), rgb(<oklch(30% 0.1 20)>))');
  });

  it('devuelve el valor intacto cuando no hay nada que traducir', () => {
    expect(rewriteModernColors('rgb(31, 41, 55)', fakeConvert)).toBe('rgb(31, 41, 55)');
    expect(rewriteModernColors('', fakeConvert)).toBe('');
    expect(rewriteModernColors(undefined, fakeConvert)).toBeUndefined();
  });

  it('deja el color como estaba si el navegador no sabe traducirlo', () => {
    // Nunca romper el valor: peor que un color raro es un CSS invalido.
    expect(rewriteModernColors('oklch(50% 0.1 20)', () => null)).toBe('oklch(50% 0.1 20)');
  });

  it('no se cuelga con un parentesis sin cerrar', () => {
    expect(rewriteModernColors('oklch(50% 0.1 20', fakeConvert)).toBe('oklch(50% 0.1 20');
  });
});

describe('normalizeModernColors', () => {
  it('devuelve los estilos en linea exactamente como estaban', () => {
    // jsdom no traduce nada, asi que esto solo fija el contrato de restaurar:
    // quien tenia estilo lo conserva y quien no tenia no acaba con uno vacio.
    const root = document.createElement('div');
    const withStyle = document.createElement('span');
    withStyle.setAttribute('style', 'margin-top: -15px');
    const withoutStyle = document.createElement('span');
    root.append(withStyle, withoutStyle);
    document.body.appendChild(root);

    const restore = normalizeModernColors(root);
    restore();

    expect(withStyle.getAttribute('style')).toBe('margin-top: -15px');
    expect(withoutStyle.hasAttribute('style')).toBe(false);
    document.body.removeChild(root);
  });

  it('no explota si le dan nada', () => {
    expect(() => normalizeModernColors(null)()).not.toThrow();
  });
});
