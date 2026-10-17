import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ProductCategoryKey, PRODUCT_CATEGORIES } from '../../utils/productClassifier';

interface ProductThumbnailProps {
  src?: string;
  alt?: string;
  className?: string;
  categoryKey?: ProductCategoryKey | string;
  fallbackEmoji?: string;
  fallbackIcon?: React.ReactNode;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  src,
  alt = '',
  className = 'w-12 h-12 rounded-xl object-contain bg-white dark:bg-[#1c1c1e] p-1 shrink-0 border border-black/[0.06] dark:border-white/[0.06]',
  categoryKey,
  fallbackEmoji,
  fallbackIcon,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reiniciar estado si la URL cambia
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Determinar emoji según la categoría si no se proporciona uno explícito
  let displayEmoji = fallbackEmoji;
  if (!displayEmoji && categoryKey && PRODUCT_CATEGORIES[categoryKey as ProductCategoryKey]) {
    displayEmoji = PRODUCT_CATEGORIES[categoryKey as ProductCategoryKey].emoji;
  }

  // Si no hay src o hubo error al cargar la imagen, mostrar fallback visual elegante
  if (!src || hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center select-none overflow-hidden transition-all duration-200`}
        aria-label={alt || 'Producto'}
        title={alt}
      >
        {displayEmoji ? (
          <span className="text-[20px] leading-none transform hover:scale-110 transition-transform">
            {displayEmoji}
          </span>
        ) : fallbackIcon ? (
          fallbackIcon
        ) : (
          <ShoppingBag size={18} className="text-[#86868b] dark:text-[#a1a1a6]" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setHasError(true)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
    />
  );
};
