import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FlipHorizontal, Flashlight, Image, AlertCircle, RefreshCw } from 'lucide-react';
import { playScanFeedback } from '../../utils/audioFeedback';

interface LiveCameraScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onError?: (error: string) => void;
  isScanningActive: boolean;
}

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({
  onBarcodeDetected,
  onError,
  isScanningActive,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'nutriradar-reader-container';

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorchCapability, setHasTorchCapability] = useState<boolean>(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);

        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch (e) {}
        }

        const html5QrCode = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          verbose: false,
        });

        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode },
          config,
          (decodedText) => {
            if (!isMounted) return;
            if (decodedText === lastScanned) return;

            setLastScanned(decodedText);
            playScanFeedback();
            onBarcodeDetected(decodedText);

            setTimeout(() => {
              if (isMounted) setLastScanned(null);
            }, 2500);
          },
          () => {}
        );

        if (isMounted) {
          try {
            const track = (html5QrCode as any).getRunningTrackCapabilities?.();
            if (track && track.torch) {
              setHasTorchCapability(true);
            }
          } catch (e) {}
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Error al iniciar cámara:', err);
        const errorMsg =
          err?.name === 'NotAllowedError'
            ? 'Acceso a la cámara denegado. Puedes permitirlo en los Ajustes del navegador o subir una foto.'
            : 'No se pudo acceder a la cámara. Prueba a subir una foto o utilizar el buscador.';
        setCameraError(errorMsg);
        if (onError) onError(errorMsg);
      }
    };

    if (isScanningActive) {
      startScanner();
    }

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              scannerRef.current?.clear();
            } catch (e) {}
          });
      }
    };
  }, [isScanningActive, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const nextTorch = !torchOn;
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }
      const result = await scannerRef.current.scanFile(file, true);
      playScanFeedback();
      onBarcodeDetected(result);
    } catch (err) {
      setCameraError('No se encontró ningún código de barras legible en la foto.');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-[32px] bg-black border border-white/[0.12] shadow-2xl">
      {/* HTML5 QrCode Stream */}
      <div id={containerId} className="w-full aspect-square bg-black overflow-hidden relative" />

      {/* Apple Camera Viewfinder Brackets */}
      {!cameraError && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          <div className="relative w-64 h-44 rounded-2xl overflow-hidden">
            {/* Apple Camera Minimalist White Corner Brackets */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white/90 rounded-tl-md" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white/90 rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white/90 rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white/90 rounded-br-md" />

            {/* Apple Laser Scanning Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#30d158] to-transparent shadow-[0_0_10px_#30d158] animate-[bounce_2.5s_infinite]" />
          </div>

          <div className="mt-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#f5f5f7]">
            Enfoca el código de barras del producto
          </div>
        </div>
      )}

      {/* Camera Fallback / Error State */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/95 text-center">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.08] text-[#86868b] flex items-center justify-center mb-3">
            <AlertCircle size={22} />
          </div>
          <h4 className="text-[16px] font-bold text-white mb-1">Cámara no disponible</h4>
          <p className="text-[12px] text-[#86868b] max-w-xs mb-4 leading-relaxed">{cameraError}</p>

          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-full bg-white hover:bg-[#e8e8ed] text-black font-semibold text-[13px] tracking-tight flex items-center justify-center gap-2 transition"
            >
              <Image size={15} />
              <span>Seleccionar foto del carrete</span>
            </button>

            <button
              onClick={() => {
                setCameraError(null);
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
              }}
              className="py-2.5 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[13px] font-medium text-white transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={13} />
              <span>Reintentar cámara</span>
            </button>
          </div>
        </div>
      )}

      {/* Apple Camera Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/[0.1]">
        <div className="flex items-center gap-1">
          {/* Flip Camera */}
          <button
            type="button"
            onClick={toggleFacingMode}
            className="w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
            title="Cambiar cámara"
          >
            <FlipHorizontal size={17} />
          </button>

          {/* Flashlight */}
          {hasTorchCapability && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                torchOn ? 'text-[#ff9f0a] bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Linterna"
            >
              <Flashlight size={17} />
            </button>
          )}
        </div>

        {/* Upload from Photos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-[12px] font-medium transition"
        >
          <Image size={14} />
          <span>Fotos</span>
        </button>
      </div>
    </div>
  );
};
