import React from 'react';
import { keywordSegments } from '../../utils/keywords';
import { keywordColour } from '../../data/gameColours';

/**
 * Un texto de efecto con sus palabras clave en el color del juego.
 *
 * Seminegrita ademas del color: `stress` es casi blanco en el juego, y sin
 * peso no se distinguiria del resto del texto.
 *
 * Lo que no es un string (una linea que ya es un elemento, como la del bonus
 * de set) pasa tal cual.
 */
const Keywords = ({ text }) => {
  if (typeof text !== 'string') return text ?? null;
  const segments = keywordSegments(text);
  if (!segments.some((s) => s.keyword)) return text;
  return segments.map((segment, i) =>
    segment.keyword ? (
      <span
        key={i}
        data-keyword={segment.keyword}
        className="font-semibold"
        style={{ color: keywordColour(segment.keyword) }}
      >
        {segment.text}
      </span>
    ) : (
      <React.Fragment key={i}>{segment.text}</React.Fragment>
    )
  );
};

export default Keywords;
