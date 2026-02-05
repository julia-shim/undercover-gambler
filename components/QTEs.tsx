import React, { useState, useEffect, useRef } from 'react';
import { Button } from './UI';
import { Check, X, Search, Droplet, Sprout, Waves, ChefHat, Car, AlertTriangle } from 'lucide-react';

// --- BED MAKING QTE ---
interface QTEProps {
  onComplete: (success: boolean) => void;
}

export const BedMaking: React.FC<QTEProps> = ({ onComplete }) => {
  // Initialize directly to ensure state exists on first render
  const [wrinkles, setWrinkles] = useState<{id: number, top: number, left: number}[]>(() => {
      return Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        top: 20 + Math.random() * 60,
        left: 20 + Math.random() * 60
      }));
  });
  
  const [timeLeft, setTimeLeft] = useState(5);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) return;

    if (wrinkles.length === 0) {
      setCompleted(true);
      setTimeout(() => onComplete(true), 200); // Small delay for visual satisfaction
    } else if (timeLeft === 0) {
      setCompleted(true);
      onComplete(false);
    }

    if (timeLeft > 0 && wrinkles.length > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, wrinkles, onComplete, completed]);

  const handleClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent bubbling if needed
    setWrinkles(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif text-slate-200 mb-2">Make the Bed</h2>
      <p className="text-slate-500 mb-6 font-mono-theme text-xs">Smooth the wrinkles. Be quick. ({timeLeft}s)</p>
      
      <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-2xl cursor-default select-none group">
        <img 
            src="https://images.unsplash.com/photo-1517166357932-d204958d1633?q=80&w=1000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60 grayscale transition-opacity duration-500" 
            alt="Messy Bed Sheets"
        />
        <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
        
        {wrinkles.map(w => (
          <button 
            key={w.id}
            onClick={(e) => handleClick(e, w.id)}
            className="absolute w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 outline-none"
            style={{ top: `${w.top}%`, left: `${w.left}%` }}
          >
            <div className="relative">
                <Waves className="w-12 h-12 text-slate-300 drop-shadow-md opacity-90" />
                <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-pulse"></div>
            </div>
          </button>
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

// --- COOKING MINIGAME ---
export const CookingMinigame: React.FC<QTEProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'chop' | 'pot' | 'stir'>('chop');
    const [veggies, setVeggies] = useState([false, false, false]);
    const [potItems, setPotItems] = useState(0);
    const [stirProgress, setStirProgress] = useState(0);
    
    // Check Chop Step
    useEffect(() => {
        if (step === 'chop' && veggies.every(v => v)) {
            setTimeout(() => setStep('pot'), 500);
        }
    }, [veggies, step]);

    // Check Pot Step
    useEffect(() => {
        if (step === 'pot' && potItems === 3) {
            setTimeout(() => setStep('stir'), 500);
        }
    }, [potItems, step]);

    const handleChop = (i: number) => {
        const newV = [...veggies];
        newV[i] = true;
        setVeggies(newV);
    };

    const handlePotClick = () => {
        if (potItems < 3) setPotItems(p => p + 1);
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (step !== 'stir') return;
        // Simple progress based on movement
        setStirProgress(prev => Math.min(100, prev + 0.5));
    };

    const handleFinish = () => {
        onComplete(true);
    };

    return (
        <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-2xl mx-auto text-center" onMouseMove={handleMouseMove}>
            <h2 className="text-3xl font-serif text-slate-200 mb-2">Cook Dinner</h2>
            <div className="mb-6 text-slate-500 font-mono-theme text-xs">
                {step === 'chop' && "Click veggies to chop."}
                {step === 'pot' && "Click ingredients to add to pot."}
                {step === 'stir' && "Move cursor over pot to stir."}
            </div>

            <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center gap-8">
                {step === 'chop' && (
                    <div className="flex gap-4">
                        {veggies.map((chopped, i) => (
                            <div 
                                key={i} 
                                onClick={() => handleChop(i)}
                                className={`w-20 h-20 rounded-full cursor-pointer transition-all ${chopped ? 'bg-emerald-600 scale-90' : 'bg-green-500 hover:scale-105'}`}
                            >
                                {chopped ? <Check className="m-auto mt-6 text-white"/> : <span className="block mt-8 text-xs font-bold text-green-900">VEG</span>}
                            </div>
                        ))}
                    </div>
                )}

                {step === 'pot' && (
                    <div className="flex flex-col items-center">
                        <div className="flex gap-2 mb-4">
                            {Array.from({length: 3 - potItems}).map((_, i) => (
                                <button key={i} onClick={handlePotClick} className="w-16 h-16 bg-emerald-600 rounded-full animate-bounce">Veg</button>
                            ))}
                        </div>
                        <div className="w-48 h-32 bg-slate-600 rounded-b-xl border-4 border-slate-500 flex items-center justify-center">
                            <span className="text-slate-300">{potItems}/3 Added</span>
                        </div>
                    </div>
                )}

                {step === 'stir' && (
                    <div className="relative w-64 h-64 bg-slate-700 rounded-full border-8 border-slate-600 flex items-center justify-center">
                         <div className="absolute inset-0 bg-orange-900/50 rounded-full" style={{ transform: `scale(${0.5 + (stirProgress/200)})`}}></div>
                         <div className="z-10 text-white font-bold text-xl">{Math.floor(stirProgress)}%</div>
                         {stirProgress >= 100 && (
                             <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center rounded-full">
                                 <Button onClick={handleFinish} variant="primary">SERVE</Button>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- DRIVING MINIGAME ---
export const DrivingMinigame: React.FC<QTEProps> = ({ onComplete }) => {
    const [status, setStatus] = useState<'intro' | 'playing' | 'crashed' | 'won'>('intro');
    const [carY, setCarY] = useState(50); // % from top
    const [obstacles, setObstacles] = useState<{id: number, x: number, y: number}[]>([]);
    const [progress, setProgress] = useState(0);

    const roadRef = useRef<HTMLDivElement>(null);

    // Game Loop
    useEffect(() => {
        if (status !== 'playing') return;

        const interval = setInterval(() => {
            // Update Progress
            setProgress(p => {
                if (p >= 100) {
                    setStatus('won');
                    return 100;
                }
                return p + 0.3; // Speed of progress
            });

            // Spawn Obstacles Logic
            // Only attempt spawn if last obstacle is far enough away to prevent lines
            // Assuming screen is 100% wide. If last obstacle > 60%, don't spawn.
            // This ensures at least ~40% horizontal gap.
            setObstacles(prev => {
                const lastObs = prev[prev.length - 1];
                let shouldSpawn = false;
                
                // If no obstacles, or last obstacle has moved far enough left (x < 60)
                // AND random check passes. Reduced probability from 0.08 to 0.04 for sparseness.
                if ((!lastObs || lastObs.x < 60) && Math.random() < 0.04) {
                    shouldSpawn = true;
                }

                if (shouldSpawn) {
                    return [...prev, {
                        id: Date.now(),
                        x: 100, // Start at right edge
                        y: Math.random() * 80 + 10 // Random lane height (10% to 90%)
                    }].map(o => ({...o, x: o.x - 1.5})).filter(o => o.x > -20);
                } else {
                    return prev.map(o => ({...o, x: o.x - 1.5})).filter(o => o.x > -20);
                }
            });

        }, 20);

        return () => clearInterval(interval);
    }, [status]);

    // Collision Detection
    useEffect(() => {
        if (status !== 'playing') return;

        // Collision logic
        for (const obs of obstacles) {
             // Overlap Logic:
             // Car X is fixed at ~10% (from left). Width ~5%. Range: 10% - 15%.
             // Obstacle X is obs.x. Width ~5%. Range: obs.x - (obs.x+5).
             
             // Check X overlap (Give some leeway)
             const xOverlap = (obs.x < 15 && obs.x > 5);
             
             // Check Y overlap
             // Car Y is center point. Height approx 10-15%. 
             // Obs Y is center point. Height approx 10-15%.
             const yOverlap = Math.abs(obs.y - carY) < 12; 
             
             if (xOverlap && yOverlap) {
                 setStatus('crashed');
                 break;
             }
        }
    }, [obstacles, carY, status]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (status !== 'playing' || !roadRef.current) return;
        const rect = roadRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const percentageY = (relativeY / rect.height) * 100;
        setCarY(Math.max(10, Math.min(90, percentageY)));
    };

    return (
        <div className="flex flex-col items-center justify-center animate-slide-up w-full max-w-4xl mx-auto select-none">
            <h2 className="text-3xl font-serif text-slate-200 mb-2">Drive to School</h2>
            
            {/* HUD */}
            <div className="w-full max-w-2xl flex justify-between text-xs font-mono-theme text-slate-500 mb-2 uppercase tracking-widest">
                <span>Distance</span>
                <span>{Math.floor(progress)}%</span>
            </div>
            
            {/* Game Container */}
            <div 
                ref={roadRef}
                onMouseMove={handleMouseMove}
                className="relative w-full max-w-3xl h-64 bg-slate-800 border-y-4 border-slate-600 overflow-hidden cursor-crosshair group shadow-2xl rounded-lg"
            >
                {/* Road Texture / Moving Lines */}
                <div className={`absolute inset-0 flex flex-col justify-around opacity-20 ${status === 'playing' ? 'animate-pulse' : ''}`}>
                     <div className="w-full h-2 bg-slate-500 border-b border-dashed border-slate-900"></div>
                     <div className="w-full h-2 bg-slate-500 border-b border-dashed border-slate-900"></div>
                     <div className="w-full h-2 bg-slate-500 border-b border-dashed border-slate-900"></div>
                </div>

                {/* Player Car */}
                <div 
                    className="absolute left-[10%] w-16 h-10 bg-emerald-600 rounded-md shadow-lg flex items-center justify-center z-20 transition-all duration-75 ease-linear"
                    style={{ top: `${carY}%`, transform: 'translateY(-50%)' }}
                >
                    <Car className="text-white w-6 h-6 -rotate-90" />
                    {/* Headlights */}
                    <div className="absolute right-0 top-1 w-20 h-8 bg-yellow-200/10 blur-md rounded-full pointer-events-none"></div>
                </div>

                {/* Obstacles */}
                {obstacles.map(obs => (
                    <div 
                        key={obs.id}
                        className="absolute w-12 h-12 bg-rose-900/80 border-2 border-rose-500 rounded flex items-center justify-center shadow-lg z-10"
                        style={{ left: `${obs.x}%`, top: `${obs.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <AlertTriangle className="text-rose-200 w-6 h-6" />
                    </div>
                ))}
                
                {/* Finish Line */}
                {progress > 95 && (
                    <div 
                        className="absolute top-0 bottom-0 w-8 bg-white/20 border-l-4 border-dashed border-white z-0"
                        style={{ left: `${(progress - 90) * 10}%` }}
                    ></div>
                )}

                {/* Intro Screen */}
                {status === 'intro' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 animate-fade-in">
                         <div className="p-8 border border-emerald-500/30 bg-slate-900 rounded-xl text-center max-w-md">
                             <Car className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                             <h3 className="text-xl font-bold text-white mb-4">DRIVING MODE</h3>
                             <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                 Use your <strong>MOUSE</strong> to guide the car up and down. <br/>
                                 Avoid the <span className="text-rose-400">Roadblocks</span>. <br/>
                                 Get Leo to school safely.
                             </p>
                             <Button onClick={() => setStatus('playing')} variant="primary" fullWidth>START ENGINE</Button>
                         </div>
                    </div>
                )}

                {/* Game Over Screen */}
                {status === 'crashed' && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 animate-fade-in">
                         <AlertTriangle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
                         <h3 className="text-3xl font-bold text-rose-500 mb-2">CRASHED</h3>
                         <p className="text-slate-400 mb-8">You hit a roadblock.</p>
                         <div className="flex gap-4">
                             <Button onClick={() => {
                                 setStatus('playing');
                                 setObstacles([]);
                                 setProgress(0);
                                 setCarY(50);
                             }} variant="secondary">TRY AGAIN</Button>
                             <Button onClick={() => onComplete(false)} variant="danger">GIVE UP (LATE)</Button>
                         </div>
                    </div>
                )}

                {/* Win Screen */}
                {status === 'won' && (
                    <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center z-30 animate-fade-in">
                         <Check className="w-16 h-16 text-white mb-4" />
                         <h3 className="text-3xl font-bold text-white mb-2">ARRIVED</h3>
                         <p className="text-emerald-200 mb-8">Safe and sound.</p>
                         <Button onClick={() => onComplete(true)} variant="primary">CONTINUE</Button>
                    </div>
                )}

            </div>
        </div>
    );
};
