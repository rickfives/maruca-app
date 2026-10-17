import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  HealthGoal,
  AllergenKey,
  BlacklistIngredient,
  UserProfile,
} from '../../types';
import {
  Apple,
  Flame,
  Dumbbell,
  HeartPulse,
  Wheat,
  Milk,
  Nut,
  Egg,
  Fish,
  Leaf,
  Check,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>(['clean_eating']);
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenKey[]>([]);
  const [selectedBlacklist, setSelectedBlacklist] = useState<BlacklistIngredient[]>(['palm_oil']);

  if (!isOpen) return null;

  const toggleGoal = (goal: HealthGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleAllergen = (allergen: AllergenKey) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const toggleBlacklist = (item: BlacklistIngredient) => {
    setSelectedBlacklist((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = (isPro: boolean) => {
    if (isPro) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#30d158', '#0071e3', '#ffffff'],
        });
      } catch (e) {}
    }

    const newProfile: UserProfile = {
      hasCompletedOnboarding: true,
      goals: selectedGoals,
      allergens: selectedAllergens,
      blacklistedIngredients: selectedBlacklist,
      isPro,
      freeScansRemaining: isPro ? 9999 : 20,
      createdAt: new Date().toISOString(),
    };

    onComplete(newProfile);

    if (isPro) {
      setTimeout(() => {
        window.location.href = 'https://buy.stripe.com/eVqfZh6gxcYE2uG0oxgQE00';
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.12] rounded-[32px] p-6 sm:p-8 shadow-2xl text-[#1d1d1f] dark:text-white">
        {/* iOS Setup Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-[#1d1d1f] dark:bg-white'
                    : s < step
                    ? 'w-3 bg-black/40 dark:bg-white/50'
                    : 'w-3 bg-black/10 dark:bg-white/15'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-[#86868b] tracking-normal">
            Paso {step} de 4
          </span>
        </div>

        {/* Step 1: Objetivo Principal */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[12px] font-semibold text-[#30d158] uppercase tracking-wider">
                Bienvenido a Maruca
              </span>
              <h2 className="text-[26px] font-bold tracking-tight text-[#1d1d1f] dark:text-white mt-1">
                ¿Cuál es tu objetivo?
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Calibraremos el algoritmo de salud y los umbrales de advertencia.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                {
                  id: 'clean_eating' as HealthGoal,
                  title: 'Comer limpio y evitar ultraprocesados',
                  desc: 'Priorizar NOVA 1 y penalizar aditivos industriales.',
                  icon: Apple,
                },
                {
                  id: 'fat_loss' as HealthGoal,
                  title: 'Control de calorías y azúcares',
                  desc: 'Alertas inmediatas de azúcares libres y picos de insulina.',
                  icon: Flame,
                },
                {
                  id: 'muscle_gain' as HealthGoal,
                  title: 'Ganancia de masa muscular',
                  desc: 'Priorizar densidad proteica de alta asimilación.',
                  icon: Dumbbell,
                },
                {
                  id: 'gut_health' as HealthGoal,
                  title: 'Digestión sana y microbiota',
                  desc: 'Filtrar edulcorantes artificiales, gomas y conservantes.',
                  icon: HeartPulse,
                },
              ].map((g) => {
                const isSelected = selectedGoals.includes(g.id);
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#0071e3] bg-[#0071e3]/10 ring-1 ring-[#0071e3]'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-[#f2f2f7] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white flex items-center justify-center shrink-0">
                      <Icon size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{g.title}</div>
                      <div className="text-[12px] text-[#86868b] truncate">{g.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        isSelected
                          ? 'border-[#0071e3] bg-[#0071e3] text-white'
                          : 'border-black/20 dark:border-white/20 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedGoals.length === 0}
              className="w-full mt-4 py-3.5 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[15px] tracking-tight transition active:scale-[0.98] disabled:opacity-40"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* Step 2: Alérgenos y Restricciones */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[12px] font-semibold text-[#ff453a] uppercase tracking-wider">
                Seguridad Biológica
              </span>
              <h2 className="text-[26px] font-bold tracking-tight text-[#1d1d1f] dark:text-white mt-1">
                Alérgenos Críticos
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Recibirás una alerta roja inmediata en la pantalla ante cualquier coincidencia.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: 'gluten' as AllergenKey, label: 'Sin Gluten (Celíaco)', icon: Wheat },
                { id: 'lactose' as AllergenKey, label: 'Sin Lactosa / Leche', icon: Milk },
                { id: 'nuts' as AllergenKey, label: 'Frutos de Cáscara', icon: Nut },
                { id: 'peanuts' as AllergenKey, label: 'Cacahuetes', icon: Nut },
                { id: 'soy' as AllergenKey, label: 'Soja', icon: Leaf },
                { id: 'egg' as AllergenKey, label: 'Huevo', icon: Egg },
                { id: 'seafood' as AllergenKey, label: 'Pescado / Marisco', icon: Fish },
                { id: 'vegan' as AllergenKey, label: 'Dieta Vegana', icon: Leaf },
                { id: 'vegetarian' as AllergenKey, label: 'Vegetariano', icon: Leaf },
              ].map((item) => {
                const isSelected = selectedAllergens.includes(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAllergen(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-[#ff453a] bg-[#ff453a]/10 ring-1 ring-[#ff453a] text-[#ff453a] dark:text-white font-semibold'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-[#f2f2f7] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.07] text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center shrink-0 text-[#86868b]">
                      <Icon size={14} />
                    </div>
                    <span className="text-[12px] font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[14px] font-medium text-[#1d1d1f] dark:text-white transition"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[15px] tracking-tight transition active:scale-[0.98]"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Lista Negra de Ingredientes */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[12px] font-semibold text-[#ff9f0a] uppercase tracking-wider">
                Filtro de Ingredientes
              </span>
              <h2 className="text-[26px] font-bold tracking-tight text-[#1d1d1f] dark:text-white mt-1">
                Lista Negra Personal
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Ingredientes que prefieres vetar sistemáticamente en tu alimentación.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                {
                  id: 'palm_oil' as BlacklistIngredient,
                  label: 'Aceite de Palma',
                  desc: 'Grasa refinada proinflamatoria y perjudicial para el ecosistema.',
                },
                {
                  id: 'artificial_sweeteners' as BlacklistIngredient,
                  label: 'Edulcorantes artificiales (Aspartamo, Sucralosa, Acesulfamo)',
                  desc: 'Edulcorantes de síntesis que alteran la microbiota y la saciedad.',
                },
                {
                  id: 'added_sugars' as BlacklistIngredient,
                  label: 'Azúcares añadidos y jarabes de glucosa',
                  desc: 'Picos de glucosa sanguínea y fomento de grasa visceral.',
                },
                {
                  id: 'msg_nitrites' as BlacklistIngredient,
                  label: 'Glutamato (E621) y Nitritos cárnicos (E249-E252)',
                  desc: 'Precursores de nitrosaminas en embutidos y carnes curadas.',
                },
              ].map((item) => {
                const isSelected = selectedBlacklist.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleBlacklist(item.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-[#ff9f0a] bg-[#ff9f0a]/10 ring-1 ring-[#ff9f0a]'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-[#f2f2f7] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.07]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 shrink-0 transition ${
                        isSelected
                          ? 'border-[#ff9f0a] bg-[#ff9f0a] text-black'
                          : 'border-black/20 dark:border-white/20 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{item.label}</div>
                      <div className="text-[12px] text-[#86868b] mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[14px] font-medium text-[#1d1d1f] dark:text-white transition"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[15px] tracking-tight transition active:scale-[0.98]"
              >
                Configurar Radar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Conversión Pro / Freemium */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Apple Summary Card */}
            <div className="bg-[#f2f2f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] p-5 rounded-[24px] text-center">
              <div className="w-11 h-11 mx-auto rounded-full bg-[#30d158]/15 text-[#30d158] flex items-center justify-center mb-2.5">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[11px] font-semibold text-[#30d158] uppercase tracking-wider">
                Configuración Completada
              </span>
              <h3 className="text-[20px] font-bold tracking-tight text-[#1d1d1f] dark:text-white mt-1">
                Tu radar biológico está listo
              </h3>
              <p className="text-[12px] text-[#86868b] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Protegiéndote de {selectedAllergens.length} alérgenos y {selectedBlacklist.length} ingredientes restringidos en cada compra.
              </p>
            </div>

            {/* Apple Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleFinish(true)}
                className="w-full py-4 px-4 rounded-full bg-[#1d1d1f] dark:bg-white hover:opacity-90 text-white dark:text-black font-semibold text-[15px] tracking-tight shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <span>Desbloquear Maruca Pro (7 días gratis)</span>
              </button>

              <button
                onClick={() => handleFinish(false)}
                className="w-full py-3 px-4 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white font-medium text-[13px] tracking-normal transition flex items-center justify-center gap-1.5"
              >
                <span>Continuar con 20 productos de prueba gratis</span>
                <ChevronRight size={14} className="text-[#86868b]" />
              </button>
            </div>

            <div className="text-center text-[10px] text-[#86868b]">
              Prueba gratuita de 7 días. Luego solo 4,99 €/mes. Sin permanencia.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
