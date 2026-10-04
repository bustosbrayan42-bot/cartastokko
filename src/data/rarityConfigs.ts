import type { Rarity, RarityConfig } from '../types/card';

export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  common: {
    id: 'common',
    name: 'Común',
    shortName: 'C',
    color: '#94a3b8',
    gradient: 'from-slate-600 to-slate-400',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    borderColor: '#64748b',
    badgeBg: 'bg-slate-700/80 text-slate-200 border-slate-500',
    holoStyle: 'none',
    stars: 1,
    description: 'Acabado mate estándar con marco balanceado y detalles nítidos.'
  },
  uncommon: {
    id: 'uncommon',
    name: 'Poco Común',
    shortName: 'UC',
    color: '#38bdf8',
    gradient: 'from-sky-500 to-blue-400',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    borderColor: '#0284c7',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-500',
    holoStyle: 'silver',
    stars: 2,
    description: 'Bordes metálicos plateados con brillo especular sutil en movimiento.'
  },
  rare: {
    id: 'rare',
    name: 'Rara',
    shortName: 'R',
    color: '#a855f7',
    gradient: 'from-purple-600 to-indigo-400',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    borderColor: '#7e22ce',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500',
    holoStyle: 'prismatic',
    stars: 3,
    description: 'Ilustración con lámina holográfica prismática y reflejo de arcoíris lineal.'
  },
  super_rare: {
    id: 'super_rare',
    name: 'Súper Rara',
    shortName: 'SR',
    color: '#e5c158',
    gradient: 'from-amber-400/80 via-yellow-200/80 to-amber-500/80',
    glowColor: 'rgba(229, 193, 88, 0.32)',
    borderColor: '#b59346',
    badgeBg: 'bg-amber-950/60 text-amber-200 border-amber-500/40',
    holoStyle: 'gold_stars',
    stars: 4,
    description: 'Relieve dorado suave con destellos estelares sutiles y marco champán.'
  },
  ultra_rare: {
    id: 'ultra_rare',
    name: 'Ultra Rara',
    shortName: 'UR',
    color: '#ec4899',
    gradient: 'from-rose-500 via-fuchsia-500 to-cyan-400',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    borderColor: '#db2777',
    badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-500',
    holoStyle: 'cosmic',
    stars: 5,
    description: 'Efecto holográfico cósmico multidireccional con refracción de luz dinámica.'
  },
  secret_rare: {
    id: 'secret_rare',
    name: 'Rara Secreta',
    shortName: 'SEC',
    color: '#10b981',
    gradient: 'from-emerald-400 via-amber-300 to-purple-500',
    glowColor: 'rgba(16, 185, 129, 0.85)',
    borderColor: '#059669',
    badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-400',
    holoStyle: 'prismatic',
    stars: 6,
    description: 'Acabado Masterpiece Full-Art con lámina prismática arcoíris y aura mítica.'
  }
};
