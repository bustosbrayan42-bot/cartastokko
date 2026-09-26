import type { CardElement } from '../types/card';

export interface ElementConfig {
  id: CardElement;
  name: string;
  icon: string;
  symbol: string;
  color: string;
  badgeBg: string;
  borderBg: string;
  bgGradient: string;
}

export const ELEMENT_CONFIGS: Record<CardElement, ElementConfig> = {
  arte: {
    id: 'arte',
    name: 'Arte',
    icon: '🎨',
    symbol: '🎨',
    color: '#fb7185',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    borderBg: 'border-rose-400',
    bgGradient: 'from-rose-950/60 to-pink-900/30'
  },
  impulso: {
    id: 'impulso',
    name: 'Impulso',
    icon: '⚡',
    symbol: '⚡',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    borderBg: 'border-amber-400',
    bgGradient: 'from-amber-950/60 to-yellow-900/30'
  },
  ingenio: {
    id: 'ingenio',
    name: 'Ingenio',
    icon: '🧠',
    symbol: '🧠',
    color: '#ec4899',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    borderBg: 'border-pink-400',
    bgGradient: 'from-pink-950/60 to-fuchsia-900/30'
  },
  aura: {
    id: 'aura',
    name: 'Aura',
    icon: '💖',
    symbol: '💖',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    borderBg: 'border-rose-400',
    bgGradient: 'from-rose-950/60 to-red-900/30'
  },
  talento: {
    id: 'talento',
    name: 'Talento',
    icon: '🛠️',
    symbol: '🛠️',
    color: '#8b5cf6',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
    borderBg: 'border-violet-400',
    bgGradient: 'from-violet-950/60 to-purple-900/30'
  },
  estilo: {
    id: 'estilo',
    name: 'Estilo',
    icon: '✨',
    symbol: '✨',
    color: '#38bdf8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    borderBg: 'border-sky-400',
    bgGradient: 'from-sky-950/60 to-blue-900/30'
  },
  aventura: {
    id: 'aventura',
    name: 'Aventura',
    icon: '🌿',
    symbol: '🌿',
    color: '#22c55e',
    badgeBg: 'bg-green-500/20 text-green-300 border-green-500/50',
    borderBg: 'border-green-500',
    bgGradient: 'from-emerald-950/60 to-teal-900/30'
  },
  desafio: {
    id: 'desafio',
    name: 'Desafío',
    icon: '🏆',
    symbol: '🏆',
    color: '#eab308',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    borderBg: 'border-yellow-400',
    bgGradient: 'from-amber-950/60 to-yellow-900/30'
  },
  rutina: {
    id: 'rutina',
    name: 'Rutina',
    icon: '🏠',
    symbol: '🏠',
    color: '#14b8a6',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
    borderBg: 'border-teal-400',
    bgGradient: 'from-teal-950/60 to-emerald-900/30'
  },
  leyenda: {
    id: 'leyenda',
    name: 'Leyenda',
    icon: '🌟',
    symbol: '🌟',
    color: '#c084fc',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
    borderBg: 'border-purple-300',
    bgGradient: 'from-purple-950/60 to-indigo-900/30'
  }
};
