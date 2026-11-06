export type CardStatus = 'mastered' | 'learning';

export interface FlashCard {
  id: number;
  word: string;
  definition: string;
  phonetic?: string;
  example?: string;
  status: CardStatus;
  masteryLevel: number; // 0 - 100%
  reviewCount: number;  // 復習回数
}

export interface ProjectStats {
  title: string;
  icon: string;
  roundCount: number; // 18回
  score: number;      // 266782
  slotNumber: string; // "946"
}

