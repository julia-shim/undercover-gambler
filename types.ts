
export enum GameMode {
  BEGINNER = 'BEGINNER',
  STANDARD = 'STANDARD',
  HARD = 'HARD'
}

export enum GamePhase {
  INTRO = 'INTRO',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT', 
  TUTORIAL = 'TUTORIAL', 
  
  // Standard Mode Phases
  MAKE_BED = 'MAKE_BED',
  WATER_PLANTS = 'WATER_PLANTS',
  MAKE_LUNCH = 'MAKE_LUNCH',
  FIND_KEYS = 'FIND_KEYS',
  MORNING_ROUTINE = 'MORNING_ROUTINE',
  MORNING_CHOICE = 'MORNING_CHOICE', 
  COMMUTE_MINIGAME = 'COMMUTE_MINIGAME',
  
  // Beginner Mode Specific Phases
  BEGINNER_INTRO_VINNIE_CALL = 'BEGINNER_INTRO_VINNIE_CALL', // New Phase
  BEGINNER_DAY1_HOME = 'BEGINNER_DAY1_HOME',
  BEGINNER_DAY1_BANK = 'BEGINNER_DAY1_BANK',
  BEGINNER_BLACKJACK = 'BEGINNER_BLACKJACK',
  COOKING_MINIGAME = 'COOKING_MINIGAME',
  DRIVING_MINIGAME = 'DRIVING_MINIGAME',
  
  // Shared Phases
  BANKING = 'BANKING',
  CASINO = 'CASINO',
  PICKUP_DECISION = 'PICKUP_DECISION',
  THE_DROP = 'THE_DROP',
  EVENING_INTERROGATION = 'EVENING_INTERROGATION',
  NEXT_DAY_TRANSITION = 'NEXT_DAY_TRANSITION',
  
  // End States
  GAME_OVER_DEBT = 'GAME_OVER_DEBT',
  GAME_OVER_MISSED_PAYMENT = 'GAME_OVER_MISSED_PAYMENT',
  GAME_OVER_WIFE = 'GAME_OVER_WIFE',
  VICTORY = 'VICTORY'
}

export interface PlayerState {
  mode: GameMode;
  difficultyCompleted: { beginner: boolean; standard: boolean };
  beginnerTutorialActive: boolean; // True on first run of beginner
  
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
  
  // Beginner Mode Specifics
  todoList: { id: string, text: string, completed: boolean }[];
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