import React from 'react';

interface NutriscoreBadgeProps {
  grade?: 'a' | 'b' | 'c' | 'd' | 'e';
  size?: 'sm' | 'md' | 'lg';
}

export const NutriscoreBadge: React.FC<NutriscoreBadgeProps> = ({ grade, size = 'md' }) => {
  if (!grade) {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#86868b] font-medium">
        Nutri-Score no disponible
      </span>
    );
  }

  const grades: Array<{ id: 'a' | 'b' | 'c' | 'd' | 'e'; label: string; bg: string }> = [
    { id: 'a', label: 'A', bg: '#038141' },
    { id: 'b', label: 'B', bg: '#85bb2f' },
    { id: 'c', label: 'C', bg: '#fecb02' },
    { id: 'd', label: 'D', bg: '#ee8100' },
    { id: 'e', label: 'E', bg: '#e63e11' },
  ];

  const current = grade.toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e';

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  };

  return (
    <div className="inline-flex items-center rounded-full bg-[#1c1c1e] p-1 border border-white/[0.08]">
      <span className="text-[9px] font-semibold text-[#86868b] mr-1.5 uppercase tracking-wider pl-1.5">
        Nutri-Score
      </span>
      <div className="flex items-center gap-0.5">
        {grades.map((g) => {
          const isSelected = g.id === current;
          return (
            <span
              key={g.id}
              className={`rounded-full transition-all duration-150 ${
                isSelected
                  ? `${sizeClasses[size]} text-white font-bold shadow-sm scale-105 ring-1 ring-white/30`
                  : 'text-[9px] px-1 text-white/30 font-medium'
              }`}
              style={{
                backgroundColor: isSelected ? g.bg : 'transparent',
                color: isSelected ? '#ffffff' : '#86868b',
              }}
            >
              {g.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

interface NovaBadgeProps {
  group?: 1 | 2 | 3 | 4;
}

export const NovaBadge: React.FC<NovaBadgeProps> = ({ group }) => {
  if (!group) {
    return (
      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#86868b] font-medium">
        NOVA no disponible
      </span>
    );
  }

  const novaConfig = {
    1: { label: 'NOVA 1', sub: 'Natural', color: '#30d158', bg: 'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20' },
    2: { label: 'NOVA 2', sub: 'Culinario', color: '#a4e804', bg: 'bg-[#a4e804]/10 text-[#a4e804] border-[#a4e804]/20' },
    3: { label: 'NOVA 3', sub: 'Procesado', color: '#ff9f0a', bg: 'bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/20' },
    4: { label: 'NOVA 4', sub: 'Ultraprocesado', color: '#ff453a', bg: 'bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/20' },
  }[group];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${novaConfig.bg}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: novaConfig.color }}
      />
      <span className="font-semibold">{novaConfig.label}</span>
      <span className="text-[10px] opacity-70">({novaConfig.sub})</span>
    </div>
  );
};
