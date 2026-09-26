import React, { useState } from 'react';
import type { CardData, CardElement, Rarity } from '../types/card';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { ELEMENT_CONFIGS } from '../data/elementConfigs';
import { TcgCard } from './TcgCard';
import { X, Upload, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CardEditorModalProps {
  card?: CardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedCard: CardData) => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<CardData>(
    card || {
      id: `card-${Date.now()}`,
      title: 'Tokkii - Nueva Carta',
      subtitle: 'Neko Aventurera • Colección TCG',
      image: '/cards/tokkii_photographer.jpg',
      rarity: 'rare',
      element: 'impulso',
      hp: 120,
      cardNumber: '010',
      totalInSet: '050',
      artist: 'Tokkii Studio',
      flavorText: 'Una nueva aventura plasmada en una carta coleccionable.',
      abilityName: 'Destello Especial',
      abilityCost: ['impulso'],
      abilityDamage: '60',
      abilityDesc: 'Efecto especial configurado por el usuario para esta carta.',
      retreatCost: 1,
      isFullArt: false,
      dateAdded: new Date().toISOString().split('T')[0],
      tags: ['Tokkii', 'Personalizada'],
    }
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            image: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

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

  const rarities: Rarity[] = [
    'common',
    'uncommon',
    'rare',
    'super_rare',
    'ultra_rare',
    'secret_rare',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: LIVE PREVIEW */}
        <div className="w-full md:w-5/12 bg-slate-950/90 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Vista Previa en Vivo
          </div>
          <div className="my-auto">
            <TcgCard card={formData} scale={0.95} interactive={true} />
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-3">
            Pasa el cursor por encima para ver el brillo holográfico según la rareza seleccionada.
          </p>
        </div>

        {/* RIGHT COLUMN: EDITING FORM */}
        <div className="w-full md:w-7/12 p-6 md:p-8 max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              {card ? 'Editar Carta TCG' : 'Crear Nueva Carta TCG'}
            </h3>

            {/* Image Input Section */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Imagen de la Carta
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium py-2 px-3 rounded-xl border border-slate-700 hover:border-amber-400 transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Subir Nueva Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      image: '/cards/tokkii_photographer.jpg',
                    }))
                  }
                  className="text-[11px] px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  Usar Tokkii Default
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nombre de la Carta
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Subtítulo / Clase
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Rarity Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Rareza y Acabado Holográfico
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {rarities.map((r) => {
                  const cfg = RARITY_CONFIGS[r];
                  const selected = formData.rarity === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, rarity: r })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        selected
                          ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span style={{ color: cfg.color }}>{cfg.name}</span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {cfg.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Element & HP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Elemento
                </label>
                <select
                  value={formData.element}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      element: e.target.value as CardElement,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {elements.map((elem) => (
                    <option key={elem} value={elem}>
                      {ELEMENT_CONFIGS[elem].symbol} {ELEMENT_CONFIGS[elem].name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Puntos de Vida (HP)
                </label>
                <input
                  type="number"
                  min="10"
                  max="999"
                  step="10"
                  value={formData.hp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hp: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Ability */}
            <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Nombre del Ataque / Habilidad
                  </label>
                  <input
                    type="text"
                    value={formData.abilityName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, abilityName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Daño
                  </label>
                  <input
                    type="text"
                    value={formData.abilityDamage || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        abilityDamage: e.target.value,
                      })
                    }
                    placeholder="ej. 80+"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Descripción del Efecto
                </label>
                <textarea
                  rows={2}
                  value={formData.abilityDesc || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, abilityDesc: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* Flavor Text & Artist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Texto de Ambientación (Lore)
                </label>
                <input
                  type="text"
                  value={formData.flavorText}
                  onChange={(e) =>
                    setFormData({ ...formData, flavorText: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ilustrador / Artista
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Checkbox: Full Art */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFullArt"
                checked={formData.isFullArt}
                onChange={(e) =>
                  setFormData({ ...formData, isFullArt: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label
                htmlFor="isFullArt"
                className="text-xs text-slate-300 cursor-pointer select-none font-medium"
              >
                Diseño Full Art (Borde extendido e insignia especial)
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                Guardar Carta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
