import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Trophy,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Crown,
  Package,
  Plus,
  Star,
  MessageSquare,
  Lock,
  Tv,
  Heart,
  Tag,
  Coins,
  Send,
  X,
  Loader2
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';
import {
  getRealCalendarInfo,
  checkDailyClaimedStatus,
  claimDailyReward,
  checkUserTokkiiPassPremium,
  type DailyRewardItem,
  type TokkiiPassPremiumStatus
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
  const [premiumStatus, setPremiumStatus] = useState<TokkiiPassPremiumStatus>({
    isPremium: false,
    daysRemaining: 0,
    expiresAt: null,
  });
  const [lastClaimResult, setLastClaimResult] = useState<{
    isPremium?: boolean;
    premiumBonusText?: string;
  } | null>(null);

  const premiumInfoRef = useRef<HTMLDivElement>(null);

  // Estados para modal de solicitud TokkiiPass Premium vía Discord Webhook
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [discordUsername, setDiscordUsername] = useState<string>('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1569198767033286749/vFW4RtOIWFyYRl4C1XR3lretG4uk-Whf9vRS1jqixNXbqTlsLiJLz9rPrddJMQojQyB2';

  const handleSendDiscordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDiscord = discordUsername.trim();
    if (!cleanDiscord) {
      setRequestError('Por favor escribe tu usuario de Discord.');
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setRequestError(null);

      const twitchUserLabel = userProfile?.display_name
        ? `@${userProfile.display_name} (${userProfile.username || ''})`
        : 'No conectado en Twitch';

      const payload = {
        content: '👑 **¡Nueva Solicitud de TokkiiPass Premium recibida!**',
        embeds: [
          {
            title: '👑 Solicitud de Membresía: TokkiiPass Premium',
            description: 'Un usuario ha solicitado la membresía oficial **TokkiiPass Premium (30 Días)** mediante la plataforma web.',
            color: 16763904, // Dorado / Amber #FFD700
            fields: [
              {
                name: '💬 Usuario de Discord para Contactar',
                value: `**${cleanDiscord}**`,
                inline: true
              },
              {
                name: '🎮 Usuario en Web / Twitch',
                value: twitchUserLabel,
                inline: true
              },
              {
                name: '💰 Valor de Membresía',
                value: '$2 USD (Oferta de Lanzamiento)',
                inline: true
              },
              {
                name: '⏳ Duración',
                value: '30 Días Continuos',
                inline: true
              },
              {
                name: '📌 Instrucciones para el Staff',
                value: 'Enviar mensaje directo o solicitud de amistad en Discord al usuario para acordar medio de pago (o conversión de moneda local) y realizar la activación manual.',
                inline: false
              }
            ],
            footer: {
              text: 'EvilTokkii TCG • Sistema Oficial de Membresías'
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Error al contactar con Discord (Status: ${res.status})`);
      }

      setRequestSuccess(true);
    } catch (err: any) {
      console.error('Error enviando webhook de Discord:', err);
      setRequestError(err.message || 'Hubo un error al enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleScrollToPremiumInfo = () => {
    premiumInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

      if (userProfile?.id) {
        const pStatus = await checkUserTokkiiPassPremium(userProfile.id);
        setPremiumStatus(pStatus);
      } else {
        setPremiumStatus({ isPremium: false, daysRemaining: 0, expiresAt: null });
      }
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
        const res = await claimDailyReward(userProfile.id, todayReward, dateKey);
        setLastClaimResult(res);
      } else {
        localStorage.setItem(`tokkii_daily_login_guest_${dateKey}`, 'true');
        setLastClaimResult({ isPremium: false });
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

      {/* CASILLA DE AVISO: DISPONIBLE NUEVO TOKKIIPASS PREMIUM */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#241704]/95 via-[#381f0b]/90 to-[#241704]/95 border-2 border-amber-500/60 p-4 sm:p-5 shadow-[0_4px_30px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Glow ambient background circles */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/40 shrink-0">
            <Crown className="w-6 h-6 fill-current text-slate-950" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-wide flex items-center justify-center sm:justify-start gap-2">
              <span>Disponible nuevo TokkiiPass Premium</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h3>
            <p className="text-xs text-amber-300/80">
              Duplica tus recompensas de lunes a sábado y desbloquea 5 sobres de 5 cartas garantizados cada domingo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScrollToPremiumInfo}
          className="relative shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Saber más</span>
          <ChevronDown className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      {/* LINE OF 5 DAYS (CENTERED ON CURRENT DAY, PRESERVING DAY NUMBERS) */}
      <div
        className={`rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8 transition-colors duration-500 ${
          premiumStatus.isPremium
            ? 'bg-gradient-to-b from-[#241704]/90 via-[#200d24]/90 to-[#18071e]/90 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
            : 'bg-[#290A30]/80 border border-[#610F4E]'
        }`}
      >
        <div className="text-center space-y-1">
          {premiumStatus.isPremium ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-300">
                CALENDARIO SEMANAL • TOKKIIPASS PREMIUM
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F50B8C]">
              CALENDARIO DE RECOMPENSAS SEMANAL
            </span>
          )}
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
        <div className="relative flex items-center justify-between max-w-4xl mx-auto px-1 xs:px-2 sm:px-6 md:px-10">
          {/* Connecting track line in background */}
          <div
            className={`absolute top-1/2 left-4 right-4 sm:left-10 sm:right-10 md:left-14 md:right-14 -translate-y-1/2 h-1 z-0 pointer-events-none rounded-full transition-colors ${
              premiumStatus.isPremium
                ? 'bg-gradient-to-r from-amber-500/30 via-amber-400/60 to-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-[#610F4E]/60'
            }`}
          />

          {dayCards.map((day) => {
            const isCenterToday = day.isCurrent;
            const reward = day.reward;

            return (
              <div
                key={day.offset}
                className={`relative z-10 flex flex-col items-center justify-between transition-all duration-300 select-none rounded-xl xs:rounded-2xl sm:rounded-3xl ${
                  isCenterToday
                    ? premiumStatus.isPremium
                      ? 'w-[76px] xs:w-24 sm:w-32 md:w-36 h-32 xs:h-36 sm:h-44 md:h-48 bg-gradient-to-b from-[#78350f] via-[#451e05] to-[#201004] border-2 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.7)] scale-105 sm:scale-110'
                      : 'w-[76px] xs:w-24 sm:w-32 md:w-36 h-32 xs:h-36 sm:h-44 md:h-48 bg-gradient-to-b from-[#610F4E] via-[#31213D] to-[#290A30] border-2 border-[#F50B8C] shadow-[0_0_35px_rgba(245,11,140,0.45)] scale-105 sm:scale-110'
                    : day.isPast
                    ? premiumStatus.isPremium
                      ? 'w-11 xs:w-14 sm:w-20 md:w-24 h-24 xs:h-28 sm:h-32 md:h-36 bg-[#241704]/80 border border-amber-500/30 opacity-70'
                      : 'w-11 xs:w-14 sm:w-20 md:w-24 h-24 xs:h-28 sm:h-32 md:h-36 bg-[#1F0724]/90 border border-[#610F4E]/40 opacity-70'
                    : premiumStatus.isPremium
                    ? 'w-11 xs:w-14 sm:w-20 md:w-24 h-24 xs:h-28 sm:h-32 md:h-36 bg-[#241704]/90 border border-amber-500/40 opacity-85'
                    : 'w-11 xs:w-14 sm:w-20 md:w-24 h-24 xs:h-28 sm:h-32 md:h-36 bg-[#1F0724]/90 border border-[#610F4E]/50 opacity-85'
                } p-1 xs:p-2 sm:p-2.5`}
              >
                {/* Top: Day of week name */}
                <span
                  className={`text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    isCenterToday
                      ? premiumStatus.isPremium
                        ? 'text-amber-300'
                        : 'text-[#F50B8C]'
                      : day.isPast
                      ? 'text-slate-500'
                      : premiumStatus.isPremium
                      ? 'text-amber-200/80'
                      : 'text-[#B894B3]'
                  }`}
                >
                  {getDayOfWeekName(day.date)}
                </span>

                {/* Center: Large Day Number */}
                <div className="flex flex-col items-center my-auto">
                  <span
                    className={`font-black font-mono leading-none ${
                      isCenterToday
                        ? premiumStatus.isPremium
                          ? 'text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.85)]'
                          : 'text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-[0_0_12px_rgba(245,11,140,0.6)]'
                        : day.isPast
                        ? 'text-base xs:text-xl sm:text-2xl md:text-3xl text-slate-400'
                        : 'text-base xs:text-xl sm:text-2xl md:text-3xl text-slate-200'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {/* Reward Preview Badge for each day */}
                  <span
                    className={`text-[7px] xs:text-[9px] sm:text-[10px] font-black mt-1 uppercase tracking-tight px-1 xs:px-2 py-0.5 rounded-full border ${
                      premiumStatus.isPremium && isCenterToday
                        ? 'bg-amber-500/30 text-amber-200 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : reward.isGuaranteedMonthEnd
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                        : reward.isRoulette
                        ? 'bg-pink-500/20 text-pink-300 border-pink-400/50'
                        : reward.cardCount === 3
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                    }`}
                  >
                    {premiumStatus.isPremium && isCenterToday
                      ? day.date.getDay() === 0
                        ? '1 + 5x5 ★'
                        : `${reward.shortLabel} x2`
                      : reward.shortLabel}
                  </span>
                </div>

                {/* Bottom: Status Pill */}
                {isCenterToday ? (
                  <span
                    className={`text-[8px] xs:text-[9px] sm:text-[10px] font-black px-1.5 xs:px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse ${
                      premiumStatus.isPremium
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-amber-500/40'
                        : 'bg-[#F50B8C] text-white'
                    }`}
                  >
                    HOY
                  </span>
                ) : day.isPast ? (
                  <span className="text-[7px] xs:text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase">
                    Pasado
                  </span>
                ) : (
                  <span className="text-[7px] xs:text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">
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
              <div
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border text-xs sm:text-sm font-bold shadow-lg ${
                  premiumStatus.isPremium
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-amber-500/20'
                    : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {premiumStatus.isPremium ? (
                  <Crown className="w-5 h-5 text-amber-400 fill-current shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <span>
                  {premiumStatus.isPremium
                    ? '¡Ya reclamaste tus recompensas dobles de hoy! Vuelve mañana por más.'
                    : '¡Ya reclamaste tu TokkiiPass de hoy! Vuelve mañana para tu próxima recompensa.'}
                </span>
              </div>

              <button
                type="button"
                onClick={onNavigateToPacks}
                className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  premiumStatus.isPremium
                    ? 'text-amber-400 hover:text-white'
                    : 'text-[#F50B8C] hover:text-white'
                }`}
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
                className={`px-8 sm:px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 hover:scale-[1.02] ${
                  premiumStatus.isPremium
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/50 border-2 border-yellow-200'
                    : 'bg-gradient-to-r from-[#F50B8C] via-pink-600 to-[#C1076D] hover:from-[#F50B8C]/90 hover:to-[#A0055A] text-white shadow-[#F50B8C]/40 border border-[#F50B8C]/60'
                }`}
              >
                {premiumStatus.isPremium ? (
                  <>
                    <Crown className="w-5 h-5 text-slate-950 fill-current" />
                    <span>¡Girar Ruleta x2 (TokkiiPass Premium)!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-pink-200" />
                    <span>Probar suerte (Ruleta de Azar)</span>
                  </>
                )}
              </button>

              <span className={`text-[11px] ${premiumStatus.isPremium ? 'text-amber-300/90' : 'text-[#B894B3]'}`}>
                {premiumStatus.isPremium
                  ? '👑 ¡TokkiiPass Premium Activo! Tu premio de la ruleta se duplicará automáticamente al girar.'
                  : `¡Hoy es ${getFullDayOfWeekName(now)}! Gira la ruleta de 4 sobres para definir tu sobre del día.`}
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
                  premiumStatus.isPremium
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-2xl shadow-amber-500/50 border-2 border-yellow-200'
                    : todayReward.isGuaranteedMonthEnd
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black shadow-amber-500/40 border border-amber-300'
                    : todayReward.cardCount === 3
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white shadow-purple-600/40 border border-purple-400/60'
                    : 'bg-gradient-to-r from-[#F50B8C] via-pink-600 to-[#C1076D] text-white shadow-[#F50B8C]/40 border border-[#F50B8C]/60'
                }`}
              >
                {premiumStatus.isPremium ? (
                  <>
                    <Crown className="w-5 h-5 text-slate-950 fill-current" />
                    <span>
                      {now.getDay() === 0
                        ? '¡Reclamar 1 Carta + 5 Sobres de 5 Cartas!'
                        : todayReward.isGuaranteedMonthEnd
                        ? '¡Reclamar 2x Sobres de 5 Cartas (Premium)!'
                        : todayReward.cardCount === 3
                        ? '¡Reclamar 2x Sobres de 3 Cartas (Premium)!'
                        : '¡Reclamar 2x Sobres de 1 Carta (Premium)!'}
                    </span>
                  </>
                ) : todayReward.isGuaranteedMonthEnd ? (
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

              <span className={`text-[11px] ${premiumStatus.isPremium ? 'text-amber-300/90 font-medium' : 'text-[#B894B3]'}`}>
                {premiumStatus.isPremium
                  ? now.getDay() === 0
                    ? '👑 ¡Domingo Legendario! Recibes 1 sobre normal + 5 sobres de 5 cartas de TokkiiPass Premium.'
                    : `👑 TokkiiPass Premium Activo: Recibirás tu recompensa duplicada hoy (+1 sobre extra).`
                  : todayReward.isGuaranteedMonthEnd
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

      {/* ========================================================
          SEPARADOR "+" VISUAL ENTRE TOKKIIPASS GRATUITO Y PREMIUM
          ======================================================== */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-amber-500/40" />
        </div>
        <div className="relative flex items-center gap-2.5 bg-gradient-to-r from-[#241704] via-[#3a2008] to-[#241704] px-5 sm:px-8 py-2 rounded-full border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.45)] select-none">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 text-black stroke-[3]" />
          </div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
            Suma de Recompensas con TokkiiPass Premium
          </span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 text-black stroke-[3]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          ESTRUCTURA SEMANAL DE RECOMPENSAS TOKKIIPASS PREMIUM
          (Recompensas Duplicadas + 5 Sobres de 5 Cartas el Domingo)
          ======================================================== */}
      <div className="bg-gradient-to-b from-[#241704]/90 via-[#1d1124]/95 to-[#16081c]/95 border-2 border-amber-500/60 p-5 sm:p-6 rounded-3xl space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-white font-black text-xs sm:text-sm uppercase tracking-wider">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md text-black">
              <Crown className="w-4 h-4 fill-black" />
            </div>
            <div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400">
                Estructura Semanal TokkiiPass Premium
              </span>
              <span className="text-[10px] text-amber-200/70 font-mono font-normal block sm:inline sm:ml-2">
                (Obtención Duplicada + Domingo Legendario)
              </span>
            </div>
          </div>

          {premiumStatus.isPremium ? (
            <div className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>PASE ACTIVO • Quedan {premiumStatus.daysRemaining} días</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-amber-300/80 bg-black/40 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>30 Días de Beneficios al Activar</span>
            </div>
          )}
        </div>

        {/* 7 DAYS PREMIUM GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
          {[
            {
              dayIdx: 1,
              name: 'Lunes',
              packText: '+1 Sobre (1 Carta)',
              bonusTag: 'Duplicado',
              textColor: 'text-amber-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-amber-500/40',
            },
            {
              dayIdx: 2,
              name: 'Martes',
              packText: '+1 Sobre (1 Carta)',
              bonusTag: 'Duplicado',
              textColor: 'text-amber-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-amber-500/40',
            },
            {
              dayIdx: 3,
              name: 'Miércoles',
              packText: 'Ruleta x2',
              bonusTag: 'Doble Premio',
              textColor: 'text-amber-400',
              isDiceOnly: true,
              rotation: '-rotate-[4deg]',
              borderColor: 'border-yellow-500/50',
            },
            {
              dayIdx: 4,
              name: 'Jueves',
              packText: '+1 Sobre (1 Carta)',
              bonusTag: 'Duplicado',
              textColor: 'text-amber-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-amber-500/40',
            },
            {
              dayIdx: 5,
              name: 'Viernes',
              packText: '+1 Sobre (3 Cartas)',
              bonusTag: 'Duplicado',
              textColor: 'text-amber-300',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: '-rotate-[6deg]',
              borderColor: 'border-amber-500/40',
            },
            {
              dayIdx: 6,
              name: 'Sábado',
              packText: 'Ruleta x2',
              bonusTag: 'Doble Premio',
              textColor: 'text-amber-400',
              isDiceOnly: true,
              rotation: '-rotate-[4deg]',
              borderColor: 'border-yellow-500/50',
            },
            {
              dayIdx: 0,
              name: 'Domingo',
              packText: '5 Sobres (5 Cartas)',
              bonusTag: '25 Cartas 🌟',
              textColor: 'text-yellow-200 font-black',
              image: '/cards/Imagen_Sobre_3.png',
              rotation: 'rotate-[4deg]',
              isSpecialSunday: true,
              borderColor: 'border-amber-400',
            },
          ].map((item) => {
            const isToday = now.getDay() === item.dayIdx;

            return (
              <div
                key={`premium-${item.name}`}
                className={`group p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between ${
                  item.isSpecialSunday
                    ? 'bg-gradient-to-b from-amber-950/70 via-yellow-950/50 to-[#241704] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-102 sm:scale-105 z-10'
                    : isToday
                    ? 'bg-[#3d2703]/60 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-105 z-10'
                    : `bg-[#1a0e02]/70 ${item.borderColor} hover:border-amber-400/50`
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-200/90 uppercase tracking-wider">
                    {item.name}
                  </span>
                  {item.isSpecialSunday ? (
                    <span className="text-[8px] bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black px-1.5 py-0.2 rounded-full uppercase shadow">
                      ÉPICO
                    </span>
                  ) : isToday ? (
                    <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded-full uppercase">
                      HOY
                    </span>
                  ) : (
                    <span className="text-[8px] text-amber-400/80 font-mono font-bold">
                      VIP
                    </span>
                  )}
                </div>

                {/* Booster Pack Image OR Styled Dice */}
                <div className="relative w-12 h-16 sm:w-14 sm:h-20 my-2 flex items-center justify-center select-none">
                  {item.isDiceOnly ? (
                    <span
                      className={`text-4xl sm:text-5xl leading-none filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.7)] ${item.rotation} group-hover:rotate-0 group-hover:scale-110 transition-all duration-200 select-none`}
                    >
                      🎲
                    </span>
                  ) : (
                    <>
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.packText}
                        className={`w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] ${item.rotation} group-hover:rotate-0 group-hover:scale-110 transition-all duration-200 select-none`}
                      />
                      {item.isSpecialSunday && (
                        <div className="absolute -top-1.5 -right-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-lg border border-yellow-100 flex items-center gap-0.5 animate-bounce">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>5x5</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-0.5 w-full">
                  <span className={`block ${item.textColor} font-bold text-[11px] sm:text-xs leading-tight`}>
                    {item.packText}
                  </span>
                  <span className="block text-[9px] font-mono text-amber-300/80">
                    {item.bonusTag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* PREMIUM STATUS / ACTIVATION INFO CARD */}
        <div className="pt-2 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-xs sm:text-sm font-black text-amber-200">
                {premiumStatus.isPremium
                  ? '¡Tu suscripción a TokkiiPass Premium está completamente activa!'
                  : '¿Cómo activar TokkiiPass Premium por 30 Días?'}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                {premiumStatus.isPremium
                  ? `Disfruta de tus recompensas dobles todos los días y 5 sobres de 5 cartas todos los domingos. Válido durante tus 30 días.`
                  : 'Coordina de forma directa con EvilTokkii en stream o canal oficial tras confirmar tu pago. Se activará manualmente durante 30 días.'}
              </p>
            </div>
          </div>

          {premiumStatus.isPremium ? (
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Beneficios Activos</span>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>30 Días Continuos</span>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DETALLADA: CÓMO FUNCIONA EL TOKKIIPASS PREMIUM Y MODO DE OBTENCIÓN */}
      <div
        ref={premiumInfoRef}
        className="relative rounded-3xl bg-gradient-to-b from-[#241704]/95 via-[#290A30]/95 to-[#1c0722]/95 border-2 border-amber-500/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-6 animate-in fade-in duration-300"
      >
        {/* Ambient glow lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F50B8C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-amber-500/30 pb-6 text-center sm:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-300">
                Beneficio Exclusivo • Nivel VIP
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Membresía Oficial{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                TokkiiPass Premium
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed">
              Descubre cómo funciona la suscripción VIP que potencia al máximo tu colección diaria y contribuye directamente al crecimiento de todas las plataformas del proyecto EvilTokkii.
            </p>
          </div>

          <div className="relative shrink-0 flex flex-col items-center sm:items-end gap-1.5 bg-[#170e02]/90 border border-amber-400/50 px-5 pt-4 pb-3.5 rounded-2xl shadow-xl">
            {/* Badge de Descuento de Lanzamiento con leve rotación en perspectiva */}
            <div 
              className="absolute -top-3.5 -left-3 sm:-left-4 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg border border-yellow-100/70 pointer-events-none select-none drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]"
              style={{ transform: 'rotate(-8deg)' }}
            >
              <Tag className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Desct. lanzamiento</span>
            </div>

            <span className="text-[11px] font-mono font-bold uppercase text-amber-300/80">Valor de Membresía</span>
            <div className="flex items-baseline gap-2">
              {/* Valor oferta de lanzamiento $2 en amarillo */}
              <div className="flex items-baseline font-black text-amber-300 text-2xl sm:text-3xl drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                <span className="text-lg sm:text-xl font-bold mr-0.5">$</span>
                <span className="text-3xl sm:text-4xl">2</span>
              </div>

              {/* Valor original $5 en gris tachado con una diagonal */}
              <div className="relative inline-flex items-center text-slate-500 font-bold text-lg sm:text-xl select-none mx-0.5">
                <span>$5</span>
                {/* Diagonal de tachado */}
                <span 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <span className="w-[125%] h-[2.5px] bg-red-500/90 rotate-[-28deg] transform origin-center rounded-full shadow-sm" />
                </span>
              </div>

              <span className="text-xs font-mono text-amber-200/70 font-semibold">USD</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
              30 Días Continuos
            </span>
          </div>
        </div>

        {/* 3 Pillars / Key Benefits Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#180e02]/70 border border-amber-500/30 rounded-2xl p-4.5 space-y-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="text-sm font-black text-amber-200">Recompensas Diarias Duplicadas</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              De lunes a sábado recibes el doble de sobres o cartas en cada reclamo regular y en cada tirada de la ruleta de azar.
            </p>
          </div>

          <div className="bg-[#180e02]/70 border border-amber-500/30 rounded-2xl p-4.5 space-y-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h3 className="text-sm font-black text-amber-200">Domingos de 5 Sobres x 5</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Todos los domingos recibes un cargamento épico de 5 sobres de 5 cartas garantizados (25 cartas adicionales directas cada semana).
            </p>
          </div>

          <div className="bg-[#180e02]/70 border border-amber-500/30 rounded-2xl p-4.5 space-y-2.5">
            <Crown className="w-6 h-6 text-amber-400" />
            <h3 className="text-sm font-black text-amber-200">Tema Dorado VIP Exclusivo</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tus casillas de calendario semanal y el botón de reclamo cambian a un prestigioso tono dorado brillante identificativo durante tus 30 días.
            </p>
          </div>
        </div>

        {/* MODALIDAD DE OBTENCIÓN & PRIVACIDAD */}
        <div className="relative bg-gradient-to-r from-amber-500/15 via-[#290A30] to-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Modo de Obtención: Solicitud vía Discord</span>
                <span className="text-[10px] font-mono uppercase bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  2 Dólares (Lanzamiento)
                </span>
              </h3>
              <p className="text-xs text-amber-200/90">
                Atención directa, personalizada y con total privacidad de datos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200 leading-relaxed">
            <div className="flex items-start gap-2.5 bg-black/30 border border-amber-500/20 p-3.5 rounded-xl">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200 block mb-0.5">Contacto Privado y Trato Directo:</strong>
                Para solicitar tu TokkiiPass Premium, realiza la solicitud mediante el servidor oficial de Discord. Serás contactado de forma estrictamente privada por el staff oficial de la web para acordar el medio de pago, garantizando la mayor privacidad de tus datos personales y trato directo y transparente con el equipo.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-black/30 border border-amber-500/20 p-3.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200 block mb-0.5">Activación Inmediata de 30 Días:</strong>
                Tras confirmar el aporte de 2 Dólares (oferta de lanzamiento), el staff activará manualmente tus 30 días VIP en la plataforma. Todos los beneficios se habilitarán al instante en tu perfil sin esperas.
              </div>
            </div>
          </div>
        </div>

        {/* CONVERSIÓN A MONEDA LOCAL */}
        <div className="relative rounded-2xl bg-[#140b02]/85 border border-amber-500/40 p-4.5 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left">
          <Coins className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />

          <div className="space-y-1">
            <h4 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <span>Conversión a Moneda Local de tu País</span>
              <span className="text-[10px] font-mono uppercase bg-amber-400/15 text-amber-300 border border-amber-400/40 font-bold px-2 py-0.5 rounded-full">
                Transparencia & Claridad
              </span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si el solicitante requiere realizar el aporte en la moneda local de su país, la conversión se coordinará directamente durante la solicitud mediante Discord para transparentar el cambio y tener la mejor claridad posible en todo momento.
            </p>
          </div>
        </div>

        {/* BENEFICIO PARA HERRAMIENTAS DE DESARROLLO Y TWITCH */}
        <div className="relative rounded-2xl bg-[#140b02]/85 border border-amber-500/40 p-4.5 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left">
          <Tv className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />

          <div className="space-y-1">
            <h4 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <span>Todo lo Recaudado es en Beneficio del Proyecto EvilTokkii</span>
              <Heart className="w-4 h-4 text-amber-400" />
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Todo lo recaudado mediante el TokkiiPass Premium es en beneficio directo para mejorar y financiar las herramientas de desarrollo de EvilTokkii, tanto para las transmisiones en vivo del canal de Twitch como para todos los medios de difusión y plataformas manejadas bajo el proyecto comunitario EvilTokkii.
            </p>
          </div>
        </div>

        {/* BOTÓN SOLICITAR TOKKIIPASS PREMIUM */}
        <div className="pt-4 pb-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setIsRequestModalOpen(true);
              setRequestSuccess(false);
              setRequestError(null);
            }}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:via-yellow-200 hover:to-amber-400 text-slate-950 font-black text-base sm:text-lg tracking-wide uppercase shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.75)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer border-2 border-yellow-200/90"
          >
            <Crown className="w-6 h-6 text-slate-950 shrink-0" />
            <span>Solicitar TokkiiPass Premium</span>
            <Sparkles className="w-5 h-5 text-slate-950 shrink-0" />
          </button>
        </div>
      </div>

      {/* ROULETTE MODAL (MIÉRCOLES Y SÁBADOS) */}
      {/* MODAL PARA SOLICITAR TOKKIIPASS PREMIUM VÍA DISCORD */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-[#1a0e02] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <button
              type="button"
              onClick={() => {
                setIsRequestModalOpen(false);
                setRequestSuccess(false);
                setRequestError(null);
              }}
              className="absolute top-4 right-4 p-2 text-amber-300/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!requestSuccess ? (
              <form onSubmit={handleSendDiscordRequest} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 border border-amber-400/50 flex items-center justify-center shadow-lg">
                    <Crown className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Solicitar TokkiiPass Premium
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
                    Indica tu <strong>usuario de Discord</strong> para que el Staff oficial de EvilTokkii se ponga en contacto directo contigo.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 block">
                    Usuario de Discord para contactar:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej: mi_usuario_discord"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d0701] border border-amber-500/40 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all font-medium"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Asegúrate de escribirlo correctamente para que podamos enviarte solicitud de amistad o mensaje directo.
                  </span>
                </div>

                {userProfile?.display_name && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-amber-200">
                    <span className="text-slate-400">Cuenta Twitch Vinculada:</span>
                    <strong className="text-amber-300">@{userProfile.display_name}</strong>
                  </div>
                )}

                {requestError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300">
                    {requestError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingRequest || !discordUsername.trim()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:via-yellow-200 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-amber-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRequest ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Enviando solicitud...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Enviar Solicitud</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    ¡Solicitud Enviada con Éxito!
                  </h3>
                  <div className="inline-block px-3 py-0.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono text-amber-300 font-bold">
                    Discord: @{discordUsername}
                  </div>
                </div>

                {/* MENSAJE DESTACADO SOLICITADO */}
                <div className="bg-gradient-to-br from-amber-500/20 via-[#2a1705] to-amber-500/10 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 text-left space-y-2 shadow-inner">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                    <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Aviso Importante:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    El <strong>Staff de EvilTokkii</strong> se pondrá en contacto contigo mediante <strong>mensaje directo por Discord</strong> para coordinar el medio de pago (o conversión de moneda local) y realizar la activación inmediata de tus 30 días VIP.
                  </p>
                  <p className="text-xs text-amber-300 font-bold">
                    🔔 ¡Por favor mantente muy al pendiente de tus solicitudes de amistad o mensajes directos en Discord!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setRequestSuccess(false);
                    setDiscordUsername('');
                  }}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider transition-colors cursor-pointer mt-2"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
        isPremium={lastClaimResult?.isPremium ?? premiumStatus.isPremium}
        premiumBonusText={lastClaimResult?.premiumBonusText}
      />
    </div>
  );
};
