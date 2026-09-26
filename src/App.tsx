import { useState, useEffect, useMemo } from 'react';
import type { CardData, CardElement, Rarity } from './types/card';
import { DEFAULT_CARDS } from './data/defaultCards';
import { RARITY_CONFIGS } from './data/rarityConfigs';
import { TcgCard } from './components/TcgCard';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { CardInspector } from './components/CardInspector';
import { PackOpener } from './components/PackOpener';
import { CardEditorModal } from './components/CardEditorModal';
import { RarityShowcaseSlider } from './components/RarityShowcaseSlider';
import { setSoundEnabled } from './utils/soundEffects';
import {
  Sparkles,
  Layers,
  RotateCcw,
  Package,
  Eye,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { fetchCardsFromSupabase } from './utils/supabaseClient';

export function App() {
  const [cards, setCards] = useState<CardData[]>(() => {
    const saved = localStorage.getItem('tokkii_tcg_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CARDS;
      }
    }
    return DEFAULT_CARDS;
  });

  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);

  // Function to load cards from Supabase
  const loadCardsFromSupabase = async () => {
    try {
      setIsLoadingSupabase(true);
      const dbCards = await fetchCardsFromSupabase();
      if (dbCards && dbCards.length > 0) {
        setCards(dbCards);
      }
    } catch (err) {
      console.warn('Could not load cards from Supabase, using local fallback:', err);
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    loadCardsFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('tokkii_tcg_cards', JSON.stringify(cards));
  }, [cards]);

  const [activeTab, setActiveTab] = useState<'binder' | 'showcase' | 'pack'>('binder');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
  const [selectedElement, setSelectedElement] = useState<CardElement | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'hp' | 'rarity' | 'title'>('rarity');

  const [inspectingCard, setInspectingCard] = useState<CardData | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isPackOpenerOpen, setIsPackOpenerOpen] = useState(false);

  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
  };

  const cardCountsByRarity = useMemo(() => {
    const counts: Record<Rarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      super_rare: 0,
      ultra_rare: 0,
      secret_rare: 0,
    };
    cards.forEach((c) => {
      if (counts[c.rarity] !== undefined) {
        counts[c.rarity]++;
      }
    });
    return counts;
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        if (selectedRarity !== 'all' && card.rarity !== selectedRarity) return false;
        if (selectedElement !== 'all' && card.element !== selectedElement) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = card.title.toLowerCase().includes(q);
          const matchSubtitle = card.subtitle.toLowerCase().includes(q);
          const matchAbility = card.abilityName?.toLowerCase().includes(q);
          const matchTag = card.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchSubtitle && !matchAbility && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const rarityWeights: Record<Rarity, number> = {
          secret_rare: 6,
          ultra_rare: 5,
          super_rare: 4,
          rare: 3,
          uncommon: 2,
          common: 1,
        };
        if (sortBy === 'rarity') {
          return (rarityWeights[b.rarity] || 0) - (rarityWeights[a.rarity] || 0);
        }
        if (sortBy === 'hp') {
          return b.hp - a.hp;
        }
        if (sortBy === 'id') {
          return a.cardNumber.localeCompare(b.cardNumber);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [cards, selectedRarity, selectedElement, searchQuery, sortBy]);

  const handleSaveCard = (savedCard: CardData) => {
    setCards((prev) => {
      const index = prev.findIndex((c) => c.id === savedCard.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedCard;
        return updated;
      }
      return [savedCard, ...prev];
    });

    if (inspectingCard && inspectingCard.id === savedCard.id) {
      setInspectingCard(savedCard);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer el visor a las cartas y rarezas por defecto?')) {
      setCards(DEFAULT_CARDS);
      localStorage.removeItem('tokkii_tcg_cards');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateModal={handleOpenCreateModal}
        soundEnabled={soundOn}
        onToggleSound={toggleSound}
        cardCount={cards.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: BINDER / COLLECTION GRID */}
        {activeTab === 'binder' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Hero Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Modelo de Visor TCG
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">
                  Colección de Cartas por Rareza
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                  Pasa el ratón sobre cualquier carta para activar el efecto holográfico 3D y brillo de foil. Haz clic para abrir el visor en alta resolución.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loadCardsFromSupabase}
                  disabled={isLoadingSupabase}
                  title="Recargar cartas desde Supabase"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupabase ? 'animate-spin text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">Recargar Supabase</span>
                </button>

                <button
                  onClick={handleResetDefaults}
                  title="Restablecer cartas originales"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPackOpenerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all font-bold text-xs shadow-lg shadow-amber-500/10"
                >
                  <Package className="w-4 h-4 text-amber-400" />
                  Abrir Sobre
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <FilterBar
              selectedRarity={selectedRarity}
              onSelectRarity={setSelectedRarity}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              cardCountsByRarity={cardCountsByRarity}
              totalCount={cards.length}
            />

            {/* CARDS GRID (4 HORIZONTAL CARDS PER ROW) */}
            {filteredCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-items-center py-4">
                {filteredCards.map((card) => {
                  const rCfg = RARITY_CONFIGS[card.rarity];
                  return (
                    <div
                      key={card.id}
                      className="relative flex flex-col items-center"
                    >
                      <TcgCard
                        card={card}
                        interactive={true}
                        onClick={() => setInspectingCard(card)}
                      />

                      <div className="mt-3 flex items-center justify-between w-72 px-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: rCfg.color }}
                          />
                          <span className="font-bold text-slate-300">
                            {rCfg.name}
                          </span>
                        </div>
                        <button
                          onClick={() => setInspectingCard(card)}
                          className="text-[11px] font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspeccionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    No se encontraron cartas
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    No hay cartas que coincidan con los filtros o término de búsqueda seleccionado.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRarity('all');
                    setSelectedElement('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: RARITY SHOWCASE SLIDER */}
        {activeTab === 'showcase' && (
          <div className="animate-in fade-in duration-300">
            <RarityShowcaseSlider />
          </div>
        )}

        {/* VIEW 3: BOOSTER PACK OPENER */}
        {activeTab === 'pack' && (
          <div className="py-8 animate-in fade-in duration-300">
            <PackOpener
              cards={cards}
              onClose={() => setActiveTab('binder')}
              onInspectCard={setInspectingCard}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Visor Web TCG • Listo para añadir y personalizar nuevas cartas e imágenes</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Proporción: 728 x 1024 px (1:1.4)
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {inspectingCard && (
        <CardInspector
          card={inspectingCard}
          onClose={() => setInspectingCard(null)}
        />
      )}

      {isPackOpenerOpen && (
        <PackOpener
          cards={cards}
          onClose={() => setIsPackOpenerOpen(false)}
          onInspectCard={(c) => {
            setIsPackOpenerOpen(false);
            setInspectingCard(c);
          }}
        />
      )}

      <CardEditorModal
        card={editingCard}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
      />
    </div>
  );
}

export default App;
