import React, { useState, useEffect } from 'react';
import { Card, Suit } from '../types';
import { createDeck } from '../constants';
import { Button, CardDisplay } from './UI';
import { Play, Hand as HandIcon, Ban, LogOut, Zap, GraduationCap, ChevronRight } from 'lucide-react';

interface BlackjackProps {
  drunkMode: boolean;
  zoneMode: boolean; // Free suspicion hands
  cash: number;
  onGameEnd: (netChange: number, suspicionIncrease: number) => void;
  onExit: () => void;
  tutorialMode?: boolean; // New Prop
  onTutorialComplete?: () => void; // New Prop
}

type HandStatus = 'betting' | 'playing' | 'dealerTurn' | 'finished';

// Fixed scenarios for tutorial
const TUTORIAL_SCENARIOS = [
  {
    id: 1,
    text: "Dealer has a Jack (10). You have 13. Hit to get closer to 21.",
    player: [{suit: Suit.Hearts, value: '10', numericValue: 10}, {suit: Suit.Clubs, value: '3', numericValue: 3}],
    dealer: [{suit: Suit.Spades, value: 'J', numericValue: 10}, {suit: Suit.Hearts, value: '6', numericValue: 6}],
    nextPlayerCard: {suit: Suit.Diamonds, value: '7', numericValue: 7},
    nextDealerCard: {suit: Suit.Clubs, value: 'K', numericValue: 10},
    forceAction: 'hit',
    resultText: "Dealer drew a King (10) and BUSTED (26). You Win."
  },
  {
    id: 2,
    text: "You have Blackjack (21). Dealer has 7. Stand.",
    player: [{suit: Suit.Spades, value: 'A', numericValue: 11}, {suit: Suit.Diamonds, value: 'J', numericValue: 10}],
    dealer: [{suit: Suit.Hearts, value: '7', numericValue: 7}, {suit: Suit.Clubs, value: 'Q', numericValue: 10}],
    nextPlayerCard: null,
    nextDealerCard: null,
    forceAction: 'stand',
    resultText: "Dealer had 17. They must stand. You win with 21."
  },
  {
    id: 3,
    text: "You have 17. Dealer shows 3. Stand.",
    player: [{suit: Suit.Hearts, value: '9', numericValue: 9}, {suit: Suit.Spades, value: '8', numericValue: 8}],
    dealer: [{suit: Suit.Diamonds, value: '3', numericValue: 3}, {suit: Suit.Clubs, value: '4', numericValue: 4}],
    nextPlayerCard: null,
    // Dealer hits: 3+4=7, Hit(10) -> 17. Push.
    dealerExtraCards: [{suit: Suit.Hearts, value: '10', numericValue: 10}],
    forceAction: 'stand',
    resultText: "PUSH. You both have 17. No money lost or won."
  },
  {
    id: 4,
    text: "Aces are tricky. You have A+4 (5 or 15). Hit.",
    player: [{suit: Suit.Clubs, value: 'A', numericValue: 11}, {suit: Suit.Hearts, value: '4', numericValue: 4}],
    dealer: [{suit: Suit.Spades, value: '7', numericValue: 7}, {suit: Suit.Diamonds, value: '8', numericValue: 8}], // Dealer 15
    nextPlayerCard: {suit: Suit.Diamonds, value: 'Q', numericValue: 10}, // Player now 15 (A=1)
    forceAction: 'hit',
    secondPlayerCard: {suit: Suit.Spades, value: '5', numericValue: 5}, // Player now 20
    dealerExtraCards: [{suit: Suit.Hearts, value: 'Q', numericValue: 10}], // Dealer Busts
    resultText: "A became 1. You hit to 20. Dealer busted."
  }
];

