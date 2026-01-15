
export enum GamePhase {
  INTRO = 'INTRO',
  MAKE_BED = 'MAKE_BED', // QTE Task 1 Option
  WATER_PLANTS = 'WATER_PLANTS', // New Task
  MAKE_LUNCH = 'MAKE_LUNCH', // QTE Task 2 Option
  FIND_KEYS = 'FIND_KEYS', // QTE Task 2 Option
  MORNING_ROUTINE = 'MORNING_ROUTINE',
  MORNING_CHOICE = 'MORNING_CHOICE', 
  COMMUTE_MINIGAME = 'COMMUTE_MINIGAME',
  BANKING = 'BANKING',
  CASINO = 'CASINO',
  PICKUP_DECISION = 'PICKUP_DECISION', // New choice at 3:00 PM
  THE_DROP = 'THE_DROP',
  EVENING_INTERROGATION = 'EVENING_INTERROGATION',
  NEXT_DAY_TRANSITION = 'NEXT_DAY_TRANSITION',
  GAME_OVER_DEBT = 'GAME_OVER_DEBT',
  GAME_OVER_MISSED_PAYMENT = 'GAME_OVER_MISSED_PAYMENT',
  GAME_OVER_WIFE = 'GAME_OVER_WIFE',
  VICTORY = 'VICTORY'
}

export interface PlayerState {
  cash: number;
  bankBalance: number;
  debt: number;
  totalPaid: number;
  suspicion: number;
  day: number;
  time: number; // Minutes from midnight (e.g., 9:00 AM = 540)
  maxDays: number;
  drunk: boolean; 
  beardShaved: boolean;
  zoneMode: boolean;
  loansTaken: number;
  handsPlayedToday: number;
  skippedPickup: boolean;
  callsMadeToday: number;
  hasCalledInCasino: boolean;
}

export enum Suit {
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣',
  Spades = '♠'
}

export interface Card {
  suit: Suit;
  value: string;
  numericValue: number;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'neutral' | 'bad' | 'good' | 'dialogue';
}
export interface InteractionOption {
    text: string;
    risk: number;
    successChance: number;
}

export interface InteractionEvent {
    id: string;
    speaker: 'Sarah' | 'Leo';
    text: string;
    options: InteractionOption[];
}
