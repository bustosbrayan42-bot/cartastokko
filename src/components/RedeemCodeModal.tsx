import React, { useState } from 'react';
import {
  Ticket,
  Sparkles,
  Package,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { redeemGiftCode, type PackType, type RedeemResult } from '../services/giftCodeService';
import type { UserProfile } from '../types/user';

interface RedeemCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onLoginTwitch?: () => void;
  onSuccessRedeem: (packType: PackType, quantity: number) => void;
  onNavigateToPacks: () => void;
}

export const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onLoginTwitch,
  onSuccessRedeem,
  onNavigateToPacks,
}) => {
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<RedeemResult['reward'] | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userProfile) {
      setErrorMsg('Debes iniciar sesión con Twitch para canjear un código.');
      return;
    }

    const clean = code.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('Por favor ingresa un código.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await redeemGiftCode(userProfile.id, clean);

      if (!res.success || !res.reward) {
        setErrorMsg(res.error || 'No se pudo canjear el código.');
      } else {
        setRedeemResult(res.reward);
        onSuccessRedeem(res.reward.pack_type, res.reward.pack_quantity);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error inesperado al canjear el código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setErrorMsg(null);
    setRedeemResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleGoToPacks = () => {
    handleClose();
    onNavigateToPacks();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#290A30] border border-[#610F4E] rounded-3xl p-6 shadow-[0_0_50px_rgba(245,11,140,0.25)] overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#F50B8C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-[#610F4E]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F50B8C] to-purple-600 flex items-center justify-center shadow-lg shadow-[#F50B8C]/30 shrink-0">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#F9F1F9] tracking-wide leading-tight">
                CANJEAR CÓDIGO
              </h3>
              <p className="text-[11px] text-[#B894B3]">
                Ingresa tu código de regalo para recibir sobres
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#B894B3] hover:text-[#F9F1F9] hover:bg-[#610F4E]/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative mt-5">
          {!userProfile ? (
            /* Not logged in prompt */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center mx-auto text-[#F50B8C]">
                <LogIn className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#F9F1F9] mb-1">
                  Inicio de sesión requerido
                </h4>
                <p className="text-xs text-[#B894B3] max-w-xs mx-auto">
                  Para acreditar los sobres directamente a tu cuenta, por favor inicia sesión con Twitch.
                </p>
              </div>

              {onLoginTwitch && (
                <button
                  type="button"
                  onClick={onLoginTwitch}
                  className="w-full py-3 px-4 rounded-2xl bg-[#9146FF] hover:bg-[#772CE8] text-white text-xs font-black shadow-lg shadow-[#9146FF]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                  <span>Iniciar sesión con Twitch</span>
                </button>
              )}
            </div>
          ) : redeemResult ? (
            /* Success State */
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#F50B8C] to-purple-600 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,11,140,0.45)] animate-bounce">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#F50B8C] uppercase tracking-widest">
                  ¡Canje Exitoso!
                </span>
                <h4 className="text-lg font-black text-white">
                  ¡Recompensa Reclamada!
                </h4>
                <p className="text-xs text-[#B894B3]">
                  Se han agregado los siguientes sobres a tu colección:
                </p>
              </div>

              {/* Reward Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#610F4E]/90 to-purple-900/90 border border-[#F50B8C]/60 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-[#F50B8C]/40 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#F50B8C]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white">
                      {redeemResult.pack_label}
                    </div>
                    <div className="text-[10px] text-pink-300 font-mono">
                      Código: {redeemResult.code}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#F50B8C] font-mono">
                    +{redeemResult.pack_quantity}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleGoToPacks}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F50B8C] to-purple-600 hover:from-[#F50B8C]/90 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#F50B8C]/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Package className="w-4 h-4" />
                  <span>Abrir Mis Sobres Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl bg-[#31213D] hover:bg-[#610F4E]/60 text-[#B894B3] hover:text-[#F9F1F9] text-xs font-bold transition-colors cursor-pointer"
                >
                  Canjear otro código
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#F9F1F9] mb-1.5">
                  Código de Regalo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase().replace(/\s+/g, ''));
                      setErrorMsg(null);
                    }}
                    placeholder="Ej: TOKII2026, DIRECTO_HOY"
                    autoFocus
                    className="w-full bg-[#1F0724] border border-[#610F4E] rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white placeholder-[#B894B3]/50 focus:outline-none focus:border-[#F50B8C] tracking-wider uppercase shadow-inner"
                    disabled={isLoading}
                  />
                  {code && (
                    <button
                      type="button"
                      onClick={() => setCode('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B894B3] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#B894B3] mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#F50B8C]" />
                  <span>Insensible a mayúsculas. Los sobres se sumarán al instante.</span>
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-start gap-2.5 text-red-200 text-xs animate-in shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{errorMsg}</span>
                </div>
              )}

              {/* Redeem Button */}
              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F50B8C] via-[#D60A7B] to-[#A0055A] hover:from-[#F50B8C]/90 hover:to-[#88044D] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#F50B8C]/35 border border-[#F50B8C]/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando y Canjeando...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>Canjear Recompensa</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
