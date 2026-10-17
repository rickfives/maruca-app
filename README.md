# Maruca - Escáner Inteligente de Salud, Alérgenos y Nutrición

**Maruca** es una aplicación web progresiva (PWA) de salud y bioseguridad alimentaria inspirada en las guías de diseño de Apple (iOS Human Interface Guidelines) y detalles pixel-art retro.

Permite escanear alimentos en tiempo real (mediante cámara, buscador o fotografía de ingredientes), analizar su composición biológica y grado de procesamiento (NOVA 1 a 4, NutriScore), alertar instantáneamente de alérgenos personales y recomendar alternativas más saludables para ahorrar azúcares y grasas saturadas.

---

## ✨ Características Principales

* 🍎 **Radiografía Nutricional Completa**: Algoritmo de puntuación de 0 a 100 basado en ingredientes, calorías, grasas saturadas, azúcares, sal y aditivos E.
* 🛡️ **Radar Biológico de Alérgenos**: Alertas rojas instantáneas para celíacos (Sin Gluten), intolerantes a la lactosa, frutos secos, soja, huevo, etc.
* 🔄 **Recomendaciones y Alternativas Saludables (Swaps)**: Al escanear un alimento no saludable o ultraprocesado, Maruca sugiere una alternativa natural (NOVA 1) indicando el ahorro de azúcar exacto.
* 🥫 **Historial Categorizado**: Alimentos organizados por pestañas: *Bebidas*, *Comidas*, *Salsas*, *Postres* y *Snacks*.
* 🛒 **Cesta de la Compra y Auditoría de Salud**: Calcula el porcentaje de ultraprocesados en tu cesta y detecta el "#1 Peor Producto" para ayudarte a mejorar tus hábitos.
* 🔑 **Sistema de Cuentas y Modo Administrador**:
  * Registro e inicio de sesión seguro con usuario y contraseña.
  * Período de prueba gratuito con 20 escaneos completos.
  * Panel de Control y Analítica en tiempo real para el administrador `@dawsson` con telemetría de usuarios activos, productos más escaneados y sugerencias de optimización.
* ☀️/🌙 **Modo Claro y Modo Oscuro**: Integración fluida con el sistema operativo y conmutador manual en cabecera.

---

## 🛠️ Tecnologías

* **Frontend**: React 19 + TypeScript + Vite 8
* **Estilos**: Tailwind CSS 4 + Framer Motion (animaciones Apple HIG)
* **Base de Datos de Alimentos**: API de Open Food Facts
* **Iconos**: Lucide Icons + Sprite Pixel Art Super Famicom Zelda Heart
* **Lector de Códigos**: HTML5-QRCode + Cámara web / móvil

---

## 🚀 Despliegue en Producción (Vercel / Netlify / GitHub)

### Despliegue en Vercel
1. Conecta este repositorio en [vercel.com](https://vercel.com).
2. Marco detectado automáticamente: **Vite**.
3. Carpeta de salida: `dist`.
4. ¡Listo en menos de 1 minuto con HTTPS y dominio gratuito!

### Despliegue en Netlify
1. Conecta este repositorio en [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`

### Ejecución Local
```bash
npm install
npm run dev
```
Compilar para producción:
```bash
npm run build
npm run preview
```
