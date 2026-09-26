import React from 'react';
import {
  Sparkles,
  Layers,
  Package,
  Plus,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'binder' | 'showcase' | 'pack';
  onTabChange: (tab: 'binder' | 'showcase' | 'pack') => void;
  onOpenCreateModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cardCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  soundEnabled,
  onToggleSound,
  cardCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white tracking-wider leading-none">
                TOKKII <span className="text-amber-400">TCG</span>
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/40">
                VISOR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Visor de Cartas Coleccionables por Rareza
            </p>
          </div>
        </div>

        {/* View Modes Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onTabChange('binder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'binder'
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Carpeta / Deck</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {cardCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('showcase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'showcase'
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Showcase Rarezas</span>
          </button>

          <button
            onClick={() => onTabChange('pack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pack'
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir Sobre</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Add / Edit Card Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Carta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
