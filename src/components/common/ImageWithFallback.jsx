import React, { useState, memo } from 'react';

const ImageWithFallback = memo(({ src, alt, className, fallback, title, ...rest }) => {
  const [hasError, setHasError] = useState(false);

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
