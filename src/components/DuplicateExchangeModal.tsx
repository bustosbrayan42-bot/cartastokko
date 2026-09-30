import React, { useState } from 'react';
import { X, RefreshCw, Package, Sparkles, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import type { CardData } from '../types/card';
import {
  calculateDuplicatesSummary,
  exchangeDuplicatesForPack,
  type DuplicatesSummary,
} from '../services/authUserService';
import { playLegendaryRevealSound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface DuplicateExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userCardsMap: Map<string, number>;
  cards: CardData[];
  onExchangeSuccess: () => void;
}

interface TierConfig {
  rarity: 'common' | 'uncommon' | 'rare' | 'super_rare';
  label: string;
  required: number;
  color: string;
  borderColor: string;
  bgGradient: string;
  badgeBg: string;
  stars: number;
}

const EXCHANGE_TIERS: TierConfig[] = [
  {
    rarity: 'common',
    label: 'Común',
    required: 10,
    color: '#94a3b8',
    borderColor: '#475569',
    bgGradient: 'from-slate-900/90 via-slate-950/90 to-slate-900/90',
    badgeBg: 'bg-slate-800 text-slate-200 border-slate-600',
    stars: 1,
  },
  {
    rarity: 'uncommon',
    label: 'Poco Común',
    required: 8,
    color: '#34d399',
    borderColor: '#059669',
    bgGradient: 'from-emerald-950/40 via-slate-950/90 to-slate-900/90',
    badgeBg: 'bg-emerald-900/80 text-emerald-200 border-emerald-500/50',
    stars: 2,
  },
  {
    rarity: 'rare',
    label: 'Rara',
    required: 6,
    color: '#38bdf8',
    borderColor: '#0284c7',
    bgGradient: 'from-sky-950/40 via-slate-950/90 to-slate-900/90',
    badgeBg: 'bg-sky-900/80 text-sky-200 border-sky-500/50',
    stars: 3,
  },
  {
    rarity: 'super_rare',
    label: 'Súper Rara',
    required: 5,
    color: '#fbbf24',
    borderColor: '#d97706',
    bgGradient: 'from-amber-950/40 via-slate-950/90 to-slate-900/90',
    badgeBg: 'bg-amber-900/80 text-amber-200 border-amber-500/50',
    stars: 4,
  },
];

export const DuplicateExchangeModal: React.FC<DuplicateExchangeModalProps> = ({
  isOpen,
  onClose,
  userId,
  userCardsMap,
  cards,
  onExchangeSuccess,
}) => {
  const [exchangingRarity, setExchangingRarity] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary: DuplicatesSummary = calculateDuplicatesSummary(userCardsMap, cards);

  const handleExchange = async (tier: TierConfig) => {
    if (exchangingRarity) return;
    const available = summary[tier.rarity];
    if (available < tier.required) return;

    setExchangingRarity(tier.rarity);
    setErrorMessage(null);

    try {
      const res = await exchangeDuplicatesForPack(userId, tier.rarity, cards);
      if (res.success) {
        playLegendaryRevealSound();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setToastMessage(`¡Canje exitoso! Recibiste 1 Sobre de 3 Cartas.`);
        setTimeout(() => setToastMessage(null), 4000);
        onExchangeSuccess();
      } else {
        setErrorMessage(res.error || 'No se pudo realizar el canje.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error inesperado al canjear.');
    } finally {
      setExchangingRarity(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#290A30] border-2 border-[#610F4E] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(245,11,140,0.2)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#31213D] via-[#290A30] to-[#31213D] border-b border-[#610F4E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F50B8C] to-[#9146FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(245,11,140,0.4)]">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#F9F1F9] tracking-wide flex items-center gap-2">
                Canjear Cartas Repetidas por Sobres
              </h2>
              <p className="text-[11px] text-[#B894B3]">
                Cambia tus copias duplicadas por sobres nuevos de 3 cartas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#31213D] border border-[#610F4E] text-[#B894B3] hover:text-[#F9F1F9] hover:border-[#F50B8C]/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
          {/* Alerts */}
          {toastMessage && (
            <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs p-3 rounded-2xl flex items-center gap-2.5 animate-in fade-in shadow-lg">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">{toastMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-950/90 border border-red-500/60 text-red-200 text-xs p-3 rounded-2xl flex items-center gap-2.5 animate-in fade-in shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Duplicates Total Summary Pill */}
          <div className="bg-[#31213D]/90 border border-[#610F4E] p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F50B8C]" />
              <span className="text-xs font-bold text-[#F9F1F9]">
                Total de repetidas canjeables disponibles:
              </span>
            </div>
            <span className="text-xs font-black font-mono px-3 py-1 rounded-full bg-[#610F4E] text-[#F9F1F9] border border-[#F50B8C]/50 shadow-sm">
              {summary.totalExchangeable} Cartas Repetidas
            </span>
          </div>

          {/* 4 Tiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXCHANGE_TIERS.map((tier) => {
              const available = summary[tier.rarity] || 0;
              const isEligible = available >= tier.required;
              const percent = Math.min(100, Math.round((available / tier.required) * 100));
              const isCurrentlyExchanging = exchangingRarity === tier.rarity;

              return (
                <div
                  key={tier.rarity}
                  className={`bg-gradient-to-b ${tier.bgGradient} border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all ${
                    isEligible
                      ? 'border-[#F50B8C]/60 shadow-[0_0_15px_rgba(245,11,140,0.15)] ring-1 ring-[#F50B8C]/30'
                      : 'border-slate-800/80 opacity-85'
                  }`}
                >
                  {/* Top: Rarity Header & Exchange Rate */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-black font-mono uppercase px-2 py-0.5 rounded-full border ${tier.badgeBg}`}
                      >
                        {tier.label} {'★'.repeat(tier.stars)}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#F9F1F9] flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-[#F50B8C]" />
                        <span>1 Sobre (3c)</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Costo de canje:</span>
                      <span className="font-mono text-white font-bold">
                        {tier.required} {tier.label}s
                      </span>
                    </div>

                    {/* Progress Bar & Available Counter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Repetidas disponibles:</span>
                        <span
                          className={`font-black ${
                            isEligible ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {available} / {tier.required}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEligible
                              ? 'bg-gradient-to-r from-emerald-500 to-[#F50B8C]'
                              : 'bg-gradient-to-r from-slate-600 to-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Button */}
                  <button
                    type="button"
                    disabled={!isEligible || isCurrentlyExchanging}
                    onClick={() => handleExchange(tier)}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isEligible
                        ? 'bg-gradient-to-r from-[#F50B8C] to-[#9146FF] hover:from-[#ff2b9f] hover:to-[#a35cfc] text-white shadow-lg shadow-[#F50B8C]/30 hover:scale-[1.02] active:scale-95 border border-pink-400/40'
                        : 'bg-slate-900/80 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {isCurrentlyExchanging ? (
                      <span>Canjeando...</span>
                    ) : isEligible ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Canjear x1 Sobre (3c)</span>
                      </>
                    ) : (
                      <span>Faltan {tier.required - available} repetidas</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Rules & Exclusions Notice */}
          <div className="bg-[#31213D]/70 border border-[#610F4E]/80 p-3.5 rounded-2xl space-y-1.5 text-[11px] text-[#B894B3]">
            <div className="flex items-center gap-1.5 text-[#F9F1F9] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F50B8C]" />
              <span>Reglas de Protección de Colección:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10.5px] leading-relaxed">
              <li>
                <strong>Tu álbum está 100% seguro:</strong> Siempre conservas al menos 1 copia de cada carta en tu colección; solo se entregan las cartas repetidas adicionales.
              </li>
              <li>
                <strong>Rarezas Excluidas:</strong> Las cartas <span className="text-purple-300 font-semibold">Ultra Rara</span> y <span className="text-amber-300 font-semibold">Rara Secreta</span> no aplican para este intercambio debido a su alto valor coleccionable.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
