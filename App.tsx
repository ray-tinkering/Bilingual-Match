import React, { useState, useEffect, useCallback } from 'react';
import { fetchWordPairs } from './services/geminiService';
import { Card } from './components/Card';
import { CardData, GameState } from './types';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardData[]>([]);
  const [matchesFound, setMatchesFound] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [round, setRound] = useState(1);

  const startNewGame = useCallback(async (currentRound: number) => {
    setGameState(GameState.LOADING);
    setFlippedCards([]);
    setMatchesFound(0);
    setMoves(0);
    setCards([]);

    try {
      const wordPairs = await fetchWordPairs(currentRound);
      setTotalPairs(wordPairs.length);

      const newDeck: CardData[] = [];
      
      wordPairs.forEach((pair, index) => {
        const pairId = `pair-${index}`;
        
        // Create English Card
        newDeck.push({
          id: `${pairId}-en`,
          pairId: pairId,
          content: pair.english,
          lang: 'en',
          isFlipped: false,
          isMatched: false,
        });

        // Create Spanish Card
        newDeck.push({
          id: `${pairId}-es`,
          pairId: pairId,
          content: pair.spanish,
          lang: 'es',
          isFlipped: false,
          isMatched: false,
        });
      });

      setCards(shuffleArray(newDeck));
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Failed to start game", error);
      setGameState(GameState.ERROR);
    }
  }, []);

  // Trigger game start when round changes
  useEffect(() => {
    startNewGame(round);
  }, [round, startNewGame]);

  // Check for win condition
  useEffect(() => {
    if (totalPairs > 0 && matchesFound === totalPairs) {
      // Small delay to let the last animation finish
      const timer = setTimeout(() => {
        setGameState(GameState.WON);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [matchesFound, totalPairs]);

  const handleCardClick = (clickedCard: CardData) => {
    // Prevent clicking if we already have 2 flipped cards or if game is locked
    if (flippedCards.length >= 2 || clickedCard.isMatched || clickedCard.isFlipped) return;

    // Flip the clicked card
    const updatedCards = cards.map(c => 
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);
    
    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    // If we now have 2 cards flipped, check for match
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      checkForMatch(newFlippedCards[0], newFlippedCards[1]);
    }
  };

  const checkForMatch = (card1: CardData, card2: CardData) => {
    if (card1.pairId === card2.pairId) {
      // It's a match!
      setMatchesFound(prev => prev + 1);
      setCards(prevCards => 
        prevCards.map(c => 
          (c.id === card1.id || c.id === card2.id) 
            ? { ...c, isMatched: true, isFlipped: true } 
            : c
        )
      );
      setFlippedCards([]);
    } else {
      // No match, flip back after delay
      setTimeout(() => {
        setCards(prevCards => 
          prevCards.map(c => 
            (c.id === card1.id || c.id === card2.id) 
              ? { ...c, isFlipped: false } 
              : c
          )
        );
        setFlippedCards([]);
      }, 1200);
    }
  };

  const handleNextLevel = () => {
    setRound(prev => prev + 1);
  };

  const handleRestart = () => {
    startNewGame(round);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-6 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 drop-shadow-sm">
              Bilingual Match!
            </h1>
            <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              Level {round}
            </span>
          </div>
          <p className="text-gray-600 text-base md:text-lg">
            Match the <span className="text-blue-500 font-bold">English</span> word to the <span className="text-red-500 font-bold">Spanish</span> word.
          </p>
        </div>

        {/* Game Stats */}
        {gameState === GameState.PLAYING && (
          <div className="flex flex-wrap justify-between items-center max-w-xl mx-auto mb-6 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border border-white/50 gap-4">
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Moves</span>
              <span className="text-lg md:text-xl font-bold text-gray-700">{moves}</span>
            </div>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Matches</span>
              <span className="text-lg md:text-xl font-bold text-green-600">{matchesFound} / {totalPairs}</span>
            </div>
            <button 
              onClick={handleRestart}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm font-bold transition-colors shadow-md active:scale-95 ml-auto"
            >
              Restart
            </button>
          </div>
        )}

        {/* Loading State */}
        {gameState === GameState.LOADING && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-200 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-pink-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-xl text-gray-600 font-medium animate-pulse">
              {round > 1 ? `Preparing harder words for Level ${round}...` : 'Generating fun words...'}
            </p>
          </div>
        )}

        {/* Game Board - Updated for more cards (4 cols mobile, 5 cols desktop) */}
        {gameState === GameState.PLAYING && (
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4 w-full max-w-4xl mx-auto">
            {cards.map(card => (
              <Card 
                key={card.id} 
                card={card} 
                onClick={handleCardClick}
                disabled={flippedCards.length >= 2}
              />
            ))}
          </div>
        )}

        {/* Win Screen */}
        {gameState === GameState.WON && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all scale-100 animate-[bounce_1s_ease-out]">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Muy Bien!</h2>
              <p className="text-gray-600 mb-6">
                You cleared Level {round} in <span className="font-bold text-pink-600">{moves}</span> moves!
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleNextLevel}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xl font-bold shadow-lg transform transition hover:-translate-y-1 active:translate-y-0"
                >
                  Start Level {round + 1}
                </button>
              </div>
            </div>
          </div>
        )}

         {/* Error State */}
         {gameState === GameState.ERROR && (
          <div className="text-center mt-20">
            <p className="text-red-500 text-lg mb-4">Oops! Something went wrong loading the words.</p>
            <button 
              onClick={handleRestart}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;