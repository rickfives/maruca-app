import React from 'react';

interface ZeldaHeartProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const ZeldaHeart: React.FC<ZeldaHeartProps> = ({
  size = 24,
  className = '',
  glow = false,
}) => {
  // Matriz de 13x11 píxeles exacta del contenedor de corazón de Zelda: A Link to the Past (Super Famicom / SNES)
  // Paleta:
  // K: Borde negro/oscuro (#0f0404)
  // W: Brillo blanco (#ffffff)
  // P: Resalte rosa suave (#ffa6b0)
  // L: Resalte rojo claro (#ff4d61)
  // R: Rojo carmesí clásico (#e71d36)
  // D: Sombra rojo oscuro (#8e0e1a)

  return (
    <svg
      width={size}
      height={Math.round((size * 11) / 13)}
      viewBox="0 0 13 11"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_rgba(231,29,54,0.6)]' : ''}`}
      style={{
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Borde Exterior Negro (K) */}
      {/* Fila 0 */}
      <rect x="2" y="0" width="3" height="1" fill="#0c0202" />
      <rect x="8" y="0" width="3" height="1" fill="#0c0202" />

      {/* Fila 1 */}
      <rect x="1" y="1" width="1" height="1" fill="#0c0202" />
      <rect x="5" y="1" width="3" height="1" fill="#0c0202" />
      <rect x="11" y="1" width="1" height="1" fill="#0c0202" />

      {/* Fila 2, 3, 4 */}
      <rect x="0" y="2" width="1" height="3" fill="#0c0202" />
      <rect x="12" y="2" width="1" height="3" fill="#0c0202" />

      {/* Fila 5 */}
      <rect x="1" y="5" width="1" height="1" fill="#0c0202" />
      <rect x="11" y="5" width="1" height="1" fill="#0c0202" />

      {/* Fila 6 */}
      <rect x="2" y="6" width="1" height="1" fill="#0c0202" />
      <rect x="10" y="6" width="1" height="1" fill="#0c0202" />

      {/* Fila 7 */}
      <rect x="3" y="7" width="1" height="1" fill="#0c0202" />
      <rect x="9" y="7" width="1" height="1" fill="#0c0202" />

      {/* Fila 8 */}
      <rect x="4" y="8" width="1" height="1" fill="#0c0202" />
      <rect x="8" y="8" width="1" height="1" fill="#0c0202" />

      {/* Fila 9 */}
      <rect x="5" y="9" width="1" height="1" fill="#0c0202" />
      <rect x="7" y="9" width="1" height="1" fill="#0c0202" />

      {/* Fila 10 */}
      <rect x="6" y="10" width="1" height="1" fill="#0c0202" />

      {/* 2. Relleno Rojo Principal (R) */}
      {/* Fila 1 */}
      <rect x="4" y="1" width="1" height="1" fill="#ff4d61" />
      <rect x="8" y="1" width="3" height="1" fill="#e71d36" />

      {/* Fila 2 */}
      <rect x="4" y="2" width="7" height="1" fill="#e71d36" />

      {/* Fila 3 */}
      <rect x="2" y="3" width="9" height="1" fill="#e71d36" />

      {/* Fila 4 */}
      <rect x="1" y="4" width="10" height="1" fill="#e71d36" />

      {/* Fila 5 */}
      <rect x="2" y="5" width="8" height="1" fill="#e71d36" />

      {/* Fila 6 */}
      <rect x="3" y="6" width="6" height="1" fill="#e71d36" />

      {/* Fila 7 */}
      <rect x="4" y="7" width="4" height="1" fill="#e71d36" />

      {/* Fila 8 */}
      <rect x="5" y="8" width="2" height="1" fill="#e71d36" />

      {/* 3. Brillo y Reflejo Pixelado (W & P) */}
      {/* Fila 1 */}
      <rect x="2" y="1" width="2" height="1" fill="#ffffff" />

      {/* Fila 2 */}
      <rect x="1" y="2" width="2" height="1" fill="#ffffff" />
      <rect x="3" y="2" width="1" height="1" fill="#ffa6b0" />

      {/* Fila 3 */}
      <rect x="1" y="3" width="1" height="1" fill="#ffffff" />

      {/* 4. Sombra Inferior/Derecha 16-Bit (D) */}
      <rect x="11" y="2" width="1" height="3" fill="#8e0e1a" />
      <rect x="10" y="5" width="1" height="1" fill="#8e0e1a" />
      <rect x="9" y="6" width="1" height="1" fill="#8e0e1a" />
      <rect x="8" y="7" width="1" height="1" fill="#8e0e1a" />
      <rect x="7" y="8" width="1" height="1" fill="#8e0e1a" />
      <rect x="6" y="9" width="1" height="1" fill="#8e0e1a" />
    </svg>
  );
};
