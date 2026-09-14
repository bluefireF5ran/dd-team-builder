import React from 'react';
import { skillFrame } from '../../utils/skillColours';

/**
 * El marco de color de un icono de skill: lo que la skill hace, en el borde
 * (`skillColours.js`). Es un fondo con relleno en vez de un `border` porque un
 * borde CSS no admite degradado con esquinas redondeadas, y el degradado es
 * justo lo que dice "envenena Y quita resistencia".
 *
 * El hijo (la imagen) tiene que tapar el centro: lleva su propio fondo.
 */
const SkillIconFrame = ({ heroClass, skill, className = '', children }) => {
  const frame = skillFrame(heroClass, skill);
  return (
    <span
      className={`inline-block rounded ${className}`}
      style={{ background: frame.background }}
      data-effects={frame.categories.join(' ')}
    >
      {children}
    </span>
  );
};

export default SkillIconFrame;
