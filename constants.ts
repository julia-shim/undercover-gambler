import { Suit, Card, InteractionEvent } from './types';

export const INITIAL_DEBT_BEGINNER = 1000;
export const INITIAL_CASH_BEGINNER = 400;
export const INITIAL_BANK_BEGINNER = 500; // Enough for a few days of bills
export const INITIAL_DEBT_STANDARD = 2500;
export const INITIAL_CASH_STANDARD = 600;
export const INITIAL_BANK_STANDARD = 500; // Enough for a few days of bills
export const INITIAL_DEBT_HARD = 5000;
export const INITIAL_CASH_HARD = 600;
export const INITIAL_BANK_HARD = 0; // Enough for a few days of bills
export const MAX_DAYS = 7;
export const SUSPICION_LIMIT = 100;
export const DAILY_EXPENSES = 75; // Deducted from bank daily

// Costs
export const COST_SHAVE = 15;
export const COST_COFFEE = 10;
export const COST_BEER = 12;
export const COST_COMMUTE_SAFE = 25;
export const COST_GIFT = 60; // New: Cost to buy flowers

// Limits
export const MAX_LOANS = 3; // Max times you can hit the shark button
export const SUSPICION_REDUCTION_GIFT = 25;
export const SUSPICION_REDUCTION_CALL = 5;
export const SUSPICION_INCREASE_WITHDRAW = 10;

// Debt Rules
export const DAILY_MIN_PAYMENT = 200;

export const SUITS = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      let numericValue = parseInt(value);
      if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
      if (value === 'A') numericValue = 11;
      deck.push({ suit, value, numericValue });
    });
  });
  
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
};

export const EVENING_EVENTS: InteractionEvent[] = [
  {
    id: 'sarah_withdrawals',
    speaker: 'Sarah',
    text: "I checked the account. Why are we withdrawing cash so often?",
    options: [
      { text: "Identity theft scare. I moved it to a secure account.", risk: 10, successChance: 0.7 },
      { text: "I'm planning a surprise for your birthday.", risk: 30, successChance: 0.4 },
      { text: "Just mind your own business, Sarah.", risk: 50, successChance: 0.1 }
    ]
  },
  {
    id: 'leo_crying',
    speaker: 'Leo',
    text: "Daddy, why were you crying in the car when you picked me up?",
    options: [
      { text: "It was just hay fever, buddy. Dust in my eyes.", risk: 5, successChance: 0.9 },
      { text: "I was listening to a sad song on the radio.", risk: 10, successChance: 0.8 },
      { text: "Daddy's just tired. Go to your room.", risk: 20, successChance: 0.3 }
    ]
  },
  {
    id: 'sarah_smell',
    speaker: 'Sarah',
    text: "You smell like that dive bar downtown. Please tell me you aren't gambling again.",
    options: [
      { text: "I just stopped to use the bathroom.", risk: 25, successChance: 0.5 },
      { text: "A client meeting ran late. He picked the place.", risk: 15, successChance: 0.7 },
      { text: "You're imagining things.", risk: 40, successChance: 0.2 }
    ]
  },
  {
    id: 'leo_park',
    speaker: 'Leo',
    text: "Can we go to the park tomorrow? You're never home anymore.",
    options: [
      { text: "I promise, this weekend.", risk: 5, successChance: 0.8 },
      { text: "I have to work to buy you toys, Leo.", risk: 10, successChance: 0.6 },
      { text: "Maybe. Ask your mother.", risk: 15, successChance: 0.4 }
    ]
  },
  {
    id: 'sarah_lighter',
    speaker: 'Sarah',
    text: "I found a lighter in your pocket. You don't smoke.",
    options: [
      { text: "Found it on the sidewalk. Thought it was cool.", risk: 20, successChance: 0.6 },
      { text: "Holding it for a coworker.", risk: 10, successChance: 0.8 },
      { text: "It's not mine.", risk: 30, successChance: 0.3 }
    ]
  },
  {
    id: 'sarah_phone',
    speaker: 'Sarah',
    text: "Who is 'V' in your phone contacts? They keep calling.",
    options: [
      { text: "Spam caller. I just saved it to block it.", risk: 15, successChance: 0.7 },
      { text: "New vendor from work.", risk: 10, successChance: 0.8 },
      { text: "Nobody.", risk: 40, successChance: 0.1 }
    ]
  },
  {
    id: 'leo_drawing',
    speaker: 'Leo',
    text: "I drew a picture of us. Why do you look sad in it?",
    options: [
      { text: "I'm not sad, I'm just focused.", risk: 5, successChance: 0.9 },
      { text: "That's just how Daddy's face looks.", risk: 10, successChance: 0.7 },
      { text: "Draw something else.", risk: 25, successChance: 0.2 }
    ]
  },
  {
    id: 'sarah_hands',
    speaker: 'Sarah',
    text: "Why are your hands shaking?",
    options: [
      { text: "Too much coffee.", risk: 5, successChance: 0.8 },
      { text: "Low blood sugar. I need to eat.", risk: 5, successChance: 0.9 },
      { text: "I'm fine. Stop staring.", risk: 30, successChance: 0.2 }
    ]
  }
];