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
import { fetchCardsFromSupabase, supabase, rowToCard } from './utils/supabaseClient';
import { supabaseAuth } from './utils/authSupabaseClient';
import {
  signInWithTwitch,
  signOutUser,
  getUserProfile,
  fetchUserCards,
  fetchUserPacks,
  deductUserPack,
  addCardsToUserCollection,
} from './services/authUserService';
import type { UserProfile, UserPacksCount } from './types/user';
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

  // User Auth & Collection State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOwnedCardIds, setUserOwnedCardIds] = useState<Set<string>>(new Set());
  const [userPacks, setUserPacks] = useState<UserPacksCount>({ pack_1: 0, pack_3: 0, pack_5: 0 });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load from IndexedDB on mount (offline fallback)
  useEffect(() => {
    const loadFromIdb = async () => {
      try {
        const idbCards = await loadCardsFromIndexedDb();
        if (idbCards && idbCards.length > 0) {
          setCards(idbCards);
        }
      } catch (err) {
        console.warn('Could not load from IndexedDB in Visor:', err);
      }
    };
    loadFromIdb();
  }, []);

  // Function to load cards directly from Supabase (Source of Truth)
  const loadCardsFromSupabase = async () => {
    try {
      const dbCards = await fetchCardsFromSupabase();
      if (dbCards && dbCards.length > 0) {
        setCards(dbCards);
        saveCardsToIndexedDb(dbCards);
      }
    } catch (err) {
      console.warn('Could not load cards from Supabase, using local fallback:', err);
    }
  };

  // Load user data (profile, cards, packs)
  const loadUserData = async (userId: string) => {
    try {
      const [profile, cardMap, packs] = await Promise.all([
        getUserProfile(userId),
        fetchUserCards(userId),
        fetchUserPacks(userId),
      ]);
      if (profile) setUserProfile(profile);
      setUserOwnedCardIds(new Set(cardMap.keys()));
      setUserPacks(packs);
    } catch (err) {
      console.warn('Error loading user profile and collection:', err);
    }
  };

  // Auth state listener & Twitch session
  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUserProfile(null);
        setUserOwnedCardIds(new Set());
        setUserPacks({ pack_1: 0, pack_3: 0, pack_5: 0 });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Live real-time sync for user cards and packs
  useEffect(() => {
    if (!userProfile?.id) return;

    const userChannel = supabaseAuth
      .channel(`user_data_${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cards',
          filter: `user_id=eq.${userProfile.id}`,
        },
        () => {
          fetchUserCards(userProfile.id).then((cardMap) => {
            setUserOwnedCardIds(new Set(cardMap.keys()));
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_packs',
          filter: `user_id=eq.${userProfile.id}`,
        },
        () => {
          fetchUserPacks(userProfile.id).then((packs) => {
            setUserPacks(packs);
          });
        }
      )
      .subscribe();

    return () => {
      supabaseAuth.removeChannel(userChannel);
    };
  }, [userProfile?.id]);

  // Load from Supabase on mount & listen for real-time card updates from Builder
  useEffect(() => {
    loadCardsFromSupabase();

    const channel = supabase
      .channel('visor_cards_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedCard = rowToCard(payload.new as any);
            setCards((prev) => {
              const existingIdx = prev.findIndex((c) => c.id === updatedCard.id);
              let next: CardData[];
              if (existingIdx >= 0) {
                next = [...prev];
                next[existingIdx] = updatedCard;
              } else {
                next = [...prev, updatedCard];
              }
              saveCardsToIndexedDb(next);
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => {
              const next = prev.filter((c) => c.id !== payload.old.id);
              saveCardsToIndexedDb(next);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handlers for Twitch login and logout
  const handleLoginTwitch = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithTwitch();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setUserProfile(null);
    setUserOwnedCardIds(new Set());
    setUserPacks({ pack_1: 0, pack_3: 0, pack_5: 0 });
  };

  // Open User Pack Handler (deducts pack from Supabase and adds cards to user_cards)
  const handleOpenUserPack = async (
    packType: 'pack_1' | 'pack_3' | 'pack_5',
    pulledCards: CardData[]
  ): Promise<boolean> => {
    if (!userProfile?.id) return false;

    const deducted = await deductUserPack(userProfile.id, packType);
    if (!deducted) return false;

    // Update local pack count
    setUserPacks((prev) => ({
      ...prev,
      [packType]: Math.max(0, prev[packType] - 1),
    }));

    // Add cards to user's collection in Supabase
    const cardIds = pulledCards.map((c) => c.id);
    await addCardsToUserCollection(userProfile.id, cardIds, packType);

    // Update local owned cards
    setUserOwnedCardIds((prev) => {
      const next = new Set(prev);
      cardIds.forEach((id) => next.add(id));
      return next;
    });

    return true;
  };

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
        userProfile={userProfile}
        userPacks={userPacks}
        onLoginTwitch={handleLoginTwitch}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
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
              userOwnedCardIds={userOwnedCardIds}
              isLoggedIn={!!userProfile}
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
              userProfile={userProfile}
              userPacks={userPacks}
              onOpenUserPack={handleOpenUserPack}
              onLoginTwitch={handleLoginTwitch}
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
