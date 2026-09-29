import { useState, useEffect } from 'react';
import type { CardData } from './types/card';
import { DEFAULT_CARDS } from './data/defaultCards';
import { CardBook } from './components/CardBook';
import { Navbar } from './components/Navbar';
import { CardInspector } from './components/CardInspector';
import { PackOpener } from './components/PackOpener';
import { CardEditorModal } from './components/CardEditorModal';
import { RarityShowcaseSlider } from './components/RarityShowcaseSlider';
import { Home } from './components/Home';
import { setSoundEnabled } from './utils/soundEffects';
import { fetchCardsFromSupabase } from './utils/supabaseClient';
import { saveCardsToIndexedDb, loadCardsFromIndexedDb } from './utils/cardStorage';

export function App() {
  const [cards, setCards] = useState<CardData[]>(() => {
    const saved = localStorage.getItem('tokkii_tcg_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= DEFAULT_CARDS.length) {
          return parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          const localMap = new Map(parsed.map((c: CardData) => [c.id, c]));
          return DEFAULT_CARDS.map((defCard) => localMap.get(defCard.id) || defCard);
        }
      } catch {
        return DEFAULT_CARDS;
      }
    }
    return DEFAULT_CARDS;
  });

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadFromIdb = async () => {
      try {
        const idbCards = await loadCardsFromIndexedDb();
        if (idbCards && idbCards.length > 0) {
          setCards((prev) => {
            const idbMap = new Map(idbCards.map((c: CardData) => [c.id, c]));
            return prev.map((c) => idbMap.get(c.id) || c);
          });
        }
      } catch (err) {
        console.warn('Could not load from IndexedDB in Visor:', err);
      }
    };
    loadFromIdb();
  }, []);

  // Function to load cards from Supabase with smart merge
  const loadCardsFromSupabase = async () => {
    try {
      const dbCards = await fetchCardsFromSupabase();
      if (dbCards && dbCards.length > 0) {
        setCards((currentCards) => {
          const currentMap = new Map(currentCards.map((c) => [c.id, c]));
          return dbCards.map((sbCard) => {
            const localCard = currentMap.get(sbCard.id);
            if (localCard && localCard.image && !localCard.image.includes('tokkii_photographer.jpg')) {
              return {
                ...sbCard,
                image: localCard.image,
                imageZoom: localCard.imageZoom ?? sbCard.imageZoom,
                imageOffsetX: localCard.imageOffsetX ?? sbCard.imageOffsetX,
                imageOffsetY: localCard.imageOffsetY ?? sbCard.imageOffsetY,
                imageRotation: localCard.imageRotation ?? sbCard.imageRotation,
                imageFit: localCard.imageFit ?? sbCard.imageFit,
              };
            }
            return localCard ? { ...sbCard, ...localCard } : sbCard;
          });
        });
      }
    } catch (err) {
      console.warn('Could not load cards from Supabase, using local fallback:', err);
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    loadCardsFromSupabase();
  }, []);

  useEffect(() => {
    saveCardsToIndexedDb(cards);
    try {
      localStorage.setItem('tokkii_tcg_cards', JSON.stringify(cards));
    } catch {
      // quota fallback
    }
  }, [cards]);

  const [activeTab, setActiveTab] = useState<'home' | 'binder' | 'showcase' | 'pack'>('home');
  const [inspectingCard, setInspectingCard] = useState<CardData | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);

  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
  };

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

  return (
    <div className="min-h-screen bg-[#31213D] text-[#F9F1F9] flex flex-col selection:bg-[#F50B8C] selection:text-white">
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
      <main className="flex-1 max-w-[1750px] w-full mx-auto px-2 sm:px-4 py-0.5 sm:py-1 flex flex-col justify-center">
        {/* VIEW 0: HOME / HERO GREETING */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-300 w-full flex items-center justify-center flex-1">
            <Home
              cardCount={cards.length}
            />
          </div>
        )}

        {/* VIEW 1: BINDER / 3D REAL BOOK ALBUM */}
        {activeTab === 'binder' && (
          <div className="animate-in fade-in duration-300 w-full">
            <CardBook
              cards={cards}
              onInspectCard={(card) => setInspectingCard(card)}
            />
          </div>
        )}

        {/* VIEW 2: RARITY SHOWCASE SLIDER */}
        {activeTab === 'showcase' && (
          <div className="animate-in fade-in duration-300 py-1 w-full flex items-center justify-center flex-1">
            <RarityShowcaseSlider />
          </div>
        )}

        {/* VIEW 3: BOOSTER PACK OPENER */}
        {activeTab === 'pack' && (
          <div className="py-2 w-full flex-1 flex items-center justify-center animate-in fade-in duration-300">
            <PackOpener
              cards={cards}
              onInspectCard={setInspectingCard}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#610F4E]/80 bg-[#290A30]/90 py-1.5 mt-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-[#B894B3]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F50B8C] animate-ping" />
            <span className="text-[#F9F1F9]/90 font-medium">Visor TCG • Álbum Coleccionista 4x3 de 144 Cartas</span>
          </div>
          <div className="font-mono text-[10px] text-[#B894B3]/90">
            © 2026 EvilTokkii TCG • Cartas e ilustraciones protegidas por derechos de autor (Copyright). Todos los derechos reservados.
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
