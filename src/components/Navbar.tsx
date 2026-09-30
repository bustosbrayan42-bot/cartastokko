import React from 'react';
import {
  Home,
  Layers,
  Package,
  Volume2,
  VolumeX,
  Sliders,
  LogOut,
  Sparkles
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';
import type { UserProfile, UserPacksCount } from '../types/user';

interface NavbarProps {
  activeTab: 'home' | 'binder' | 'showcase' | 'pack';
  onTabChange: (tab: 'home' | 'binder' | 'showcase' | 'pack') => void;
  onOpenCreateModal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cardCount: number;
  userProfile?: UserProfile | null;
  userPacks?: UserPacksCount;
  onLoginTwitch?: () => void;
  onLogout?: () => void;
  isLoggingIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  cardCount,
  userProfile,
  userPacks,
  onLoginTwitch,
  onLogout,
  isLoggingIn = false,
}) => {
  const totalPacks = (userPacks?.pack_1 || 0) + (userPacks?.pack_3 || 0) + (userPacks?.pack_5 || 0);

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
            {userProfile && totalPacks > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F50B8C] text-white font-bold font-mono animate-pulse">
                {totalPacks}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions: Twitch Login & Sound Toggle */}
        <div className="flex items-center gap-2.5">
          {/* User Profile / Twitch Login Button */}
          {userProfile ? (
            <div className="flex items-center gap-2.5 bg-[#31213D] border border-[#610F4E] rounded-2xl p-1 pr-2 shadow-md">
              {/* 1. Imagen / Avatar */}
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-purple-900 border border-[#F50B8C]/50 flex items-center justify-center shrink-0">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {userProfile.display_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              {/* 2. Nombre */}
              <span className="text-xs font-bold text-white max-w-[150px] truncate leading-normal py-0.5 tracking-wide">
                {userProfile.display_name || userProfile.username}
              </span>

              {/* 3. Cantidad de Sobres */}
              <div className="flex items-center gap-1 bg-[#610F4E]/90 border border-[#F50B8C]/40 px-2 py-1 rounded-xl text-[11px] font-mono font-bold text-[#F9F1F9] shrink-0">
                <Sparkles className="w-3 h-3 text-[#F50B8C]" />
                <span>{totalPacks} {totalPacks === 1 ? 'Sobre' : 'Sobres'}</span>
              </div>

              {/* 4. Botón Cerrar Sesión */}
              <button
                onClick={onLogout}
                title="Cerrar sesión de Twitch"
                className="p-1.5 rounded-lg text-[#B894B3] hover:text-red-400 hover:bg-[#610F4E]/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginTwitch}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#9146FF] hover:bg-[#772CE8] text-white text-xs font-black shadow-lg shadow-[#9146FF]/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
              <span>{isLoggingIn ? 'Conectando...' : 'Iniciar con Twitch'}</span>
            </button>
          )}

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
