import React from 'react';
import {
  Home,
  Layers,
  Package,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';

interface NavbarProps {
  activeTab: 'home' | 'binder' | 'showcase' | 'pack';
  onTabChange: (tab: 'home' | 'binder' | 'showcase' | 'pack') => void;
  onOpenCreateModal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cardCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  cardCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#290A30]/90 backdrop-blur-xl border-b border-[#610F4E]/80 shadow-lg">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(245,11,140,0.35)] border border-[#F50B8C]/40 flex items-center justify-center bg-[#31213D] shrink-0">
            <img
              src={resolveImageUrl('/cards/Icono.png')}
              alt="Tokkii Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-black text-lg text-[#F9F1F9] tracking-wider leading-tight">
              EvilTokkii <span className="text-[#F50B8C]">TCG</span>
            </h1>
            <p className="text-[11px] text-[#B894B3] font-medium leading-none">
              Cartas coleccionables por rareza
            </p>
          </div>
        </div>

        {/* View Modes Tabs */}
        <nav className="flex items-center gap-1 bg-[#31213D]/90 p-1 rounded-2xl border border-[#610F4E]">
          <button
            onClick={() => onTabChange('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none border ${
              activeTab === 'home'
                ? 'bg-[#610F4E] text-[#F9F1F9] shadow-sm border-[#F50B8C]/60'
                : 'text-[#B894B3] hover:text-[#F9F1F9] border-transparent hover:bg-[#610F4E]/40'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-[#F50B8C]' : ''}`} />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            onClick={() => onTabChange('binder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none border ${
              activeTab === 'binder'
                ? 'bg-[#610F4E] text-[#F9F1F9] shadow-sm border-[#F50B8C]/60'
                : 'text-[#B894B3] hover:text-[#F9F1F9] border-transparent hover:bg-[#610F4E]/40'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'binder' ? 'text-[#F50B8C]' : ''}`} />
            <span className="hidden sm:inline">Álbum TCG</span>
            <span className="text-[10px] px-1.5 rounded-full bg-[#31213D] text-[#B894B3] font-mono border border-[#610F4E]/60">
              {cardCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('showcase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none border ${
              activeTab === 'showcase'
                ? 'bg-[#610F4E] text-[#F9F1F9] shadow-sm border-[#F50B8C]/60'
                : 'text-[#B894B3] hover:text-[#F9F1F9] border-transparent hover:bg-[#610F4E]/40'
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeTab === 'showcase' ? 'text-[#F50B8C]' : ''}`} />
            <span className="hidden sm:inline">Showcase Rarezas</span>
          </button>

          <button
            onClick={() => onTabChange('pack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none border ${
              activeTab === 'pack'
                ? 'bg-[#610F4E] text-[#F9F1F9] shadow-sm border-[#F50B8C]/60'
                : 'text-[#B894B3] hover:text-[#F9F1F9] border-transparent hover:bg-[#610F4E]/40'
            }`}
          >
            <Package className={`w-4 h-4 ${activeTab === 'pack' ? 'text-[#F50B8C]' : ''}`} />
            <span className="hidden sm:inline">Abrir Sobre</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="w-9 h-9 rounded-xl bg-[#31213D] border border-[#610F4E] text-[#B894B3] hover:text-[#F9F1F9] hover:border-[#F50B8C]/50 flex items-center justify-center transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#F50B8C]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#B894B3]/50" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
