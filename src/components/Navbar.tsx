import React from 'react';
import {
  Home,
  Layers,
  Package,
  Volume2,
  VolumeX,
  Sliders,
  LogOut,
  Sparkles,
  ScrollText,
  Ticket,
  Calendar
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';
import type { UserProfile, UserPacksCount } from '../types/user';

interface NavbarProps {
  activeTab: 'home' | 'binder' | 'showcase' | 'pack' | 'daily' | 'policies';
  onTabChange: (tab: 'home' | 'binder' | 'showcase' | 'pack' | 'daily' | 'policies') => void;
  onOpenCreateModal?: () => void;
  onOpenRedeemModal?: () => void;
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
  onOpenRedeemModal,
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
            <h1 className="font-black text-base sm:text-lg text-[#F9F1F9] tracking-wider leading-tight">
              EvilTokkii <span className="text-[#F50B8C]">TCG</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#B894B3] font-medium leading-none hidden sm:block">
              Cartas coleccionables por rareza
            </p>
          </div>
        </div>

        {/* View Modes Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
          <button
            onClick={() => onTabChange('home')}
            className="flex items-center gap-1.5 py-1 text-xs font-bold cursor-pointer select-none outline-none focus:outline-none transition-all"
          >
            <Home className={`w-4 h-4 transition-all ${activeTab === 'home' ? 'glow-pink-icon' : 'text-[#B894B3]'}`} />
            <span className={`transition-all ${activeTab === 'home' ? 'glow-pink-text' : 'text-[#B894B3] hover:text-[#F9F1F9]'}`}>
              Home
            </span>
          </button>

          <button
            onClick={() => onTabChange('binder')}
            className="flex items-center gap-1.5 py-1 text-xs font-bold cursor-pointer select-none outline-none focus:outline-none transition-all"
          >
            <Layers className={`w-4 h-4 transition-all ${activeTab === 'binder' ? 'glow-pink-icon' : 'text-[#B894B3]'}`} />
            <span className={`transition-all ${activeTab === 'binder' ? 'glow-pink-text' : 'text-[#B894B3] hover:text-[#F9F1F9]'}`}>
              Álbum TCG
            </span>
            <span className="text-[10px] px-1.5 rounded-full bg-[#31213D] text-[#B894B3] font-mono border border-[#610F4E]/60">
              {cardCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('showcase')}
            className="flex items-center gap-1.5 py-1 text-xs font-bold cursor-pointer select-none outline-none focus:outline-none transition-all"
          >
            <Sliders className={`w-4 h-4 transition-all ${activeTab === 'showcase' ? 'glow-pink-icon' : 'text-[#B894B3]'}`} />
            <span className={`transition-all ${activeTab === 'showcase' ? 'glow-pink-text' : 'text-[#B894B3] hover:text-[#F9F1F9]'}`}>
              Showcase Rarezas
            </span>
          </button>

          <button
            onClick={() => onTabChange('pack')}
            className="flex items-center gap-1.5 py-1 text-xs font-bold cursor-pointer select-none outline-none focus:outline-none transition-all"
          >
            <Package className={`w-4 h-4 transition-all ${activeTab === 'pack' ? 'glow-pink-icon' : 'text-[#B894B3]'}`} />
            <span className={`transition-all ${activeTab === 'pack' ? 'glow-pink-text' : 'text-[#B894B3] hover:text-[#F9F1F9]'}`}>
              Abrir Sobre
            </span>
            {userProfile && totalPacks > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F50B8C] text-white font-bold font-mono animate-pulse">
                {totalPacks}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('daily')}
            className="flex items-center gap-1.5 py-1 text-xs font-bold cursor-pointer select-none outline-none focus:outline-none transition-all"
          >
            <Calendar className={`w-4 h-4 transition-all ${activeTab === 'daily' ? 'glow-pink-icon' : 'text-[#B894B3]'}`} />
            <span className={`transition-all ${activeTab === 'daily' ? 'glow-pink-text' : 'text-[#B894B3] hover:text-[#F9F1F9]'}`}>
              TokkiiPass
            </span>
          </button>

          <button
            onClick={() => onTabChange('policies')}
            className="flex items-center gap-1.5 py-1 text-xs font-bold cursor-pointer select-none outline-none focus:outline-none transition-all"
          >
            <ScrollText className={`w-4 h-4 transition-all ${activeTab === 'policies' ? 'glow-pink-icon' : 'text-[#B894B3]'}`} />
            <span className={`transition-all ${activeTab === 'policies' ? 'glow-pink-text' : 'text-[#B894B3] hover:text-[#F9F1F9]'}`}>
              Políticas y Normas
            </span>
          </button>
        </nav>

        {/* Right Actions: Twitch Login & Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Canjear Código Button */}
          {onOpenRedeemModal && (
            <button
              onClick={onOpenRedeemModal}
              title="Canjear código de regalo de sobres"
              className="h-9 flex items-center gap-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#F50B8C] to-[#C1076D] hover:from-[#F50B8C]/90 hover:to-[#A0055A] text-white text-xs font-black shadow-md shadow-[#F50B8C]/35 transition-all active:scale-95 cursor-pointer border border-[#F50B8C]/50"
            >
              <Ticket className="w-3.5 h-3.5 text-pink-100" />
              <span className="hidden md:inline">Canjear Código</span>
            </button>
          )}

          {/* User Profile / Twitch Login Button */}
          {userProfile ? (
            <div className="flex items-center gap-2">
              {/* 1. Imagen / Avatar (igualado al tamaño del botón Canjear Código: h-9 w-9) */}
              <div
                title={`Conectado como ${userProfile.display_name || userProfile.username}`}
                className="w-9 h-9 rounded-xl overflow-hidden bg-purple-900 border border-[#F50B8C]/50 shadow-[0_0_10px_rgba(245,11,140,0.3)] flex items-center justify-center shrink-0 cursor-default"
              >
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

              {/* 2. Cantidad de Sobres en Inventario */}
              <div
                title={`Tienes ${totalPacks} ${totalPacks === 1 ? 'sobre disponible' : 'sobres disponibles'}`}
                className="h-9 flex items-center gap-1.5 sm:gap-2 bg-[#290A30] border border-[#F50B8C]/60 px-2 sm:px-3 rounded-xl shadow-[0_0_10px_rgba(245,11,140,0.2)]"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F50B8C] shrink-0 filter drop-shadow-[0_0_6px_rgba(245,11,140,0.7)]" />
                <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                  {totalPacks} <span className="hidden sm:inline text-xs font-bold text-[#F9F1F9]">{totalPacks === 1 ? 'Sobre' : 'Sobres'}</span>
                </span>
              </div>

              {/* 3. Botón Cerrar Sesión */}
              <button
                onClick={onLogout}
                title={`Cerrar sesión (${userProfile.display_name || userProfile.username})`}
                className="h-9 w-8 sm:w-9 flex items-center justify-center rounded-xl text-[#B894B3] hover:text-red-400 hover:bg-[#610F4E]/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginTwitch}
              disabled={isLoggingIn}
              className="h-9 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 rounded-xl bg-[#9146FF] hover:bg-[#772CE8] text-white text-xs font-black shadow-lg shadow-[#9146FF]/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
              <span>{isLoggingIn ? '...' : 'Twitch'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="w-9 h-9 rounded-xl bg-[#31213D] border border-[#610F4E] text-[#B894B3] hover:text-[#F9F1F9] hover:border-[#F50B8C]/50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#F50B8C]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#B894B3]/50" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for thumb navigation, zero crowding) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#290A30]/95 backdrop-blur-2xl border-t border-[#610F4E] shadow-[0_-4px_25px_rgba(0,0,0,0.7)] px-2 py-1 flex items-center justify-around h-15">
        <button
          onClick={() => onTabChange('home')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer select-none outline-none transition-all active:scale-95"
        >
          <Home className={`w-5 h-5 transition-all ${activeTab === 'home' ? 'text-[#F50B8C] drop-shadow-[0_0_8px_rgba(245,11,140,0.8)]' : 'text-[#B894B3]'}`} />
          <span className={`mt-0.5 leading-none transition-all ${activeTab === 'home' ? 'text-[#F50B8C] font-black' : 'text-[#B894B3]'}`}>
            Home
          </span>
        </button>

        <button
          onClick={() => onTabChange('binder')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer select-none outline-none transition-all active:scale-95 relative"
        >
          <Layers className={`w-5 h-5 transition-all ${activeTab === 'binder' ? 'text-[#F50B8C] drop-shadow-[0_0_8px_rgba(245,11,140,0.8)]' : 'text-[#B894B3]'}`} />
          <span className={`mt-0.5 leading-none transition-all ${activeTab === 'binder' ? 'text-[#F50B8C] font-black' : 'text-[#B894B3]'}`}>
            Álbum
          </span>
          <span className="absolute top-0 right-3 text-[8px] px-1 rounded-full bg-[#31213D] text-[#B894B3] font-mono border border-[#610F4E]">
            {cardCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange('showcase')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer select-none outline-none transition-all active:scale-95"
        >
          <Sliders className={`w-5 h-5 transition-all ${activeTab === 'showcase' ? 'text-[#F50B8C] drop-shadow-[0_0_8px_rgba(245,11,140,0.8)]' : 'text-[#B894B3]'}`} />
          <span className={`mt-0.5 leading-none transition-all ${activeTab === 'showcase' ? 'text-[#F50B8C] font-black' : 'text-[#B894B3]'}`}>
            Rarezas
          </span>
        </button>

        <button
          onClick={() => onTabChange('pack')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer select-none outline-none transition-all active:scale-95 relative"
        >
          <Package className={`w-5 h-5 transition-all ${activeTab === 'pack' ? 'text-[#F50B8C] drop-shadow-[0_0_8px_rgba(245,11,140,0.8)]' : 'text-[#B894B3]'}`} />
          <span className={`mt-0.5 leading-none transition-all ${activeTab === 'pack' ? 'text-[#F50B8C] font-black' : 'text-[#B894B3]'}`}>
            Sobres
          </span>
          {userProfile && totalPacks > 0 && (
            <span className="absolute top-0 right-3 text-[9px] px-1.5 py-0.2 rounded-full bg-[#F50B8C] text-white font-black font-mono animate-pulse shadow-sm">
              {totalPacks}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('daily')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer select-none outline-none transition-all active:scale-95"
        >
          <Calendar className={`w-5 h-5 transition-all ${activeTab === 'daily' ? 'text-[#F50B8C] drop-shadow-[0_0_8px_rgba(245,11,140,0.8)]' : 'text-[#B894B3]'}`} />
          <span className={`mt-0.5 leading-none transition-all ${activeTab === 'daily' ? 'text-[#F50B8C] font-black' : 'text-[#B894B3]'}`}>
            Pass
          </span>
        </button>

        <button
          onClick={() => onTabChange('policies')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer select-none outline-none transition-all active:scale-95"
        >
          <ScrollText className={`w-5 h-5 transition-all ${activeTab === 'policies' ? 'text-[#F50B8C] drop-shadow-[0_0_8px_rgba(245,11,140,0.8)]' : 'text-[#B894B3]'}`} />
          <span className={`mt-0.5 leading-none transition-all ${activeTab === 'policies' ? 'text-[#F50B8C] font-black' : 'text-[#B894B3]'}`}>
            Normas
          </span>
        </button>
      </nav>
    </header>
  );
};
