import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Trophy,
  ShieldCheck,
  ChevronRight,
  Crown,
  Zap,
  Package
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';
import {
  getRealCalendarInfo,
  checkDailyClaimedStatus,
  claimDailyReward,
  type DailyRewardItem
} from '../services/dailyLoginService';
import { DailyRouletteModal } from './DailyRouletteModal';
import { DirectRewardModal } from './DirectRewardModal';
import type { UserProfile } from '../types/user';

interface DailyLoginViewProps {
  userProfile: UserProfile | null;
  onLoginTwitch?: () => void;
  onSuccessClaimPack: () => void;
  onNavigateToPacks: () => void;
}

export const DailyLoginView: React.FC<DailyLoginViewProps> = ({
  userProfile,
  onLoginTwitch,
  onSuccessClaimPack,
  onNavigateToPacks,
}) => {
  const calendarInfo = getRealCalendarInfo();
  const [isClaimedToday, setIsClaimedToday] = useState<boolean>(false);
  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState<boolean>(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isClaimingDirect, setIsClaimingDirect] = useState<boolean>(false);

  const {
    now,
    year,
    today,
    totalDaysInMonth,
    isLastDayOfMonth,
    currentMonthName,
    todayReward,
    dayCards,
    dateKey,
  } = calendarInfo;

  // Refresh status from Supabase and LocalStorage
  const updateClaimStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const claimed = await checkDailyClaimedStatus(userProfile?.id, dateKey);
      setIsClaimedToday(claimed);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    updateClaimStatus();
  }, [userProfile?.id, dateKey]);

  const handleRewardClaimedFromRoulette = (_item: DailyRewardItem) => {
    setIsClaimedToday(true);
    onSuccessClaimPack();
  };

  // Direct claim handler (Lunes, Martes, Jueves, Viernes, Domingo, o Fin de Mes)
  const handleClaimDirectReward = async () => {
    if (isClaimingDirect || isClaimedToday) return;

    try {
      setIsClaimingDirect(true);
      if (userProfile?.id) {
        await claimDailyReward(userProfile.id, todayReward, dateKey);
      } else {
        localStorage.setItem(`tokkii_daily_login_guest_${dateKey}`, 'true');
      }
      setIsClaimedToday(true);
      onSuccessClaimPack();
      setIsDirectModalOpen(true);
    } catch (err) {
      console.error('Error claiming direct reward:', err);
    } finally {
      setIsClaimingDirect(false);
    }
  };

  const getDayOfWeekName = (date: Date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  };

  const getFullDayOfWeekName = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#290A30] via-[#31213D] to-[#290A30] border border-[#610F4E] p-5 sm:p-6 shadow-2xl overflow-hidden text-center sm:text-left">
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#F50B8C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center select-none">
              <img
                src={resolveImageUrl('/cards/chibi_ref.png')}
                alt="TokkiiPass Chibi"
                className="absolute w-24 h-24 max-w-none object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] -scale-x-100 hover:-scale-x-105 hover:scale-y-105 transition-transform duration-300"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                  <span>TOKKIIPASS</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#F50B8C] text-white">
                    Pase Diario
                  </span>
                </h2>
                <span className="text-xs bg-[#610F4E] text-pink-300 font-bold px-2.5 py-0.5 rounded-full border border-[#F50B8C]/40">
                  {currentMonthName.toUpperCase()} {year}
                </span>
                <span className="text-xs bg-slate-900/80 text-slate-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
                  {totalDaysInMonth} Días
                </span>
              </div>
              <p className="text-xs text-[#B894B3] max-w-lg">
                Reclama tus sobres diarios de lunes a domingo. ¡Los miércoles y sábados prueba tu suerte con la ruleta de azar, y a fin de mes llévate 5 cartas garantizadas!
              </p>
            </div>
          </div>

          {/* Last day of month special banner badge */}
          {isLastDayOfMonth && (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/15 border border-amber-400/50 px-4 py-2.5 rounded-2xl animate-pulse shrink-0">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-[11px] font-black uppercase text-amber-300 block leading-tight">
                  ¡Fin de Mes Especial!
                </span>
                <span className="text-xs text-white font-bold">
                  Sobre de 5 Cartas Garantizado
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LINE OF 5 DAYS (CENTERED ON CURRENT DAY, PRESERVING DAY NUMBERS) */}
      <div className="bg-[#290A30]/80 border border-[#610F4E] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F50B8C]">
            CALENDARIO DE RECOMPENSAS SEMANAL
          </span>
          <h3 className="text-lg font-black text-white">
            {getFullDayOfWeekName(now)} • Día {today} de {currentMonthName}
          </h3>
          <p className="text-xs text-[#B894B3]">
            {isLastDayOfMonth
              ? '🌟 ¡Hoy es el último día del mes! Reclama tu Sobre Legendario de 5 cartas garantizado.'
              : todayReward.isRoulette
              ? '🎲 ¡Hoy es día de ruleta! Prueba tu suerte con los 4 sobres.'
              : `🎁 Recompensa de hoy: ${todayReward.title}.`}
          </p>
        </div>

        {/* 5-Day Horizontal Track */}
        <div className="relative flex items-center justify-between max-w-4xl mx-auto px-2 sm:px-6 md:px-10">
          {/* Connecting track line in background */}
          <div className="absolute top-1/2 left-4 right-4 sm:left-10 sm:right-10 md:left-14 md:right-14 -translate-y-1/2 h-1 bg-[#610F4E]/60 z-0 pointer-events-none rounded-full" />

          {dayCards.map((day) => {
            const isCenterToday = day.isCurrent;
            const reward = day.reward;

            return (
              <div
                key={day.offset}
                className={`relative z-10 flex flex-col items-center justify-between transition-all duration-300 select-none rounded-2xl sm:rounded-3xl ${
                  isCenterToday
                    ? `w-24 sm:w-32 md:w-36 h-36 sm:h-44 md:h-48 bg-gradient-to-b from-[#610F4E] via-[#31213D] to-[#290A30] border-2 border-[#F50B8C] shadow-[0_0_35px_rgba(245,11,140,0.45)] scale-105 sm:scale-110`
                    : day.isPast
                    ? 'w-14 sm:w-20 md:w-24 h-28 sm:h-32 md:h-36 bg-[#1F0724]/90 border border-[#610F4E]/40 opacity-70'
                    : 'w-14 sm:w-20 md:w-24 h-28 sm:h-32 md:h-36 bg-[#1F0724]/90 border border-[#610F4E]/50 opacity-85'
                } p-2 sm:p-2.5`}
              >
                {/* Top: Day of week name */}
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    isCenterToday ? 'text-[#F50B8C]' : day.isPast ? 'text-slate-500' : 'text-[#B894B3]'
                  }`}
                >
                  {getDayOfWeekName(day.date)}
                </span>

                {/* Center: Large Day Number */}
                <div className="flex flex-col items-center my-auto">
                  <span
                    className={`font-black font-mono leading-none ${
                      isCenterToday
                        ? 'text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-[0_0_12px_rgba(245,11,140,0.6)]'
                        : day.isPast
                        ? 'text-xl sm:text-2xl md:text-3xl text-slate-400'
                        : 'text-xl sm:text-2xl md:text-3xl text-slate-200'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {/* Reward Preview Badge for each day */}
                  <span
                    className={`text-[9px] sm:text-[10px] font-black mt-1.5 uppercase tracking-tight px-2 py-0.5 rounded-full border ${
                      reward.isGuaranteedMonthEnd
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                        : reward.isRoulette
                        ? 'bg-pink-500/20 text-pink-300 border-pink-400/50'
                        : reward.cardCount === 3
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                    }`}
                  >
                    {reward.shortLabel}
                  </span>
                </div>

                {/* Bottom: Status Pill */}
                {isCenterToday ? (
                  <span className="text-[9px] sm:text-[10px] bg-[#F50B8C] text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                    HOY
                  </span>
                ) : day.isPast ? (
                  <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase">
                    Pasado
                  </span>
                ) : (
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">
                    Próx.
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* BUTTON: PROBAR SUERTE / RECLAMAR SOBRE (RIGHT BELOW CENTER DAY) */}
        <div className="flex flex-col items-center justify-center pt-2">
          {isClaimedToday ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>¡Ya reclamaste tu TokkiiPass de hoy! Vuelve mañana para tu próxima recompensa.</span>
              </div>

              <button
                type="button"
                onClick={onNavigateToPacks}
                className="text-xs text-[#F50B8C] hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Ir a abrir mis sobres</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : todayReward.isRoulette ? (
            /* Miércoles o Sábado: Ruleta de Azar */
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRouletteModalOpen(true)}
                disabled={isLoadingStatus}
                className="px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-[#F50B8C] via-pink-600 to-[#C1076D] hover:from-[#F50B8C]/90 hover:to-[#A0055A] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#F50B8C]/40 border border-[#F50B8C]/60 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 hover:scale-[1.02]"
              >
                <Sparkles className="w-5 h-5 text-pink-200" />
                <span>Probar suerte (Ruleta de Azar)</span>
              </button>

              <span className="text-[11px] text-[#B894B3]">
                ¡Hoy es {getFullDayOfWeekName(now)}! Gira la ruleta de 4 sobres para definir tu sobre del día.
              </span>
            </div>
          ) : (
            /* Lunes, Martes, Jueves, Viernes, Domingo, o Fin de Mes: Reclamo Directo */
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleClaimDirectReward}
                disabled={isLoadingStatus || isClaimingDirect}
                className={`px-8 sm:px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 hover:scale-[1.02] ${
                  todayReward.isGuaranteedMonthEnd
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black shadow-amber-500/40 border border-amber-300'
                    : todayReward.cardCount === 3
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white shadow-purple-600/40 border border-purple-400/60'
                    : 'bg-gradient-to-r from-[#F50B8C] via-pink-600 to-[#C1076D] text-white shadow-[#F50B8C]/40 border border-[#F50B8C]/60'
                }`}
              >
                {todayReward.isGuaranteedMonthEnd ? (
                  <>
                    <Trophy className="w-5 h-5 text-black" />
                    <span>¡Reclamar Sobre de 5 Cartas Garantizado!</span>
                  </>
                ) : todayReward.cardCount === 3 ? (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-200" />
                    <span>¡Reclamar Sobre de 3 Cartas!</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-pink-200" />
                    <span>Reclamar Sobre de 1 Carta</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-[#B894B3]">
                {todayReward.isGuaranteedMonthEnd
                  ? '¡Último día del mes! Recibe tu sobre legendario de 5 cartas de forma garantizada.'
                  : `Haz clic para recibir instantáneamente tu ${todayReward.title}.`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CALENDARIO SEMANAL DE RECOMPENSAS */}
      <div className="bg-[#290A30]/60 border border-[#610F4E] p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#F50B8C]" />
            <span>Estructura Semanal de Recompensas TokkiiPass</span>
          </div>

          <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fin de mes: Día {totalDaysInMonth} ({currentMonthName}) • 5 Cartas Garantizado</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
          {[
            {
              dayIdx: 1,
              name: 'Lunes',
              packText: 'Sobre 1 Carta',
              textColor: 'text-cyan-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-[#610F4E]/50',
            },
            {
              dayIdx: 2,
              name: 'Martes',
              packText: 'Sobre 1 Carta',
              textColor: 'text-cyan-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-[#610F4E]/50',
            },
            {
              dayIdx: 3,
              name: 'Miércoles',
              packText: 'Ruleta Azar',
              textColor: 'text-[#F50B8C]',
              isDiceOnly: true,
              rotation: '-rotate-[4deg]',
              borderColor: 'border-pink-500/50',
            },
            {
              dayIdx: 4,
              name: 'Jueves',
              packText: 'Sobre 1 Carta',
              textColor: 'text-cyan-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-[#610F4E]/50',
            },
            {
              dayIdx: 5,
              name: 'Viernes',
              packText: 'Sobre 3 Cartas',
              textColor: 'text-purple-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-purple-500/50',
            },
            {
              dayIdx: 6,
              name: 'Sábado',
              packText: 'Ruleta Azar',
              textColor: 'text-[#F50B8C]',
              isDiceOnly: true,
              rotation: '-rotate-[4deg]',
              borderColor: 'border-pink-500/50',
            },
            {
              dayIdx: 0,
              name: 'Domingo',
              packText: 'Sobre 1 Carta',
              textColor: 'text-cyan-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-[#610F4E]/50',
            },
          ].map((item) => {
            const isToday = now.getDay() === item.dayIdx;

            return (
              <div
                key={item.name}
                className={`group p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between ${
                  isToday
                    ? 'bg-[#610F4E]/60 border-[#F50B8C] shadow-[0_0_20px_rgba(245,11,140,0.35)] scale-105 z-10'
                    : `bg-[#1F0724] ${item.borderColor} hover:border-[#F50B8C]/40`
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    {item.name}
                  </span>
                  {isToday && (
                    <span className="text-[9px] bg-[#F50B8C] text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                      HOY
                    </span>
                  )}
                </div>

                {/* Booster Pack Image OR Standalone Styled Dice */}
                <div className="relative w-12 h-16 sm:w-14 sm:h-20 my-2 flex items-center justify-center select-none">
                  {item.isDiceOnly ? (
                    <span
                      className={`text-4xl sm:text-5xl leading-none filter drop-shadow-[0_4px_16px_rgba(245,11,140,0.6)] ${item.rotation} group-hover:rotate-0 group-hover:scale-110 transition-all duration-200 select-none`}
                    >
                      🎲
                    </span>
                  ) : (
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.packText}
                      className={`w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] ${item.rotation} group-hover:rotate-0 group-hover:scale-110 transition-all duration-200 select-none`}
                    />
                  )}
                </div>

                <span className={`block ${item.textColor} font-bold text-xs leading-tight`}>
                  {item.packText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CASILLA LLAMATIVA SOLICITADA: PROXIMAMENTE TOKKIIPASS PREMIUM */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border-2 border-amber-500/60 bg-gradient-to-r from-[#290A30] via-[#3a0d2f] to-[#1F0724] shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center sm:text-left">
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#F50B8C]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#F50B8C_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Crown Icon Container */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-[#F50B8C] flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] shrink-0 animate-bounce duration-1000">
              <Crown className="w-10 h-10 text-black drop-shadow-md" />
              <div className="absolute -bottom-1 -right-1 bg-black text-amber-400 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full border border-amber-400">
                VIP
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Nivel Premium Exclusivo
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#610F4E] text-pink-300 border border-[#F50B8C]/40">
                  Temporada 2026
                </span>
              </div>

              {/* TEXTO GRANDE SOLICITADO */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-pink-400 tracking-wide uppercase drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]">
                PROXIMAMENTE TOKKIIPASS PREMIUM
              </h2>

              <p className="text-xs sm:text-sm text-[#B894B3] max-w-2xl leading-relaxed">
                Podrás optar a todas las recompensas del mes sin perderte ninguna, conseguir sobres especiales exclusivos y acceder a beneficios prioritarios en sorteos para llevar tu colección al siguiente nivel.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-bold">
                <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-amber-500/30 text-amber-200 flex items-center gap-1">
                  ⭐ Todas las Recompensas del Mes
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-pink-500/30 text-pink-200 flex items-center gap-1">
                  ✨ Sobres Especiales Exclusivos
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-purple-500/30 text-purple-200 flex items-center gap-1">
                  🎁 Prioridad en Sorteos
                </span>
              </div>
            </div>
          </div>

          {/* Action / Teaser Badge */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-[#F50B8C] text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 border border-amber-300/50 flex items-center gap-2 select-none">
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>Muy Pronto</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Mantente atento a las novedades
            </span>
          </div>
        </div>
      </div>

      {/* ROULETTE MODAL (MIÉRCOLES Y SÁBADOS) */}
      <DailyRouletteModal
        isOpen={isRouletteModalOpen}
        onClose={() => setIsRouletteModalOpen(false)}
        isLastDayOfMonth={isLastDayOfMonth}
        userProfile={userProfile}
        onLoginTwitch={onLoginTwitch}
        onRewardClaimed={handleRewardClaimedFromRoulette}
        onNavigateToPacks={onNavigateToPacks}
        todayNumber={today}
        dateKey={dateKey}
      />

      {/* DIRECT REWARD MODAL (LUN, MAR, JUE, VIE, DOM, O FIN DE MES) */}
      <DirectRewardModal
        isOpen={isDirectModalOpen}
        onClose={() => setIsDirectModalOpen(false)}
        rewardConfig={todayReward}
        dayName={getFullDayOfWeekName(now)}
        dayNumber={today}
        monthName={currentMonthName}
        onNavigateToPacks={onNavigateToPacks}
      />
    </div>
  );
};
