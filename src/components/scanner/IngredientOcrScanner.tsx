import React, { useState, useRef } from 'react';
import { Camera, FileText, Upload, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { ScannedProduct } from '../../types';
import { parseRawIngredientText, analyzeImageWithGemini } from '../../services/geminiOcr';
import { playScanFeedback } from '../../utils/audioFeedback';

interface IngredientOcrScannerProps {
  onParsedProduct: (product: ScannedProduct) => void;
}

export const IngredientOcrScanner: React.FC<IngredientOcrScannerProps> = ({
  onParsedProduct,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'text'>('upload');
  const [ingredientText, setIngredientText] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const product = await analyzeImageWithGemini(file, '');
      playScanFeedback();
      onParsedProduct(product);
    } catch (err) {
      console.error('Error procesando foto:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseText = () => {
    if (!ingredientText.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const product = parseRawIngredientText(
        ingredientText,
        productTitle.trim() || 'Producto por Ingredientes'
      );
      playScanFeedback();
      onParsedProduct(product);
      setIsProcessing(false);
    }, 350);
  };

  const loadExampleText = () => {
    setProductTitle('Galletas Rellenas de Cacao');
    setIngredientText(
      'Harina de trigo (gluten), azúcar (28g por 100g), aceite vegetal de palma, suero de leche en polvo (lactosa), cacao desgrasado en polvo 4,5%, emulgente (lecitina de soja E322), aroma, conservador (E250 nitrito de sodio).'
    );
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Apple Segmented Control */}
      <div className="flex bg-black/[0.06] dark:bg-[#1c1c1e] p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex-1 py-1.5 text-[12px] font-semibold rounded-full transition flex items-center justify-center gap-1.5 ${
            activeMode === 'upload'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <Camera size={14} />
          <span>Foto de Etiqueta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('text')}
          className={`flex-1 py-1.5 text-[12px] font-semibold rounded-full transition flex items-center justify-center gap-1.5 ${
            activeMode === 'text'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <FileText size={14} />
          <span>Pegar Ingredientes</span>
        </button>
      </div>

      {/* Mode 1: Photo Upload */}
      {activeMode === 'upload' && (
        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-6 text-center space-y-4 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelected}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 rounded-2xl p-7 cursor-pointer transition flex flex-col items-center justify-center gap-3 bg-black/[0.02] dark:bg-white/[0.02]"
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Vista previa"
                className="w-28 h-28 object-cover rounded-xl border border-black/10 dark:border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white flex items-center justify-center">
                <Upload size={22} />
              </div>
            )}

            <div>
              <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                Captura la lista de ingredientes
              </div>
              <div className="text-[12px] text-[#86868b] mt-0.5">
                La IA transcribirá los aditivos, macros y alérgenos
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              className="mt-1 py-2 px-4 rounded-full bg-black/[0.05] hover:bg-black/[0.08] dark:bg-white/10 dark:hover:bg-white/15 text-[12px] font-semibold text-[#1d1d1f] dark:text-white transition flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={13} className="animate-spin text-[#30d158]" />
                  <span>Analizando etiqueta...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-[#30d158]" />
                  <span>Elegir foto o cámara</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-[#86868b]">
            ⚡ Reconocimiento inteligente de ingredientes
          </div>
        </div>
      )}

      {/* Mode 2: Paste Text */}
      {activeMode === 'text' && (
        <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-[#86868b]">
              Nombre del producto (opcional):
            </label>
            <button
              type="button"
              onClick={loadExampleText}
              className="text-[11px] text-[#0071e3] hover:underline flex items-center gap-1 font-medium"
            >
              <Wand2 size={11} /> Cargar ejemplo
            </button>
          </div>

          <input
            type="text"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            placeholder="Ej. Galletas rellenas de cacao"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#f2f2f7] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[13px] text-[#1d1d1f] dark:text-white outline-none"
          />

          <label className="block text-[12px] font-semibold text-[#86868b]">
            Lista de ingredientes o tabla nutricional:
          </label>
          <textarea
            rows={4}
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            placeholder="Ej: Harina de trigo, azúcar (22g), aceite de palma, suero lácteo, emulgente E322..."
            className="w-full p-3.5 rounded-xl bg-[#f2f2f7] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] focus:border-[#0071e3] text-[13px] text-[#1d1d1f] dark:text-white outline-none resize-none leading-relaxed"
          />

          <button
            type="button"
            onClick={handleParseText}
            disabled={!ingredientText.trim() || isProcessing}
            className="w-full py-3.5 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[14px] tracking-tight flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-40"
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>Analizar Radiografía</span>
          </button>
        </div>
      )}
    </div>
  );
};