export const Blackjack: React.FC<BlackjackProps> = ({ drunkMode, zoneMode, cash, onGameEnd, onExit, tutorialMode = false, onTutorialComplete }) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [status, setStatus] = useState<HandStatus>('betting');
  const [bet, setBet] = useState(50);
  const [message, setMessage] = useState("");
  const [zoneHandsLeft, setZoneHandsLeft] = useState(zoneMode ? 5 : 0);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState(0); // 0 = not started, 1-4 scenarios
  const [tutorialSubStep, setTutorialSubStep] = useState(0); // For multi-hit hands

  // Initialize deck on mount
  useEffect(() => {
    if (!tutorialMode) {
      setDeck(createDeck());
    } else {
      setBet(50); // Force bet to 50 for tutorial
    }
  }, [tutorialMode]);

  const calculateScore = (hand: Card[]): number => {
    let score = 0;
    let aces = 0;
    hand.forEach(card => {
      score += card.numericValue;
      if (card.value === 'A') aces += 1;
    });
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const startHand = () => {
    if (!tutorialMode) {
        if (cash < bet) {
            setMessage("Insufficient funds.");
            return;
        }

        let currentDeck = [...deck];
        if (currentDeck.length < 15) {
            currentDeck = createDeck();
            setMessage("Shuffling deck...");
        } else {
            setMessage(drunkMode ? "Dealer stands on 15." : "Dealer stands on 17.");
        }

        const newPlayerHand: Card[] = [];
        const newDealerHand: Card[] = [];
        // Basic deal
        for(let i=0; i<2; i++) {
           newPlayerHand.push(currentDeck.pop()!);
           newDealerHand.push(currentDeck.pop()!);
        }
        setPlayerHand(newPlayerHand);
        setDealerHand(newDealerHand);
        setDeck(currentDeck);
        setStatus('playing');
    } else {
        // Tutorial Start Logic
        const scenario = TUTORIAL_SCENARIOS[tutorialStep];
        if (!scenario) {
            onTutorialComplete && onTutorialComplete();
            return;
        }
        setPlayerHand(scenario.player);
        setDealerHand(scenario.dealer);
        setMessage(scenario.text);
        setStatus('playing');
    }
  };

  const hit = () => {
    if (!tutorialMode) {
        const currentDeck = [...deck];
        const card = currentDeck.pop()!;
        setDeck(currentDeck);
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        if (calculateScore(newHand) > 21) endHand(newHand, dealerHand, 'bust');
    } else {
        // Tutorial Hit Logic
        const scenario = TUTORIAL_SCENARIOS[tutorialStep];
        if (tutorialStep === 3 && tutorialSubStep === 0) {
            // Special case for Hand 4 (Double Hit)
            const newHand = [...playerHand, scenario.nextPlayerCard!];
            setPlayerHand(newHand);
            setMessage("You have 15 (A=1 + 4 + 10). Hit again to get closer.");
            setTutorialSubStep(1);
        } else if (tutorialStep === 3 && tutorialSubStep === 1) {
            const newHand = [...playerHand, scenario.secondPlayerCard!];
            setPlayerHand(newHand);
            setMessage("You have 20. Perfect. Stand.");
            setTutorialSubStep(2);
        } else {
            // Standard Tutorial Hit (Scenario 1)
            const newHand = [...playerHand, scenario.nextPlayerCard!];
            setPlayerHand(newHand);
            
            // Hand 1 (Index 0): Wait for Stand
            if (tutorialStep === 0) {
                setMessage("You have 20. Good. Now Stand.");
                setTutorialSubStep(1); 
            }
        }
    }
  };

  const stand = () => {
    setStatus('dealerTurn');
  };

  useEffect(() => {
    if (status === 'dealerTurn') {
      const dealerPlay = async () => {
        if (!tutorialMode) {
            let currentDeck = [...deck];
            let currentHand = [...dealerHand];
            if (currentDeck.length === 0) currentDeck = createDeck();
            const standThreshold = drunkMode ? 15 : 17;
            
            while (calculateScore(currentHand) < standThreshold) {
                await new Promise(r => setTimeout(r, 800));
                if (currentDeck.length === 0) currentDeck = createDeck();
                currentHand.push(currentDeck.pop()!);
                setDealerHand([...currentHand]); 
            }
            setDeck(currentDeck);
            endHand(playerHand, currentHand, 'compare');
        } else {
            // Tutorial Dealer Play
            const scenario = TUTORIAL_SCENARIOS[tutorialStep];
            let currentHand = [...dealerHand];
            
            await new Promise(r => setTimeout(r, 800));
            // Scenario 1 & 2 & 4 have nextDealerCard, 3 has extraCards array
            if (scenario.dealerExtraCards) {
                 for (const card of scenario.dealerExtraCards) {
                     currentHand.push(card);
                     setDealerHand([...currentHand]);
                     await new Promise(r => setTimeout(r, 800));
                 }
            } else if (scenario.nextDealerCard) {
                currentHand.push(scenario.nextDealerCard);
                setDealerHand([...currentHand]);
            }
            endHand(playerHand, currentHand, 'compare');
        }
      };
      dealerPlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); 

  const endHand = (pHand: Card[], dHand: Card[], reason: 'bust' | 'compare') => {
    setStatus('finished');
    
    let suspicionGain = drunkMode ? 7 : 4;
    if (zoneHandsLeft > 0) { suspicionGain = 0; setZoneHandsLeft(prev => prev - 1); }
    
    if (tutorialMode) {
        // Calculate tutorial win
        let win = 0;
        // Scenario 1: Win
        if (tutorialStep === 0) win = 50;
        // Scenario 2: Win (Blackjack)
        if (tutorialStep === 1) win = 50;
        // Scenario 3: Push
        if (tutorialStep === 2) win = 0;
        // Scenario 4: Win
        if (tutorialStep === 3) win = 50;

        onGameEnd(win, 0); 

        setMessage(TUTORIAL_SCENARIOS[tutorialStep].resultText);
        setTutorialStep(prev => prev + 1);
        setTutorialSubStep(0);
        return; 
    }

    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);
    let winAmount = 0;

    if (reason === 'bust') {
      setMessage("BUST");
      winAmount = -bet;
    } else {
      if (dScore > 21) { setMessage("DEALER BUSTS. YOU WIN."); winAmount = bet; } 
      else if (pScore > dScore) { setMessage("VICTORY."); winAmount = bet; } 
      else if (pScore < dScore) { setMessage("DEFEAT."); winAmount = -bet; } 
      else { setMessage("PUSH."); winAmount = 0; }
    }

    onGameEnd(winAmount, suspicionGain);
  };

  // Helper logic for button states in tutorial
  const canHit = !tutorialMode || (
      // Allow hitting only if scenario requires it AND we haven't reached the "Stand" phase
      ((TUTORIAL_SCENARIOS[tutorialStep]?.forceAction === 'hit') && tutorialSubStep === 0) ||
      (tutorialStep === 3 && tutorialSubStep === 1) // Hand 4 second hit
  );

  const canStand = !tutorialMode || (
      (TUTORIAL_SCENARIOS[tutorialStep]?.forceAction === 'stand') ||
      (tutorialStep === 0 && tutorialSubStep === 1) || // Hand 1 after hit
      (tutorialStep === 3 && tutorialSubStep === 2)    // Hand 4 after 2 hits
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-6">
      {/* Dealer Area */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-2 text-slate-500 font-mono-theme text-xs tracking-[0.2em] uppercase">
          <span>The House</span>
          {status !== 'playing' && dealerHand.length > 0 && <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{calculateScore(dealerHand)}</span>}
        </div>
        <div className="flex -space-x-8 h-40 items-center">
          {dealerHand.map((card, i) => (
            <div key={`${i}-${card.suit}-${card.value}`} className="transform transition-all duration-500 hover:-translate-y-4">
              <CardDisplay 
                suit={card.suit} 
                value={card.value} 
                hidden={status === 'playing' && i === 1}
                delay={i * 200}
              />
            </div>
          ))}
          {dealerHand.length === 0 && <div className="w-24 h-36 border-2 border-dashed border-slate-700 rounded-lg opacity-20" />}
        </div>
      </div>

      {/* Center Table Status */}
      <div className="flex flex-col items-center justify-center my-4 min-h-[6rem] text-center max-w-lg">
        {!tutorialMode && (
             <div className="text-emerald-500/80 font-mono-theme text-xs tracking-[0.3em] uppercase mb-2">
                Pays 1 to 1 &bull; Dealer stands on {drunkMode ? 15 : 17}
             </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-pulse">
            {message}
        </h2>
        {tutorialMode && (
             <div className="mt-2 text-indigo-400 font-serif italic text-sm border-t border-indigo-900 pt-2">
                 TUTORIAL: Follow the instructions.
             </div>
        )}
      </div>

      {/* Player Area */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex -space-x-8 h-40 items-center">
          {playerHand.map((card, i) => (
            <div key={`${i}-${card.suit}-${card.value}`} className="transform transition-all duration-500 hover:-translate-y-4">
              <CardDisplay suit={card.suit} value={card.value} delay={i * 200 + 500} />
            </div>
          ))}
          {playerHand.length === 0 && <div className="w-24 h-36 border-2 border-dashed border-slate-700 rounded-lg opacity-20" />}
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-mono-theme text-xs tracking-[0.2em] uppercase">
          <span>You</span>
          {playerHand.length > 0 && <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">{calculateScore(playerHand)}</span>}
        </div>
      </div>

      {/* Interaction Bar */}
      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur border-t border-slate-700 p-6 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        {status === 'betting' || status === 'finished' ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             {!tutorialMode ? (
                 <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-full border border-slate-800">
                    <button onClick={() => setBet(Math.max(10, bet - 50))} className="text-slate-500 hover:text-white transition-colors text-2xl font-bold w-8 h-8">-</button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Wager</span>
                        <span className="text-2xl font-mono-theme font-bold text-emerald-400">${bet}</span>
                    </div>
                    <button onClick={() => setBet(Math.min(cash, bet + 50))} className="text-slate-500 hover:text-white transition-colors text-2xl font-bold w-8 h-8">+</button>
                 </div>
             ) : (
                 <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-full border border-slate-800 opacity-70 cursor-not-allowed">
                    <button disabled className="text-slate-700 text-2xl font-bold w-8 h-8">-</button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Locked</span>
                        <span className="text-2xl font-mono-theme font-bold text-emerald-400">$50</span>
                    </div>
                    <button disabled className="text-slate-700 text-2xl font-bold w-8 h-8">+</button>
                 </div>
             )}
             
             {tutorialMode && (
                 <div className="text-slate-400 font-mono-theme text-sm">Tutorial Hand {tutorialStep + 1} / {TUTORIAL_SCENARIOS.length}</div>
             )}
             
             <div className="flex gap-4 w-full md:w-auto relative">
               {tutorialMode && tutorialStep >= TUTORIAL_SCENARIOS.length ? (
                   <div className="relative">
                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-emerald-400 font-bold animate-bounce whitespace-nowrap flex flex-col items-center">
                           <span>Click to Finish</span>
                           <ChevronRight className="rotate-90" />
                       </div>
                       <Button onClick={onExit} variant="primary" icon={GraduationCap}>Finish & Leave</Button>
                   </div>
               ) : (
                   <Button onClick={startHand} disabled={!tutorialMode && cash < bet} icon={Play} variant="primary" className="flex-1 md:flex-none">
                     {tutorialMode ? 'Next Hand' : 'Deal Hand'}
                   </Button>
               )}
               {!tutorialMode && <Button variant="ghost" onClick={onExit} icon={LogOut}>Leave</Button>}
             </div>
          </div>
        ) : (
          <div className="flex justify-center gap-8">
            <Button 
                onClick={hit} 
                variant="secondary" 
                icon={HandIcon} 
                className="w-40 h-14 text-lg"
                disabled={!canHit}
            >
                Hit
            </Button>
            <Button 
                onClick={stand} 
                variant="danger" 
                icon={Ban} 
                className="w-40 h-14 text-lg"
                disabled={!canStand}
            >
                Stand
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};