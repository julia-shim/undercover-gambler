import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { createDeck } from '../constants';
import { Button, CardDisplay } from './UI';
import { Play, Hand as HandIcon, Ban, LogOut, Zap } from 'lucide-react';

interface BlackjackProps {
  drunkMode: boolean;
  zoneMode: boolean; // Free suspicion hands
  cash: number;
  onGameEnd: (netChange: number, suspicionIncrease: number) => void;
  onExit: () => void;
}

type HandStatus = 'betting' | 'playing' | 'dealerTurn' | 'finished';

export const Blackjack: React.FC<BlackjackProps> = ({ drunkMode, zoneMode, cash, onGameEnd, onExit }) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [status, setStatus] = useState<HandStatus>('betting');
  const [bet, setBet] = useState(50);
  const [message, setMessage] = useState("");
  const [zoneHandsLeft, setZoneHandsLeft] = useState(zoneMode ? 5 : 0);

  // Initialize deck on mount
  useEffect(() => {
    setDeck(createDeck());
  }, []);

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
    if (cash < bet) {
      setMessage("Insufficient funds.");
      return;
    }

    let currentDeck = [...deck];
    
    // Reshuffle if low
    if (currentDeck.length < 15) {
      currentDeck = createDeck();
      setMessage("Shuffling deck...");
    } else {
      setMessage(drunkMode ? "Dealer's eyes are glassy (Stands on 15)." : "Dealer is focused (Stands on 17).");
    }

    // Draw 4 cards securely
    const newPlayerHand: Card[] = [];
    const newDealerHand: Card[] = [];

    if (currentDeck.length >= 4) {
        newPlayerHand.push(currentDeck.pop()!);
        newDealerHand.push(currentDeck.pop()!);
        newPlayerHand.push(currentDeck.pop()!);
        newDealerHand.push(currentDeck.pop()!);
    } else {
        // Fallback (should be covered by reshuffle logic, but for safety)
        currentDeck = createDeck();
        newPlayerHand.push(currentDeck.pop()!);
        newDealerHand.push(currentDeck.pop()!);
        newPlayerHand.push(currentDeck.pop()!);
        newDealerHand.push(currentDeck.pop()!);
    }

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(currentDeck);
    setStatus('playing');
  };

  const hit = () => {
    const currentDeck = [...deck];
    if (currentDeck.length === 0) {
        // Emergency shuffle (unlikely mid-hand with check at start)
        const newDeck = createDeck();
        const card = newDeck.pop()!;
        setDeck(newDeck);
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        if (calculateScore(newHand) > 21) {
            endHand(newHand, dealerHand, 'bust');
        }
        return;
    }

    const card = currentDeck.pop()!;
    setDeck(currentDeck);
    
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    
    if (calculateScore(newHand) > 21) {
      endHand(newHand, dealerHand, 'bust');
    }
  };

  const stand = () => {
    setStatus('dealerTurn');
  };

  useEffect(() => {
    if (status === 'dealerTurn') {
      const dealerPlay = async () => {
        let currentDeck = [...deck];
        let currentHand = [...dealerHand];
        
        // Safety check if deck is empty (very rare)
        if (currentDeck.length === 0) {
            currentDeck = createDeck();
        }

        const standThreshold = drunkMode ? 15 : 17;
        let dealerScore = calculateScore(currentHand);

        while (dealerScore < standThreshold) {
          await new Promise(r => setTimeout(r, 800));
          
          if (currentDeck.length === 0) currentDeck = createDeck();
          
          const card = currentDeck.pop()!;
          currentHand.push(card);
          
          // Update visual immediately for drama
          setDealerHand([...currentHand]); 
          
          dealerScore = calculateScore(currentHand);
        }

        // Commit final deck state
        setDeck(currentDeck);
        endHand(playerHand, currentHand, 'compare');
      };
      dealerPlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // Dependencies are carefully managed to trigger only on status change

  const endHand = (pHand: Card[], dHand: Card[], reason: 'bust' | 'compare') => {
    setStatus('finished');
    
    let suspicionGain = drunkMode ? 7 : 4;
    if (zoneHandsLeft > 0) {
        suspicionGain = 0;
        setZoneHandsLeft(prev => prev - 1);
    }
    
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);
    
    let winAmount = 0;

    if (reason === 'bust') {
      setMessage("BUST");
      winAmount = -bet;
    } else {
      if (dScore > 21) {
        setMessage("DEALER BUSTS. YOU WIN.");
        winAmount = bet;
      } else if (pScore > dScore) {
        setMessage("VICTORY.");
        winAmount = bet;
      } else if (pScore < dScore) {
        setMessage("DEFEAT.");
        winAmount = -bet;
      } else {
        setMessage("PUSH.");
        winAmount = 0;
      }
    }

    onGameEnd(winAmount, suspicionGain);
  };

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
      <div className="flex flex-col items-center justify-center my-4 min-h-[4rem]">
        <div className="text-emerald-500/80 font-mono-theme text-xs tracking-[0.3em] uppercase mb-2">
            Pays 1 to 1 &bull; Dealer stands on {drunkMode ? 15 : 17}
        </div>
        <h2 className="text-3xl font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-pulse">
            {message}
        </h2>
        {zoneHandsLeft > 0 && (
            <div className="mt-2 text-amber-400 text-xs font-mono-theme tracking-widest flex items-center gap-2 animate-pulse">
                <Zap size={12} /> IN THE ZONE ({zoneHandsLeft} Hands Safe) <Zap size={12} />
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
             <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-full border border-slate-800">
                <button 
                  onClick={() => setBet(Math.max(10, bet - 50))} 
                  className="text-slate-500 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center"
                >-</button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Wager</span>
                    <span className="text-2xl font-mono-theme font-bold text-emerald-400">${bet}</span>
                </div>
                <button 
                  onClick={() => setBet(Math.min(cash, bet + 50))} 
                  className="text-slate-500 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center"
                >+</button>
             </div>
             
             <div className="flex gap-4 w-full md:w-auto">
               <Button onClick={startHand} disabled={cash < bet} icon={Play} variant="primary" className="flex-1 md:flex-none">
                 Deal Hand
               </Button>
               <Button variant="ghost" onClick={onExit} icon={LogOut}>
                 Leave
               </Button>
             </div>
          </div>
        ) : (
          <div className="flex justify-center gap-8">
            <Button onClick={hit} variant="secondary" icon={HandIcon} className="w-40 h-14 text-lg">Hit</Button>
            <Button onClick={stand} variant="danger" icon={Ban} className="w-40 h-14 text-lg">Stand</Button>
          </div>
        )}
      </div>
    </div>
  );
};