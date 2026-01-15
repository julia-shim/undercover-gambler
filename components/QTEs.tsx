import React, { useState, useEffect, useRef } from 'react';
import { Button } from './UI';
import { Check, X, Search, Droplet, Sprout } from 'lucide-react';

// --- BED MAKING QTE ---
interface QTEProps {
  onComplete: (success: boolean) => void;
}

export const BedMaking: React.FC<QTEProps> = ({ onComplete }) => {
  const [wrinkles, setWrinkles] = useState<{id: number, top: number, left: number}[]>([]);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    // Generate 5 random wrinkles
    const newWrinkles = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      top: 20 + Math.random() * 60,
      left: 20 + Math.random() * 60
    }));
    setWrinkles(newWrinkles);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && wrinkles.length > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (wrinkles.length > 0 && timeLeft === 0) {
      onComplete(false); // Fail
    } else if (wrinkles.length === 0) {
      onComplete(true); // Success
    }
  }, [timeLeft, wrinkles, onComplete]);

  const handleClick = (id: number) => {
    setWrinkles(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif text-slate-200 mb-2">Make the Bed</h2>
      <p className="text-slate-500 mb-6 font-mono-theme text-xs">Smooth the sheets. Don't leave a trace. ({timeLeft}s)</p>
      
      <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-2xl cursor-pointer select-none">
        <img 
            src="https://images.unsplash.com/photo-1596499872782-7497d39d9181?q=80&w=1000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-50 grayscale" 
            alt="Messy Bed"
        />
        {wrinkles.map(w => (
          <div 
            key={w.id}
            onClick={() => handleClick(w.id)}
            className="absolute w-12 h-12 rounded-full bg-slate-200/20 border border-slate-400 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all cursor-crosshair animate-pulse"
            style={{ top: `${w.top}%`, left: `${w.left}%` }}
          >
            <div className="w-8 h-1 bg-slate-300 transform rotate-45 rounded-full"></div>
            <div className="absolute w-8 h-1 bg-slate-300 transform -rotate-45 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- WATER PLANTS QTE ---
export const WaterPlants: React.FC<QTEProps> = ({ onComplete }) => {
    const [plants, setPlants] = useState([false, false, false]); // false = dry, true = watered
    const [timeLeft, setTimeLeft] = useState(3);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (gameOver) return;

        if (plants.every(p => p)) {
            setGameOver(true);
            setTimeout(() => onComplete(true), 500);
            return;
        }

        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setGameOver(true);
            onComplete(false);
        }
    }, [timeLeft, plants, gameOver, onComplete]);

    const handleWater = (index: number) => {
        if (gameOver || plants[index]) return;
        const newPlants = [...plants];
        newPlants[index] = true;
        setPlants(newPlants);
    };

    return (
        <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-slate-200 mb-2">Act Normal</h2>
            <p className="text-slate-500 mb-8 font-mono-theme text-xs">Water the dead plants. Look busy. ({timeLeft}s)</p>

            <div className="flex gap-8 justify-center">
                {plants.map((watered, i) => (
                    <button
                        key={i}
                        onClick={() => handleWater(i)}
                        disabled={watered}
                        className={`w-32 h-40 border-2 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
                            watered 
                            ? 'border-emerald-500 bg-emerald-900/20' 
                            : 'border-slate-600 bg-slate-800 hover:border-blue-400'
                        }`}
                    >
                        {watered ? (
                            <Sprout size={48} className="text-emerald-400 mb-2 animate-bounce" />
                        ) : (
                            <div className="relative">
                                <Sprout size={48} className="text-slate-600 mb-2" />
                                <Droplet size={24} className="text-blue-400 absolute -top-4 -right-4 animate-pulse" />
                            </div>
                        )}
                        <span className={`text-xs font-mono-theme uppercase ${watered ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {watered ? 'Watered' : 'Dry'}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// --- LUNCH MAKING QTE ---
export const LunchMaking: React.FC<QTEProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const targetSequence = ['Bread', 'Mayo', 'Ham', 'Cheese', 'Bread'];
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const ingredients = [
    { name: 'Bread', color: 'bg-amber-700' },
    { name: 'Mayo', color: 'bg-yellow-100' },
    { name: 'Ham', color: 'bg-rose-400' },
    { name: 'Cheese', color: 'bg-yellow-400' },
    { name: 'Lettuce', color: 'bg-green-500' }, 
    { name: 'Mustard', color: 'bg-yellow-600' }, 
  ];

  const handleAdd = (ingredient: string) => {
    if (status !== 'playing') return;

    const newSeq = [...sequence, ingredient];
    setSequence(newSeq);

    // Check validity immediately
    if (newSeq[newSeq.length - 1] !== targetSequence[newSeq.length - 1]) {
      setStatus('lost');
      setTimeout(() => onComplete(false), 1000);
      return;
    }

    if (newSeq.length === targetSequence.length) {
      setStatus('won');
      setTimeout(() => onComplete(true), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-2xl mx-auto">
       <h2 className="text-3xl font-serif text-slate-200 mb-2">Leo's Lunch</h2>
       <p className="text-slate-500 mb-6 font-mono-theme text-xs">Bread, Mayo, Ham, Cheese, Bread. No mistakes.</p>

       <div className="flex gap-8 items-center w-full">
          {/* Ingredients */}
          <div className="grid grid-cols-2 gap-3 w-1/3">
             {ingredients.map(ing => (
               <button
                 key={ing.name}
                 onClick={() => handleAdd(ing.name)}
                 disabled={status !== 'playing'}
                 className={`p-3 text-xs font-bold uppercase tracking-wider border border-slate-700 hover:bg-slate-800 transition-colors rounded ${status !== 'playing' ? 'opacity-50' : ''}`}
               >
                 {ing.name}
               </button>
             ))}
          </div>

          {/* Assembly Area */}
          <div className="w-2/3 h-64 bg-slate-900 border border-slate-800 rounded flex flex-col-reverse items-center justify-start p-4 gap-1 overflow-hidden relative">
              {status === 'won' && <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/50 z-10"><Check size={48} className="text-emerald-400" /></div>}
              {status === 'lost' && <div className="absolute inset-0 flex items-center justify-center bg-rose-900/50 z-10"><X size={48} className="text-rose-400" /></div>}
              
              <div className="text-slate-600 text-xs absolute top-2 right-2">Plate</div>
              
              {sequence.map((item, i) => {
                 const ing = ingredients.find(x => x.name === item);
                 return (
                   <div key={i} className={`w-32 h-4 rounded ${ing?.color} shadow-sm animate-deal border border-black/20`}></div>
                 );
              })}
          </div>
       </div>
    </div>
  );
};


// --- FIND KEYS QTE ---
export const FindKeys: React.FC<QTEProps> = ({ onComplete }) => {
    const [piles, setPiles] = useState([true, true, true, true]); // 4 piles, true = visible
    const [keyIndex] = useState(() => Math.floor(Math.random() * 4));
    const [found, setFound] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3);
  
    useEffect(() => {
      if (found) return;
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        onComplete(false); // Time out
      }
    }, [timeLeft, found, onComplete]);
  
    const handlePileClick = (index: number) => {
       if (!piles[index] || found) return;
       
       const newPiles = [...piles];
       newPiles[index] = false; // remove pile
       setPiles(newPiles);

       if (index === keyIndex) {
           setFound(true);
           setTimeout(() => onComplete(true), 1000);
       }
    };
  
    return (
      <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-2xl mx-auto text-center">
         <h2 className="text-3xl font-serif text-slate-200 mb-2">Where are the keys?</h2>
         <p className="text-slate-500 mb-8 font-mono-theme text-xs">Check the piles. Quick. ({timeLeft}s)</p>
  
         <div className="relative w-96 h-64 bg-slate-800 rounded-lg border border-slate-700 shadow-2xl overflow-hidden mx-auto bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
             {/* The Keys (Hidden under one pile) */}
             <div 
               className="absolute text-amber-400 animate-pulse"
               style={{ 
                   top: ['20%', '20%', '60%', '60%'][keyIndex], 
                   left: ['20%', '60%', '20%', '60%'][keyIndex],
                   transform: 'translate(-50%, -50%)' 
               }}
             >
                 <Search size={32} />
             </div>
  
             {/* Piles */}
             {piles.map((visible, i) => (
                 visible && (
                     <div 
                        key={i}
                        onClick={() => handlePileClick(i)}
                        className="absolute w-32 h-24 bg-slate-700 border border-slate-600 rounded flex items-center justify-center cursor-pointer hover:bg-slate-600 transition-colors shadow-lg z-10"
                        style={{ 
                            top: ['20%', '20%', '60%', '60%'][i], 
                            left: ['20%', '60%', '20%', '60%'][i],
                            transform: 'translate(-50%, -50%) rotate(' + (i * 10 - 15) + 'deg)'
                        }}
                     >
                         <div className="text-slate-400 text-xs">Junk Pile</div>
                     </div>
                 )
             ))}
         </div>
      </div>
    );
  };