export interface WordPair {
  english: string;
  spanish: string;
}

export interface CardData {
  id: string;
  pairId: string; // Unique ID for the word pair to identify matches
  content: string;
  lang: 'en' | 'es';
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameState {
  LOADING,
  PLAYING,
  WON,
  ERROR
}