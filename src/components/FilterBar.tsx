import React from 'react';
import type { CardElement, Rarity } from '../types/card';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { ELEMENT_CONFIGS } from '../data/elementConfigs';
import { Search, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  selectedRarity: Rarity | 'all';
  onSelectRarity: (rarity: Rarity | 'all') => void;
  selectedElement: CardElement | 'all';
  onSelectElement: (element: CardElement | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'id' | 'hp' | 'rarity' | 'title';
  onSortChange: (sort: 'id' | 'hp' | 'rarity' | 'title') => void;
  cardCountsByRarity: Record<Rarity, number>;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedRarity,
  onSelectRarity,
  selectedElement,
  onSelectElement,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  cardCountsByRarity,
  totalCount,
}) => {
  const rarities: Rarity[] = [
    'common',
    'uncommon',
    'rare',
    'super_rare',
    'ultra_rare',
    'secret_rare',
  ];

  const elements: CardElement[] = [
    'arte',
    'impulso',
    'ingenio',
    'aura',
    'talento',
    'estilo',
    'aventura',
    'desafio',
    'rutina',
    'leyenda',
  ];

  return (
    <div className="w-full space-y-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/80 backdrop-blur-md">
      {/* Search & Sort Controls Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, ataque o etiqueta..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort and Element select */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Element Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400">Elemento:</span>
            <select
              value={selectedElement}
              onChange={(e) =>
                onSelectElement(e.target.value as CardElement | 'all')
              }
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                Todos los Elementos
              </option>
              {elements.map((el) => (
                <option key={el} value={el} className="bg-slate-900 text-white">
                  {ELEMENT_CONFIGS[el].symbol} {ELEMENT_CONFIGS[el].name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  e.target.value as 'id' | 'hp' | 'rarity' | 'title'
                )
              }
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="rarity" className="bg-slate-900 text-white">
                Mayor Rareza
              </option>
              <option value="id" className="bg-slate-900 text-white">
                Número de Carta
              </option>
              <option value="hp" className="bg-slate-900 text-white">
                Puntos de Vida (HP)
              </option>
              <option value="title" className="bg-slate-900 text-white">
                Nombre (A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Rarity Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {/* ALL TAB */}
        <button
          onClick={() => onSelectRarity('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
            selectedRarity === 'all'
              ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span>Todas las Rarezas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {totalCount}
          </span>
        </button>

        {/* RARITY SPECIFIC TABS */}
        {rarities.map((r) => {
          const cfg = RARITY_CONFIGS[r];
          const isSelected = selectedRarity === r;
          const count = cardCountsByRarity[r] || 0;

          return (
            <button
              key={r}
              onClick={() => onSelectRarity(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-slate-800 text-white border-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span style={{ color: cfg.color }}>{cfg.shortName}</span>
              <span>{cfg.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/80 text-slate-400 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
