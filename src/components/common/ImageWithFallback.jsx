import React, { useState, memo, useEffect } from 'react';

const ImageWithFallback = memo(({ src, alt, className, fallback, title, ...rest }) => {
  const [hasError, setHasError] = useState(false);

  // El error es de UNA imagen, no del hueco. Estos componentes se reutilizan por
  // ranura -- los iconos de skill y trinket de una tarjeta, las filas del
  // selector de heroes--, asi que sin este reset la primera imagen que daba 404
  // dejaba la ranura en modo fallback para todas las siguientes, existieran o no.
  useEffect(() => setHasError(false), [src]);

  if (hasError) {
    if (fallback === null) return null;
    if (fallback) return fallback;
    // Default fallback: same dimensions, first letter of alt text
    return (
      <div className={className} title={title || alt}>
        <span className="text-inherit text-gray-500">
          {alt ? alt.charAt(0).toUpperCase() : '?'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      title={title}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
});

ImageWithFallback.displayName = 'ImageWithFallback';

export default ImageWithFallback;
