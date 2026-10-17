/**
 * Emite un sonido suave y retroalimentación háptica cuando se escanea con éxito un producto
 */
export function playScanFeedback() {
  // 1. Vibración háptica nativa (si está soportada)
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([40, 30, 50]);
    } catch (e) {
      // Ignorar errores si no hay permisos de vibración
    }
  }

  // 2. Beep suave con Web Audio API (sin descargas externas)
  if (typeof window !== 'undefined') {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Tono armónico ascendente de confirmación (tipo Apple Pay / Escáner Pro)
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Si el navegador bloquea audio antes de interacción, se ignora suavemente
    }
  }
}
