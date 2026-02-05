import React, { useState, useEffect, useRef } from 'react';
import { 
  GamePhase, 
  PlayerState,
  InteractionEvent,
  GameMode
} from './types';
import { 
  INITIAL_CASH_BEGINNER, 
  INITIAL_BANK_BEGINNER, 
  INITIAL_DEBT_BEGINNER, 
  INITIAL_CASH_STANDARD, 
  INITIAL_BANK_STANDARD, 
  INITIAL_DEBT_STANDARD, 
  INITIAL_CASH_HARD, 
  INITIAL_BANK_HARD, 
  INITIAL_DEBT_HARD, 
  MAX_DAYS, 
  SUSPICION_LIMIT,
  DAILY_EXPENSES,
  EVENING_EVENTS,
  COST_SHAVE,
  COST_COFFEE,
  COST_BEER,
  COST_COMMUTE_SAFE,
  DAILY_MIN_PAYMENT,
  COST_GIFT,
  MAX_LOANS,
  SUSPICION_REDUCTION_GIFT,
  SUSPICION_REDUCTION_CALL,
  SUSPICION_INCREASE_WITHDRAW
} from './constants';
import { Blackjack } from './components/Blackjack';
import { BedMaking, LunchMaking, FindKeys, WaterPlants, CookingMinigame, DrivingMinigame } from './components/QTEs';
import { Button, ProgressBar, StatBadge } from './components/UI';
import { 
  Coffee, 
  Beer, 
  Calendar,
  DollarSign,
  Target,
  Landmark,
  ArrowRightLeft,
  Banknote,
  Briefcase,
  AlertTriangle,
  Signal,
  Battery,
  Wifi,
  X,
  PhoneIncoming,
  Clock,
  Home,
  Dices,
  Gift,
  Phone,
  Skull,
  BookOpen,
  HelpCircle,
  Eye,
  HandMetal,
  Lock,
  Unlock,
  Check,
  Moon,
  Info,
  PhoneOff
} from 'lucide-react';

// --- Stock Photos ---
const IMG_SARAH_SAD = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"; 
const IMG_LEO_SAD = "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000&auto=format&fit=crop"; 
const IMG_CASINO = "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000&auto=format&fit=crop"; 
const IMG_KITCHEN = "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000&auto=format&fit=crop";
// Updated reliable dark bedroom image
const IMG_BEDROOM = "https://unsplash.com/photos/leaf-plant-near-bed-OZiflZqq0N0?q=80&w=1000&auto=format&fit=crop";

// --- Phone Types ---
type PhoneMode = 'LOCKED' | 'NOTES' | 'INCOMING_CALL' | 'IN_CALL' | 'TODO';

const INITIAL_STATE: PlayerState = {
    mode: GameMode.BEGINNER,
    difficultyCompleted: { beginner: false, standard: false },
    beginnerTutorialActive: true,
    cash: INITIAL_CASH_BEGINNER,
    bankBalance: INITIAL_BANK_BEGINNER,
    debt: INITIAL_DEBT_BEGINNER,
    totalPaid: 0,
    suspicion: 0,
    day: 1,
    time: 420, // 07:00 AM in minutes
    maxDays: MAX_DAYS,
    drunk: false,
    beardShaved: false,
    zoneMode: false,
    loansTaken: 0,
    handsPlayedToday: 0,
    skippedPickup: false,
    callsMadeToday: 0,
    hasCalledInCasino: false,
    todoList: []
};

// --- Helper Component for Intro ---
const VinnieCallIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState<'fade-in' | 'ringing' | 'talking' | 'fade-out'>('fade-in');
    
    useEffect(() => {
        // Step 1: Fade In immediately
        const timer1 = setTimeout(() => setStep('ringing'), 1000);
        return () => clearTimeout(timer1);
    }, []);

    const handleAnswer = () => {
        setStep('talking');
        // Step 3: Talk then fade out
        setTimeout(() => {
            setStep('fade-out');
            setTimeout(onComplete, 2000); // Wait for fade out
        }, 5000);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${step === 'fade-in' || step === 'fade-out' ? 'opacity-100' : 'opacity-100'}`}>
            <div className={`transition-opacity duration-1000 ${step === 'fade-in' || step === 'fade-out' ? 'opacity-0' : 'opacity-100'}`}>
                {step !== 'fade-out' && step !== 'fade-in' && (
                    <div className="w-80 h-[550px] bg-black border-4 border-slate-800 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden relative animate-slide-up">
                        {/* Status Bar */}
                        <div className="w-full h-8 bg-slate-950 flex justify-between items-center px-6 pt-2 z-10 text-[10px] text-slate-400">
                             <span>07:00 AM</span>
                             <div className="flex gap-1"><Signal size={10} /><Battery size={10} /></div>
                        </div>

                        {step === 'ringing' && (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6 bg-slate-900/50 backdrop-blur">
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-24 h-24 rounded-full bg-slate-700 mb-4 flex items-center justify-center border-2 border-slate-600">
                                        <Skull size={48} className="text-slate-400" />
                                    </div>
                                    <h2 className="text-3xl font-serif text-white tracking-widest">UNKNOWN</h2>
                                    <p className="text-rose-500 text-sm tracking-widest uppercase">Incoming Call...</p>
                                </div>
                                <button 
                                    onClick={handleAnswer}
                                    className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.5)] hover:scale-110 transition-transform animate-bounce"
                                >
                                    <Phone size={32} className="text-white fill-current" />
                                </button>
                            </div>
                        )}

                        {step === 'talking' && (
                             <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 bg-slate-900/90">
                                 <div className="text-center">
                                     <span className="text-emerald-500 text-xs tracking-widest">CONNECTED</span>
                                     <div className="mt-4 text-xs font-mono text-slate-500">00:01</div>
                                 </div>
                                 
                                 <div className="relative">
                                     <div className="absolute -inset-4 bg-rose-500/10 blur-xl rounded-full animate-pulse"></div>
                                     <p className="relative text-xl font-serif text-white text-center italic leading-relaxed">
                                        "I better have my money in 3 days. Or the alley gets another stain."
                                     </p>
                                 </div>

                                 <div className="w-20 h-20 bg-rose-900/50 rounded-full flex items-center justify-center border border-rose-800">
                                     <PhoneOff size={32} className="text-rose-400" />
                                 </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
  const [state, setState] = useState<PlayerState>(() => {
      // Load difficulty completion from local storage if available
      const saved = localStorage.getItem('undercover_gambler_save');
      if (saved) {
          const parsed = JSON.parse(saved);
          return { ...INITIAL_STATE, difficultyCompleted: parsed.difficultyCompleted || { beginner: false, standard: false } };
      }
      return INITIAL_STATE;
  });
  
  const [phase, setPhase] = useState<GamePhase>(GamePhase.INTRO);
  const [logs, setLogs] = useState<{id: number, text: string, time: string}[]>([]);
  const [currentEvent, setCurrentEvent] = useState<InteractionEvent | null>(null);
  const [shake, setShake] = useState(false);
  const [amountToHandle, setAmountToHandle] = useState(0); 
  const [tutorialStep, setTutorialStep] = useState(0);

  // Beginner Mode UI State
  const [bankTutorialStep, setBankTutorialStep] = useState(0);
  const [phoneTutorialDismissed, setPhoneTutorialDismissed] = useState(false);

  // Phone State
  const [phoneMode, setPhoneMode] = useState<PhoneMode>('NOTES');
  const [phoneNotification, setPhoneNotification] = useState(false);
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Determine Daily QTEs
  const [nextQTE, setNextQTE] = useState<GamePhase>(GamePhase.MAKE_LUNCH);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayHrs}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const addLog = (text: string) => {
    setLogs(prev => [...prev, { id: Date.now(), text, time: formatTime(state.time) }]);
    setTimeout(() => {
        notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateState = (updates: Partial<PlayerState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (newState.suspicion < 0) newState.suspicion = 0;
      return newState;
    });
  };
  
  // Persist difficulty unlocks
  useEffect(() => {
      localStorage.setItem('undercover_gambler_save', JSON.stringify({ difficultyCompleted: state.difficultyCompleted }));
  }, [state.difficultyCompleted]);

  useEffect(() => {
    if (state.suspicion >= SUSPICION_LIMIT && phase !== GamePhase.GAME_OVER_WIFE) {
      setPhase(GamePhase.GAME_OVER_WIFE);
      triggerShake();
    }
  }, [state.suspicion, phase]);

  const resetGame = () => {
      // Keep difficulty unlocks
      const unlocks = state.difficultyCompleted;
      setState({ ...INITIAL_STATE, difficultyCompleted: unlocks });
      setLogs([]);
      setPhase(GamePhase.INTRO);
      setPhoneMode('NOTES');
      setPhoneNotification(false);
      setPhoneTutorialDismissed(false);
  };

  const startDifficultySelect = () => {
      setPhase(GamePhase.DIFFICULTY_SELECT);
  }

  const selectDifficulty = (mode: GameMode) => {
      if (mode === GameMode.BEGINNER) {
          // Always restart Beginner Mode fresh, even if completed before
          updateState({ 
              mode: GameMode.BEGINNER, 
              cash: 400, 
              bankBalance: 300, 
              debt: 1000, 
              maxDays: 3, 
              beginnerTutorialActive: true,
              todoList: [
                  {id: 'bank', text: 'Go to Bank', completed: false},
                  {id: 'casino', text: 'Go to Casino', completed: false},
                  {id: 'pay', text: 'Pay Vinnie', completed: false},
                  {id: 'sarah', text: 'Talk to Sarah', completed: false},
              ]
          });
          // Transition to Intro Call instead of Home directly
          setPhase(GamePhase.BEGINNER_INTRO_VINNIE_CALL); 
          
          setPhoneMode('TODO');
          setPhoneNotification(true);
          setPhoneTutorialDismissed(false);
          // Only add log once we reach home
          
      } else if (mode === GameMode.STANDARD) {
          updateState({ mode: GameMode.STANDARD });
          const firstTask = randomizeDailyRoutine();
          setPhase(firstTask);
          addLog("Wake up. Head throbbing.");
      }
  };

  const startTutorial = () => {
      setPhase(GamePhase.TUTORIAL);
      setTutorialStep(0);
  };

  const randomizeDailyRoutine = () => {
      const selectedTask1 = GamePhase.MAKE_BED;
      const task2Options = [GamePhase.MAKE_LUNCH, GamePhase.FIND_KEYS];
      const selectedTask2 = task2Options[Math.floor(Math.random() * task2Options.length)];
      setNextQTE(selectedTask2);
      return selectedTask1;
  };

  // --- QTE HANDLERS ---
  const completeTodo = (id: string) => {
      updateState({ 
          todoList: state.todoList.map(t => t.id === id ? {...t, completed: true} : t) 
      });
  };

  // --- BEGINNER MODE HANDLERS ---
  const handleCookingComplete = (success: boolean) => {
      completeTodo('cook');
      if (success) addLog("Dinner cooked perfectly. Sarah smiled.");
      else addLog("Burnt the stew. Sarah is disappointed.");
      
      setPhase(GamePhase.NEXT_DAY_TRANSITION);
  };

  const handleDrivingComplete = (success: boolean) => {
      completeTodo('drive');
      if (success) {
          addLog("Leo delivered safely. Time to gamble.");
          setPhase(GamePhase.BANKING);
      } else {
          addLog("Fender bender. Late. Vinnie won't like this.");
          setPhase(GamePhase.BANKING);
      }
  };

  // --- STANDARD GAME LOGIC ---

  const handleTask1Complete = (success: boolean, logSuccess: string, logFail: string) => {
      const timeCost = 15;
      if (success) {
          addLog(logSuccess);
          updateState({ suspicion: Math.max(0, state.suspicion - 5), time: state.time + timeCost });
      } else {
          addLog(logFail);
          updateState({ suspicion: state.suspicion + 5, time: state.time + timeCost });
          triggerShake();
      }
      setPhase(nextQTE);
  };

  const handleTask2Complete = (success: boolean, logSuccess: string, logFail: string) => {
      const timeCost = 15;
      if (success) {
          addLog(logSuccess);
          updateState({ time: state.time + timeCost });
      } else {
          addLog(logFail);
          updateState({ suspicion: state.suspicion + 10, time: state.time + timeCost });
          triggerShake();
      }
      setPhase(GamePhase.MORNING_ROUTINE);
  };
  
  const handleWaterPlantsComplete = (success: boolean) => {
      if (success) {
          addLog("Plants watered. House looks cared for.");
          updateState({ suspicion: Math.max(0, state.suspicion - 5) });
      } else {
          addLog("Forgot a plant. It's wilting. Sarah noticed.");
          updateState({ suspicion: state.suspicion + 5 });
          triggerShake();
      }
      setPhase(GamePhase.EVENING_INTERROGATION);
      pickQuestion();
  };

  // Wrappers
  const handleBedComplete = (s: boolean) => handleTask1Complete(s, "Made the bed. A small victory.", "Left the sheets messy. Sarah will notice.");
  const handleLunchComplete = (s: boolean) => handleTask2Complete(s, "Leo's lunch packed.", "Messed up the sandwich.");
  const handleKeysComplete = (s: boolean) => handleTask2Complete(s, "Found the keys immediately.", "Couldn't find keys. Panic.");


  // --- ROUTINE ACTIONS ---

  const handleMorningRoutine = (action: 'shave' | 'ignore') => {
    if (action === 'shave') {
      if (state.cash < COST_SHAVE) {
          addLog("Tried to buy razors. Card declined.");
          return;
      }
      updateState({ 
          beardShaved: true, 
          suspicion: Math.max(0, state.suspicion - 10),
          cash: state.cash - COST_SHAVE,
          time: state.time + 10 
      });
      addLog("Shaved. You look less like a failure.");
    } else {
      updateState({ beardShaved: false, time: state.time + 5 });
      addLog("Ignored the mirror. The beard hides the shame.");
    }
    setPhase(GamePhase.MORNING_CHOICE);
  };

  const handleDrinkChoice = (choice: 'coffee' | 'beer') => {
    if (choice === 'coffee') {
      if (state.cash < COST_COFFEE) {
          addLog("Can't afford coffee. Tap water it is.");
      } else {
          updateState({ drunk: false, cash: state.cash - COST_COFFEE, time: state.time + 15 });
          addLog("Black coffee. Hands stopped shaking.");
      }
    } else {
      if (state.cash < COST_BEER) {
          addLog("Not enough cash for booze.");
          updateState({ drunk: false, time: state.time + 15 });
      } else {
          updateState({ drunk: true, cash: state.cash - COST_BEER, time: state.time + 15 });
          addLog("Morning beer. The edge is gone.");
      }
    }
    setPhase(GamePhase.COMMUTE_MINIGAME);
  };

  const handleCommute = (safe: boolean) => {
    if (safe) {
      if (state.cash < COST_COMMUTE_SAFE) {
          addLog("Gas tank empty. Forced to risk it.");
          handleCommute(false);
          return;
      }
      updateState({ 
          suspicion: Math.max(0, state.suspicion - 5), 
          cash: state.cash - COST_COMMUTE_SAFE,
          zoneMode: false,
          time: 570 
      });
      addLog("Drove safe. Arrived at Casino: 9:30 AM.");
    } else {
      const success = Math.random() > 0.4;
      if (success) {
        updateState({ zoneMode: true, time: 540 });
        addLog("Drove like a maniac. Arrived early: 9:00 AM.");
      } else {
        updateState({ suspicion: state.suspicion + 15, zoneMode: false, time: 570 });
        triggerShake();
        addLog("Near miss. Late anyway: 9:30 AM.");
      }
    }
    setPhase(GamePhase.BANKING);
  };

  const handleBanking = (action: 'deposit' | 'withdraw' | 'loan' | 'gift') => {
      if (action === 'deposit') {
          if (state.cash >= 100) {
              updateState({ cash: state.cash - 100, bankBalance: state.bankBalance + 100 });
              addLog("Deposited $100. Looks respectable.");
          }
      } else if (action === 'withdraw') {
          if (state.bankBalance >= 100) {
              updateState({ 
                  cash: state.cash + 100, 
                  bankBalance: state.bankBalance - 100,
                  suspicion: state.suspicion + SUSPICION_INCREASE_WITHDRAW
              });
              addLog("Withdrew $100. (+Suspicion)");
          }
      } else if (action === 'loan') {
          if (state.loansTaken >= MAX_LOANS) {
              addLog("Vinnie denied the loan.");
              triggerShake();
              return;
          }
          updateState({ cash: state.cash + 2500, debt: state.debt + 3750, loansTaken: state.loansTaken + 1 });
          addLog(`Took shark loan #${state.loansTaken + 1}.`);
      } else if (action === 'gift') {
          if (state.cash >= COST_GIFT) {
              updateState({ 
                  cash: state.cash - COST_GIFT, 
                  suspicion: Math.max(0, state.suspicion - SUSPICION_REDUCTION_GIFT) 
              });
              addLog("Bought flowers for Sarah.");
          } else {
              addLog("Can't afford the flowers.");
          }
      }
  };

  const finishBanking = () => {
      if (state.mode === GameMode.BEGINNER && state.beginnerTutorialActive && state.day === 1) {
          completeTodo('bank');
          setPhase(GamePhase.BEGINNER_BLACKJACK);
          return;
      }
      if (state.mode === GameMode.BEGINNER) completeTodo('bank');
      
      updateState({ hasCalledInCasino: false });
      setPhase(GamePhase.CASINO);
  };

  // --- PHONE & CASINO LOGIC ---

  const triggerIncomingCall = () => {
      setPhoneMode('INCOMING_CALL');
      setPhoneNotification(true);
      updateState({ hasCalledInCasino: true });
  };

  const handleCallHome = () => {
      const newCalls = state.callsMadeToday + 1;
      if (state.callsMadeToday < 2) {
          if (state.suspicion > 0) {
              updateState({ 
                  suspicion: Math.max(0, state.suspicion - SUSPICION_REDUCTION_CALL),
                  time: state.time + 10,
                  callsMadeToday: newCalls
              });
              addLog("Called home. Just checking in.");
          } else {
              updateState({ time: state.time + 10, callsMadeToday: newCalls });
              addLog("Called home. No need.");
          }
      } else {
          updateState({ suspicion: state.suspicion + 10, time: state.time + 10, callsMadeToday: newCalls });
          triggerShake();
          addLog("Called home again. She's annoyed.");
      }
  };

  const handlePhoneResponse = (responseType: 'truth' | 'lie_work' | 'lie_traffic' | 'hangup') => {
      setPhoneMode('NOTES');
      setPhoneNotification(false);

      if (state.mode === GameMode.BEGINNER && state.day === 1) {
          // Scripted response for Beginner Day 1
          completeTodo('sarah');
          if (responseType === 'truth') {
             updateState({ suspicion: state.suspicion + 40 });
             addLog("Told truth. She's horrified.");
          } else if (responseType === 'lie_work') {
              // "Hung out with friends" equiv
              addLog("Lied: Friends. She bought it.");
          } else {
             updateState({ suspicion: state.suspicion + 10 });
             addLog("Lied: Bar. She's suspicious.");
          }
          return;
      }

      // Standard Logic
      if (responseType === 'truth') {
          updateState({ suspicion: state.suspicion + 40 });
          addLog("Call: Told Truth. (+40 Sus)");
          triggerShake();
      } else if (responseType === 'hangup') {
          updateState({ suspicion: state.suspicion + 15 });
          addLog("Call: Sent to VM. Risky.");
      } else {
          const success = Math.random() > 0.4;
          if (success) {
              updateState({ suspicion: Math.max(0, state.suspicion - 5) });
              addLog(`Call: Lied ("${responseType}"). Success.`);
          } else {
              updateState({ suspicion: state.suspicion + 10 });
              addLog(`Call: Lied. Failed.`);
              triggerShake();
          }
      }
  };

  const handleBlackjackEnd = (netWin: number, suspicionAdded: number) => {
    // 30 Minutes per hand
    const newTime = state.time + 30;
    const newHandsPlayed = state.handsPlayedToday + 1;
    
    updateState({ 
      cash: state.cash + netWin,
      suspicion: state.suspicion + suspicionAdded,
      time: newTime,
      handsPlayedToday: newHandsPlayed
    });
    
    if (netWin > 0) addLog(`Casino: Won $${netWin}.`);
    else if (netWin < 0) {
        addLog(`Casino: Lost $${Math.abs(netWin)}.`);
        triggerShake();
    }
    
    // Beginner Mode checks
    if (state.mode === GameMode.BEGINNER) return;

    // Standard Mode Events
    if (newTime >= 900 && !state.skippedPickup) {
        setPhase(GamePhase.PICKUP_DECISION);
        addLog("ALARM: 3:00 PM. Pick up Leo.");
        return;
    }
    
    const baseChance = 0.05;
    const callChance = baseChance * newHandsPlayed; 
    
    if (Math.random() < callChance && phoneMode !== 'INCOMING_CALL' && !state.hasCalledInCasino) {
        triggerIncomingCall();
    }
  };
  
  // Specific handler for tutorial mode to just add money without time penalty
  const handleTutorialBlackjackEnd = (netWin: number, suspicionAdded: number) => {
      updateState({
          cash: state.cash + netWin
      });
  };

  const handlePickupDecision = (choice: 'home' | 'casino') => {
      if (choice === 'home') {
          updateState({ time: 1080 }); // 6:00 PM
          setPhase(GamePhase.THE_DROP);
          setAmountToHandle(0);
      } else {
          updateState({ 
              suspicion: state.suspicion + 30, 
              time: 960, 
              skippedPickup: true,
              hasCalledInCasino: false 
          });
          addLog("Ignored school pickup. Sarah is furious.");
          triggerShake();
          setPhase(GamePhase.CASINO);
      }
  };

  const leaveCasino = () => {
    if (phoneMode === 'INCOMING_CALL') handlePhoneResponse('hangup');
    
    if (state.mode === GameMode.BEGINNER) {
        completeTodo('casino');
        setPhase(GamePhase.THE_DROP);
        // Scripted Amount
        if (state.day <= 2) setAmountToHandle(0);
        else setAmountToHandle(state.debt); 
        return;
    }

    if (state.time < 900) {
        addLog("Waiting in car until school ends...");
        updateState({ time: 900 });
        setPhase(GamePhase.PICKUP_DECISION);
    } else {
        setPhase(GamePhase.THE_DROP);
        setAmountToHandle(0);
    }
  };
  
  const handlePayment = () => {
      const isBeginnerEarly = state.mode === GameMode.BEGINNER && state.day <= 2;
      
      // Enforce Exact Payment for Beginner Day 1 & 2
      if (isBeginnerEarly) {
          if (amountToHandle !== 200 && state.cash >= 200) {
              addLog("Vinnie: \"I said $200. Don't play games.\"");
              triggerShake();
              return;
          }
      }

      // Enforce Minimum Payment Logic for Standard/Late Beginner
      // Allows full pay off if debt < min payment, or if it's the last day
      if (!isBeginnerEarly && amountToHandle < DAILY_MIN_PAYMENT && amountToHandle < state.debt && state.day !== state.maxDays) {
           addLog(`Vinnie: "Minimum is $${DAILY_MIN_PAYMENT}. Don't insult me."`);
           triggerShake();
           return;
      }

      if (amountToHandle > state.cash) {
          addLog("You don't have that much cash.");
          return;
      }
      
      const newTotalPaid = state.totalPaid + amountToHandle;
      const newDebt = state.debt - amountToHandle;
      
      updateState({
          cash: state.cash - amountToHandle,
          debt: newDebt,
          totalPaid: newTotalPaid
      });

      if (newDebt <= 0) {
          if (state.mode === GameMode.BEGINNER) {
               updateState({ difficultyCompleted: { ...state.difficultyCompleted, beginner: true }});
          }
          setPhase(GamePhase.VICTORY);
          return;
      }

      if (state.day === state.maxDays) {
          finishDrop();
      } else {
          // Check payment logic again for game over condition, though UI should prevent getting here
          if ((amountToHandle >= DAILY_MIN_PAYMENT) || (state.mode === GameMode.BEGINNER && state.day < 3)) {
              if (state.mode === GameMode.BEGINNER) {
                  finishDrop();
              } else {
                  addLog(`Paid Vinnie $${amountToHandle}. Safe.`);
                  setPhase(GamePhase.WATER_PLANTS); 
              }
          } else {
              setPhase(GamePhase.GAME_OVER_MISSED_PAYMENT);
          }
      }
  };
  
  const finishDrop = () => {
      if (state.mode === GameMode.BEGINNER) {
          completeTodo('pay');
          if (state.day === 1) {
              setPhase(GamePhase.BEGINNER_DAY1_HOME); // Go to Home BG
              triggerIncomingCall(); // Trigger Call immediately
          } else if (state.day === 2) {
              setPhase(GamePhase.COOKING_MINIGAME);
          } else {
              if (state.debt > 0) setPhase(GamePhase.GAME_OVER_DEBT);
              else setPhase(GamePhase.VICTORY);
          }
          return;
      }

      if (state.day === MAX_DAYS) {
          if (state.debt > 0) {
              setPhase(GamePhase.GAME_OVER_DEBT);
          } else {
              setPhase(GamePhase.VICTORY);
          }
      } else {
          setPhase(GamePhase.GAME_OVER_MISSED_PAYMENT);
      }
  };

  const pickQuestion = () => {
    const q = EVENING_EVENTS[Math.floor(Math.random() * EVENING_EVENTS.length)];
    setCurrentEvent(q);
  };

  const handleExcuse = (optionIdx: number) => {
    if (!currentEvent) return;
    
    const option = currentEvent.options[optionIdx];
    const roll = Math.random();
    
    if (roll < option.successChance) {
      updateState({ suspicion: Math.max(0, state.suspicion - 5) });
      addLog(`${currentEvent.speaker}: Answered "${option.text}". Worked.`);
    } else {
      updateState({ suspicion: state.suspicion + option.risk });
      triggerShake();
      addLog(`${currentEvent.speaker}: Answered "${option.text}". Failed.`);
    }
    
    endDayLogic();
  };

  const endDayLogic = () => {
      if (state.debt <= 0) {
          setPhase(GamePhase.VICTORY);
          return;
      }

      const newBank = state.bankBalance - DAILY_EXPENSES;
      let susChange = 0;
      if (newBank < 0) { susChange = 20; triggerShake(); } 
      else if (newBank < 100) susChange = 10;
      
      updateState({ bankBalance: newBank, suspicion: state.suspicion + susChange });
      
      if (state.day >= state.maxDays && state.debt > 0) {
           setPhase(GamePhase.GAME_OVER_DEBT);
      } else {
          setPhase(GamePhase.NEXT_DAY_TRANSITION);
      }
  };

  const payDebt = () => {
    if (state.cash >= state.debt) {
        updateState({ cash: state.cash - state.debt, debt: 0 });
        if (state.mode === GameMode.BEGINNER) {
             updateState({ difficultyCompleted: { ...state.difficultyCompleted, beginner: true }});
        }
        setPhase(GamePhase.VICTORY);
    }
  };

  const nextDay = () => {
    const nextDayNum = state.day + 1;
    
    if (state.mode === GameMode.BEGINNER) {
        let newTodos = [];
        if (nextDayNum === 2) {
             newTodos = [
                 {id: 'bank', text: 'Go to Bank', completed: false},
                 {id: 'casino', text: 'Go to Casino', completed: false},
                 {id: 'pay', text: 'Pay Vinnie', completed: false},
                 {id: 'cook', text: 'Cook Dinner', completed: false},
             ];
             setPhase(GamePhase.BEGINNER_DAY1_HOME); // Start day 2 at Bank/Home
        } else if (nextDayNum === 3) {
             newTodos = [
                 {id: 'drive', text: 'Drive Leo', completed: false},
                 {id: 'bank', text: 'Go to Bank', completed: false},
                 {id: 'casino', text: 'Go to Casino', completed: false},
                 {id: 'pay', text: 'Pay Vinnie', completed: false},
             ];
             setPhase(GamePhase.DRIVING_MINIGAME);
        }
        
        updateState({ 
            day: nextDayNum, 
            time: 420,
            handsPlayedToday: 0,
            todoList: newTodos
        });
        setPhoneMode('TODO');
        setPhoneNotification(true);
        addLog(`--- DAY ${nextDayNum} ---`);
        return;
    }

    // Standard Mode Next Day
    const firstTask = randomizeDailyRoutine();
    updateState({ 
        day: nextDayNum, 
        beardShaved: false, 
        zoneMode: false, 
        time: 420,
        handsPlayedToday: 0,
        skippedPickup: false,
        callsMadeToday: 0
    });
    setPhase(firstTask);
    addLog(`--- DAY ${nextDayNum} ---`);
  };

  // --- RENDER HELPERS ---

  const renderPhone = () => {
    const isRinging = phoneMode === 'INCOMING_CALL';
    
    return (
        <div className={`w-72 h-[500px] bg-black border-4 border-slate-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative transition-transform duration-300 ${shake && isRinging ? 'animate-bounce' : ''}`}>
            {/* Bezel */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
            
            {/* Status Bar */}
            <div className="w-full h-8 bg-slate-950 flex justify-between items-center px-6 pt-2 z-10 text-[10px] text-slate-400">
                <span>{formatTime(state.time)}</span>
                <div className="flex gap-1"><Signal size={10} /><Wifi size={10} /><Battery size={10} /></div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop')] bg-cover"></div>

                {(phoneMode === 'NOTES' || phoneMode === 'TODO') && (
                    <div className="flex flex-col h-full relative z-10">
                         <div className="bg-yellow-100/10 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button onClick={() => setPhoneMode('TODO')} className={`font-bold ${phoneMode === 'TODO' ? 'text-yellow-100' : 'text-slate-500'}`}>To-Do</button>
                                <button onClick={() => setPhoneMode('NOTES')} className={`font-bold ${phoneMode === 'NOTES' ? 'text-yellow-100' : 'text-slate-500'}`}>Notes</button>
                            </div>
                         </div>
                         
                         {phoneMode === 'NOTES' && (
                             <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs text-yellow-100/80 custom-scrollbar">
                                 {logs.map((log) => (
                                     <div key={log.id} className="border-b border-white/5 pb-2">
                                         <span className="opacity-50 text-[10px] block mb-1">{log.time}</span>
                                         {log.text}
                                     </div>
                                 ))}
                                 <div ref={notesEndRef} />
                             </div>
                         )}

                         {phoneMode === 'TODO' && (
                             <div className="flex-1 overflow-y-auto p-4 space-y-3 font-serif text-slate-200">
                                 {state.todoList.length === 0 && <div className="text-center italic opacity-50 mt-10">No tasks.</div>}
                                 {state.todoList.map((item) => (
                                     <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/10">
                                         {item.completed ? <Check className="text-emerald-400 w-5 h-5"/> : <div className="w-5 h-5 border border-slate-500 rounded" />}
                                         <span className={item.completed ? 'line-through opacity-50' : ''}>{item.text}</span>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>
                )}

                {phoneMode === 'INCOMING_CALL' && (
                    <div className="flex flex-col h-full relative z-10 bg-black/80 backdrop-blur-xl items-center justify-between py-12">
                         <div className="flex flex-col items-center animate-pulse">
                             <div className="w-20 h-20 rounded-full bg-slate-700 mb-4 overflow-hidden border-2 border-white/20">
                                 <img src={IMG_SARAH_SAD} alt="Sarah" className="w-full h-full object-cover" />
                             </div>
                             <h3 className="text-2xl text-white font-serif">Sarah (Wife)</h3>
                             <p className="text-slate-400 text-sm">Mobile</p>
                         </div>
                         <div className="w-full px-6 space-y-3">
                             <p className="text-center text-xs text-rose-400 mb-2">SHE IS CALLING.</p>
                             <button onClick={() => setPhoneMode('IN_CALL')} className="w-full py-4 bg-emerald-600 rounded-full flex items-center justify-center gap-2 text-white font-bold animate-pulse"><PhoneIncoming size={20} /> Answer</button>
                             {state.mode !== GameMode.BEGINNER && (
                                <button onClick={() => handlePhoneResponse('hangup')} className="w-full py-4 bg-rose-900/50 border border-rose-800 rounded-full flex items-center justify-center gap-2 text-rose-200 font-bold"><X size={20} /> Decline</button>
                             )}
                         </div>
                    </div>
                )}

                {phoneMode === 'IN_CALL' && (
                    <div className="flex flex-col h-full relative z-10 bg-slate-900/95 p-4">
                        <div className="text-center mb-8 mt-4">
                            <span className="text-emerald-400 text-xs uppercase tracking-widest">Connected</span>
                            <h3 className="text-xl text-white font-serif mt-2">"What did you do today?"</h3>
                        </div>
                        <div className="space-y-3 mt-auto">
                            <button onClick={() => handlePhoneResponse('truth')} className="w-full p-3 bg-slate-800 border border-slate-700 hover:bg-rose-900/30 rounded text-left">
                                <span className="block text-white text-sm font-bold">Tell Truth</span>
                                <span className="text-[10px] text-slate-400">"Gambling." (+Sus)</span>
                            </button>
                            <button onClick={() => handlePhoneResponse('lie_work')} className="w-full p-3 bg-slate-800 border border-slate-700 hover:bg-indigo-900/30 rounded text-left">
                                <span className="block text-white text-sm font-bold">Lie: Friends</span>
                                <span className="text-[10px] text-slate-400">"Hung out with Mike." (Safe)</span>
                            </button>
                            <button onClick={() => handlePhoneResponse('lie_traffic')} className="w-full p-3 bg-slate-800 border border-slate-700 hover:bg-indigo-900/30 rounded text-left">
                                <span className="block text-white text-sm font-bold">Lie: Bar</span>
                                <span className="text-[10px] text-slate-400">"Went for a drink." (Fail)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch (phase) {
      // ... (Existing phases)
      case GamePhase.INTRO:
        return (
          <div className="flex flex-col items-center justify-center min-h-[100vh] text-center animate-slide-up z-20 w-full relative py-8 px-4">
            <div className="absolute inset-0 bg-black/60 z-[-1]"></div>
            <div className="rain-overlay"></div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter mb-4 text-slate-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none text-flicker">
              UNDERCOVER<br/><span className="text-rose-950 stroke-white bg-clip-text text-transparent bg-gradient-to-t from-red-900 to-black stroke-1">GAMBLER</span>
            </h1>
            <div className="flex gap-4 z-50 mt-12">
              <Button 
                  onClick={startDifficultySelect} 
                  className="w-64 py-4 text-lg font-black !bg-slate-100 !text-black hover:!bg-white border-4 border-slate-300 tracking-[0.25em] animate-pulse"
              >
                  START GAME
              </Button>
            </div>
          </div>
        );

      case GamePhase.DIFFICULTY_SELECT:
          return (
              <div className="max-w-4xl w-full mx-auto animate-slide-up bg-slate-900/90 border border-slate-700 p-8 rounded-lg relative z-20 shadow-2xl text-center">
                  <h2 className="text-4xl font-serif text-white mb-8">Select Mode</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Beginner */}
                      <div className="p-6 border-2 border-emerald-500/50 bg-emerald-900/10 rounded flex flex-col items-center hover:bg-emerald-900/20 transition-colors">
                          <h3 className="text-2xl font-bold text-emerald-400 mb-2">Beginner</h3>
                          <p className="text-sm text-slate-400 mb-4">3 Days. Guided Tutorial. Easier Economy.</p>
                          <Button onClick={() => selectDifficulty(GameMode.BEGINNER)} variant="primary">SELECT</Button>
                      </div>
                      
                      {/* Standard */}
                      <div className={`p-6 border-2 rounded flex flex-col items-center transition-colors ${state.difficultyCompleted.beginner ? 'border-indigo-500/50 bg-indigo-900/10 hover:bg-indigo-900/20' : 'border-slate-700 bg-slate-800 opacity-60'}`}>
                          <div className="flex items-center gap-2 mb-2">
                             {!state.difficultyCompleted.beginner && <Lock size={20} />}
                             <h3 className={`text-2xl font-bold ${state.difficultyCompleted.beginner ? 'text-indigo-400' : 'text-slate-500'}`}>Standard</h3>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">7 Days. Full Experience. Permadeath.</p>
                          <Button onClick={() => selectDifficulty(GameMode.STANDARD)} disabled={!state.difficultyCompleted.beginner} variant="secondary">
                             {state.difficultyCompleted.beginner ? 'SELECT' : 'LOCKED'}
                          </Button>
                      </div>

                      {/* Hard */}
                      <div className="p-6 border-2 border-slate-700 bg-slate-800 opacity-60 rounded flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-2">
                             <Lock size={20} />
                             <h3 className="text-2xl font-bold text-slate-500">Hard</h3>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">Unforgiving. Requires Standard Clear.</p>
                          <Button disabled variant="outline">LOCKED</Button>
                      </div>
                  </div>
              </div>
          );

      case GamePhase.BEGINNER_INTRO_VINNIE_CALL:
        return <VinnieCallIntro onComplete={() => {
            setPhase(GamePhase.BEGINNER_DAY1_HOME);
            addLog("DAY 1: Check your phone.");
        }} />;

      case GamePhase.BEGINNER_DAY1_HOME:
          const allTodosDone = state.todoList.every(t => t.completed);
          const bankTask = state.todoList.find(t => t.id === 'bank');
          
          return (
            <div className="max-w-2xl w-full mx-auto text-center animate-slide-up relative z-20 pt-20">
               <div className="absolute inset-0 z-0 opacity-40">
                   {/* Bedroom BG */}
                   <img src={IMG_BEDROOM} className="w-full h-full object-cover rounded-lg grayscale" alt="Bedroom" />
               </div>
               <div className="relative z-10 bg-black/80 p-8 rounded-xl border border-slate-700 shadow-2xl">
                   <h2 className="text-3xl font-serif text-slate-200 mb-4">Day {state.day}</h2>
                   
                   {!allTodosDone && bankTask && !bankTask.completed && (
                        <>
                            <p className="text-slate-400 mb-8 font-serif italic">You need to sort out your finances before Vinnie calls.</p>
                            <Button onClick={() => setPhase(GamePhase.BEGINNER_DAY1_BANK)} fullWidth variant="primary">GO TO BANK</Button>
                        </>
                   )}

                   {allTodosDone && (
                        <div className="animate-slide-up">
                            <p className="text-slate-400 mb-8 font-serif italic">The day is done. You survived.</p>
                            <Button onClick={endDayLogic} fullWidth variant="primary" icon={Moon}>SLEEP</Button>
                        </div>
                   )}
                   
                   {!allTodosDone && bankTask && bankTask.completed && !state.todoList.find(t => t.id === 'sarah')?.completed && (
                       // Intermediate state (waiting for phone call), show nothing or a subtle hint
                       <div className="text-slate-500 italic animate-pulse">...</div>
                   )}
                   
                   {/* Phone Call Tutorial Overlay */}
                   {state.mode === GameMode.BEGINNER && state.day === 1 && phoneMode === 'IN_CALL' && !phoneTutorialDismissed && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-slate-900 border border-indigo-500 p-6 rounded-lg shadow-2xl z-50 animate-slide-up">
                           <div className="flex items-center gap-2 mb-4">
                               <Info className="text-indigo-400" />
                               <h3 className="text-lg font-bold text-white">Suspicion Mechanics</h3>
                           </div>
                           <p className="text-slate-300 text-sm mb-4">
                               Your answers affect Sarah's <strong>Suspicion</strong>. 
                               Lying is risky but lowers suspicion if successful. Telling the truth is safe but raises suspicion.
                           </p>
                           <div className="bg-slate-800 p-3 rounded mb-4">
                               <p className="text-emerald-300 text-xs italic">"I'm coming back from my mother's with Leo. Be prepared to make dinner tomorrow."</p>
                           </div>
                           <Button fullWidth onClick={() => setPhoneTutorialDismissed(true)}>Got it</Button>
                       </div>
                   )}
               </div>
            </div>
          );

      case GamePhase.BEGINNER_DAY1_BANK:
          // Check if Day 1 tutorial or later days
          const isTutorial = state.day === 1 && state.beginnerTutorialActive;
          
          return (
            <div className="max-w-3xl w-full mx-auto animate-slide-up relative">
                {isTutorial && bankTutorialStep === 0 && (
                    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 text-center rounded">
                        <div className="mt-8">
                            <p className="text-slate-200 text-xl mb-4 max-w-lg mx-auto leading-relaxed">
                                Look at the top left. You will see how much cash you have on hand, how much is in the bank, and how much you owe your old drug dealer, Vinnie.
                            </p>
                            <Button onClick={() => setBankTutorialStep(1)}>Next</Button>
                        </div>
                    </div>
                )}
                {isTutorial && bankTutorialStep === 1 && (
                    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-8 text-center rounded">
                        <div>
                            <p className="text-rose-400 text-xl mb-4 max-w-lg mx-auto leading-relaxed">
                                Now look at the top right. This is your SUSPICION meter. The more you withdraw from the bank and fail tasks, the more suspecting your family will become.
                            </p>
                            <Button onClick={() => setBankTutorialStep(2)}>Next</Button>
                        </div>
                    </div>
                )}
                {isTutorial && bankTutorialStep === 2 && (
                    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-8 text-center rounded">
                        <div>
                            <p className="text-slate-200 text-xl mb-4">Manage your finances here. Go to the casino now.</p>
                            <Button onClick={() => setBankTutorialStep(3)}>Got it</Button>
                        </div>
                    </div>
                )}

                <div className="text-center mb-12">
                    <Landmark className="w-8 h-8 mx-auto text-slate-600 mb-4" />
                    <h2 className="text-2xl font-serif text-slate-300">City Bank</h2>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="bg-black/40 border border-slate-800 p-6 text-center">
                        <span className="text-xs uppercase tracking-widest text-slate-500">Cash</span>
                        <div className="text-3xl font-serif text-emerald-500 mt-2">${state.cash}</div>
                    </div>
                    <div className="bg-black/40 border border-slate-800 p-6 text-center">
                        <span className="text-xs uppercase tracking-widest text-slate-500">Bank</span>
                        <div className="text-3xl font-serif text-indigo-400 mt-2">${state.bankBalance}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => !isTutorial && handleBanking('deposit')} disabled={isTutorial} variant="secondary" icon={ArrowRightLeft}>Deposit $100</Button>
                    <Button onClick={() => !isTutorial && handleBanking('withdraw')} disabled={isTutorial} variant="secondary" icon={Banknote}>Withdraw $100</Button>
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={finishBanking} variant="primary" className="w-64">Enter Casino</Button>
                </div>
            </div>
          );

      case GamePhase.BEGINNER_BLACKJACK:
          return (
             <div className="w-full h-full animate-slide-up relative flex items-center justify-center">
                <Blackjack 
                    drunkMode={false} 
                    zoneMode={false}
                    cash={state.cash} 
                    onGameEnd={handleTutorialBlackjackEnd} 
                    onExit={leaveCasino}
                    tutorialMode={true}
                    onTutorialComplete={leaveCasino}
                />
             </div>
          );

      case GamePhase.COOKING_MINIGAME:
          return <CookingMinigame onComplete={handleCookingComplete} />;

      case GamePhase.DRIVING_MINIGAME:
          return <DrivingMinigame onComplete={handleDrivingComplete} />;
      
      // ... Reusing Existing Phases below ...
      case GamePhase.TUTORIAL:
          // ... (Existing Code) ...
          return null; // Should not reach here in updated flow, or reuse existing

      case GamePhase.MAKE_BED:
          return <BedMaking onComplete={handleBedComplete} />;
      
      case GamePhase.MAKE_LUNCH:
          return <LunchMaking onComplete={handleLunchComplete} />;
      
      case GamePhase.FIND_KEYS:
          return <FindKeys onComplete={handleKeysComplete} />;

      case GamePhase.WATER_PLANTS:
          return <WaterPlants onComplete={handleWaterPlantsComplete} />;

      case GamePhase.MORNING_ROUTINE:
        return (
          <div className="flex gap-8 items-center max-w-4xl w-full mx-auto animate-slide-up">
            <div className="w-1/2 h-[400px] relative rounded overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 group">
                 <img src={IMG_SARAH_SAD} alt="Sarah" className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-1000" />
                 <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                     <p className="text-slate-300 font-serif italic border-l-2 border-pink-500 pl-4">"You were tossing and turning all night. Is it Vinnie again?"</p>
                 </div>
            </div>
            <div className="w-1/2 space-y-8">
               <div>
                  <h2 className="text-3xl font-serif text-slate-200 mb-2">07:45 AM</h2>
                  <p className="text-slate-500 font-serif text-sm">The mirror reveals the damage.</p>
               </div>
               <div className="space-y-4">
                 <button onClick={() => handleMorningRoutine('shave')} className="w-full p-4 border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-900/10 transition-all text-left group">
                    <span className="block text-slate-300 font-bold mb-1 group-hover:pl-2 transition-all">Shave Clean</span>
                    <span className="text-xs text-slate-500 font-mono-theme">Cost: ${COST_SHAVE} // -10 Suspicion</span>
                 </button>
                 <button onClick={() => handleMorningRoutine('ignore')} className="w-full p-4 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 transition-all text-left group">
                    <span className="block text-slate-300 font-bold mb-1 group-hover:pl-2 transition-all">Ignore Reflection</span>
                    <span className="text-xs text-slate-500 font-mono-theme">Save Money // Look guilty</span>
                 </button>
               </div>
            </div>
          </div>
        );

      case GamePhase.MORNING_CHOICE:
        return (
          <div className="max-w-2xl w-full mx-auto animate-slide-up text-center">
            <h2 className="text-3xl font-serif text-slate-200 mb-12">Choose Your Vice</h2>
            <div className="grid grid-cols-2 gap-12">
              <div onClick={() => handleDrinkChoice('coffee')} className="group cursor-pointer">
                <div className="w-32 h-32 mx-auto rounded-full border border-slate-700 flex items-center justify-center mb-6 group-hover:border-amber-700 transition-colors bg-slate-900/50">
                    <Coffee className="w-12 h-12 text-slate-500 group-hover:text-amber-100 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 mb-2">Coffee</h3>
                <p className="text-xs text-slate-500 font-mono-theme">Standard Rules (Dealer 17)</p>
              </div>
              <div onClick={() => handleDrinkChoice('beer')} className="group cursor-pointer">
                <div className="w-32 h-32 mx-auto rounded-full border border-slate-700 flex items-center justify-center mb-6 group-hover:border-amber-500 transition-colors bg-slate-900/50">
                    <Beer className="w-12 h-12 text-slate-500 group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 mb-2">Beer</h3>
                <p className="text-xs text-slate-500 font-mono-theme">Dealer Stands on 15 / +Suspicion</p>
              </div>
            </div>
          </div>
        );

      case GamePhase.COMMUTE_MINIGAME:
        return (
          <div className="flex gap-8 items-center max-w-4xl w-full mx-auto animate-slide-up">
             <div className="w-1/2 space-y-8 text-right">
               <div>
                  <h2 className="text-3xl font-serif text-slate-200 mb-2">The Commute</h2>
                  <p className="text-slate-500 font-serif text-sm">Taking Leo to school.</p>
               </div>
               <div className="space-y-4">
                 <button onClick={() => handleCommute(true)} className="w-full p-4 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all text-right group">
                    <span className="block text-slate-300 font-bold mb-1 group-hover:pr-2 transition-all">Drive Safely</span>
                    <span className="text-xs text-slate-500 font-mono-theme">Cost: ${COST_COMMUTE_SAFE} // Arrive 9:30</span>
                 </button>
                 <button onClick={() => handleCommute(false)} className="w-full p-4 border border-slate-700 hover:border-rose-500/50 hover:bg-rose-900/10 transition-all text-right group">
                    <span className="block text-slate-300 font-bold mb-1 group-hover:pr-2 transition-all">Weave Through Traffic</span>
                    <span className="text-xs text-slate-500 font-mono-theme">Free // Arrive 9:00 // Casino 'Zone Mode'</span>
                 </button>
               </div>
            </div>
            <div className="w-1/2 h-[400px] relative rounded overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
                 <img src={IMG_LEO_SAD} alt="Leo" className="object-cover w-full h-full" />
                 <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                     <p className="text-slate-300 font-serif italic text-right">"You smell funny, Dad."</p>
                 </div>
            </div>
          </div>
        );

      case GamePhase.BANKING:
          return (
            <div className="max-w-3xl w-full mx-auto animate-slide-up">
                <div className="text-center mb-12">
                    <Landmark className="w-8 h-8 mx-auto text-slate-600 mb-4" />
                    <h2 className="text-2xl font-serif text-slate-300">Launder Your Earnings</h2>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="bg-black/40 border border-slate-800 p-6 text-center">
                        <span className="text-xs uppercase tracking-widest text-slate-500">Cash in Hand</span>
                        <div className="text-3xl font-serif text-emerald-500 mt-2">${state.cash}</div>
                    </div>
                    <div className="bg-black/40 border border-slate-800 p-6 text-center">
                        <span className="text-xs uppercase tracking-widest text-slate-500">Bank (Legit)</span>
                        <div className="text-3xl font-serif text-indigo-400 mt-2">${state.bankBalance}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => handleBanking('deposit')} variant="secondary" icon={ArrowRightLeft}>Deposit $100</Button>
                    <Button onClick={() => handleBanking('withdraw')} variant="secondary" icon={Banknote}>Withdraw $100</Button>
                    <Button onClick={() => handleBanking('loan')} variant="danger" icon={AlertTriangle} disabled={state.loansTaken >= MAX_LOANS}>
                        Shark Loan ($2500) {state.loansTaken >= MAX_LOANS ? '(MAXED)' : ''}
                    </Button>
                    <Button onClick={() => handleBanking('gift')} variant="primary" icon={Gift}>
                        Buy Flowers (${COST_GIFT})
                    </Button>
                </div>
                <p className="text-center text-xs text-slate-500 mt-2 font-mono-theme">Buying gifts reduces suspicion greatly.</p>
                <div className="mt-12 text-center">
                    <Button onClick={finishBanking} variant="outline" className="w-48">Enter Casino</Button>
                </div>
            </div>
          );

      case GamePhase.CASINO:
        return (
          <div className="w-full h-full animate-slide-up relative flex items-center justify-center">
             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000000_100%)] z-0 opacity-50"></div>
             
             <div className={`transition-all duration-500 ${phoneMode !== 'NOTES' && phoneMode !== 'TODO' ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
                <Blackjack 
                    drunkMode={state.drunk} 
                    zoneMode={state.zoneMode}
                    cash={state.cash} 
                    onGameEnd={handleBlackjackEnd}
                    onExit={leaveCasino}
                />
             </div>
          </div>
        );

      case GamePhase.PICKUP_DECISION:
        return (
            <div className="max-w-xl w-full mx-auto animate-slide-up text-center">
                <Clock className="w-16 h-16 text-amber-500 mx-auto mb-8 animate-pulse" />
                <h2 className="text-4xl font-serif text-white mb-4">3:00 PM</h2>
                <p className="text-slate-400 mb-12 font-serif text-lg">School is out. Leo is waiting on the curb.</p>
                
                <div className="grid grid-cols-2 gap-8">
                     <button onClick={() => handlePickupDecision('home')} className="group p-8 border border-slate-700 bg-slate-900/50 hover:bg-emerald-900/20 hover:border-emerald-500 transition-all rounded-lg">
                        <Home className="w-12 h-12 mx-auto text-slate-500 group-hover:text-emerald-400 mb-4 transition-colors" />
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Go Home</h3>
                        <p className="text-xs text-slate-500 font-mono-theme">Be a father. End the day.</p>
                     </button>
                     <button onClick={() => handlePickupDecision('casino')} className="group p-8 border border-slate-700 bg-slate-900/50 hover:bg-rose-900/20 hover:border-rose-500 transition-all rounded-lg">
                        <Dices className="w-12 h-12 mx-auto text-slate-500 group-hover:text-rose-400 mb-4 transition-colors" />
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Back to Casino</h3>
                        <p className="text-xs text-slate-500 font-mono-theme">Just one more hand. (+30 Suspicion)</p>
                     </button>
                </div>
            </div>
        );

      case GamePhase.THE_DROP:
          const required = state.day === MAX_DAYS || (state.mode === GameMode.BEGINNER && state.day === 3) ? state.debt : DAILY_MIN_PAYMENT;
          
          let maxPayable = state.cash;
          // Cap Day 2 payment for tutorial purposes
          const isBeginnerEarly = state.mode === GameMode.BEGINNER && state.day <= 2;
          
          if (isBeginnerEarly) {
              maxPayable = Math.min(state.cash, 200);
          }

          return (
             <div className="max-w-lg w-full mx-auto animate-slide-up text-center">
                 <h2 className="text-4xl font-serif text-rose-700 mb-8 tracking-widest">THE DROP</h2>
                 
                 <div className="bg-black/80 p-8 border border-rose-900/30 shadow-[0_0_50px_rgba(225,29,72,0.1)] mb-8">
                     <p className="text-slate-500 text-sm mb-6 font-mono-theme">Vinnie is waiting in the alley.</p>
                     
                     <div className="space-y-4 font-serif">
                         <div className="border-t border-slate-800 pt-4 flex justify-between text-rose-500 text-xl">
                             <span>DUE TODAY</span>
                             <span>${required}</span>
                         </div>
                     </div>
                 </div>

                 <div className="flex items-center justify-center gap-6 mb-8">
                     <button onClick={() => setAmountToHandle(Math.max(0, amountToHandle - 100))} className="w-12 h-12 rounded-full border border-slate-700 hover:bg-white/10 text-xl">-</button>
                     <div className="text-5xl font-serif text-white">${amountToHandle}</div>
                     <button onClick={() => setAmountToHandle(Math.min(maxPayable, amountToHandle + 100))} className="w-12 h-12 rounded-full border border-slate-700 hover:bg-white/10 text-xl">+</button>
                 </div>
                 
                 {isBeginnerEarly && amountToHandle < 200 && (
                     <div className="text-sm text-yellow-500 mb-4 font-mono-theme animate-pulse">
                         Instruction: Increase payment to $200.
                     </div>
                 )}
                 {isBeginnerEarly && amountToHandle >= 200 && (
                     <div className="text-xs text-rose-400 mb-4 font-mono-theme">
                         Vinnie: "That's enough for today. Save the rest for tomorrow."
                     </div>
                 )}

                 <div className="space-y-4">
                    <Button 
                        onClick={handlePayment} 
                        variant="danger" 
                        fullWidth 
                        disabled={amountToHandle === 0 || (isBeginnerEarly && amountToHandle < 200 && state.cash >= 200)}
                    >
                        HAND OVER CASH
                    </Button>
                    <Button onClick={finishDrop} variant="ghost" fullWidth>Walk Away (Consequences)</Button>
                 </div>
             </div> 
          );

      case GamePhase.EVENING_INTERROGATION:
        if (!currentEvent) return null;
        return (
          <div className="flex gap-12 items-center max-w-5xl w-full mx-auto animate-slide-up">
             <div className="w-1/2 h-[500px] relative rounded overflow-hidden shadow-2xl grayscale contrast-125">
                 <img 
                    src={currentEvent.speaker === 'Leo' ? IMG_LEO_SAD : IMG_SARAH_SAD} 
                    alt={currentEvent.speaker} 
                    className="object-cover w-full h-full" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            </div>
            <div className="w-1/2">
                <div className="mb-8 border-l-2 border-slate-700 pl-6">
                    <h3 className="text-lg font-bold text-slate-400 mb-2">{currentEvent.speaker}</h3>
                    <p className="text-2xl font-serif text-slate-200 italic leading-relaxed">"{currentEvent.text}"</p>
                </div>
                <div className="space-y-3">
                {currentEvent.options.map((option, idx) => (
                    <button 
                    key={idx}
                    onClick={() => handleExcuse(idx)}
                    className="w-full text-left p-4 border border-slate-800 hover:border-indigo-900 hover:bg-slate-900/50 transition-all group"
                    >
                    <span className="block text-slate-400 group-hover:text-slate-200 transition-colors font-serif">"{option.text}"</span>
                    </button>
                ))}
                </div>
            </div>
          </div>
        );

      case GamePhase.NEXT_DAY_TRANSITION:
        return (
          <div className="text-center space-y-12 animate-slide-up py-12">
             <div>
                 <h2 className="text-6xl font-serif text-slate-200 mb-4">Night Falls</h2>
                 <p className="text-slate-500 font-serif italic">You survived Day {state.day}.</p>
             </div>
             
             <div className="flex justify-center gap-12 text-left">
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Debt Remaining</div>
                    <div className="text-4xl text-rose-700 font-serif">${state.debt}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Bank Balance</div>
                    <div className="text-4xl text-indigo-400 font-serif">${state.bankBalance}</div>
                </div>
             </div>

             <div className="pt-8">
                {state.cash >= state.debt && state.day === state.maxDays ? (
                <Button onClick={payDebt} variant="primary" className="text-xl px-12 py-4">PAY THE DEBT</Button>
                ) : (
                <Button onClick={nextDay} variant="outline" className="w-64">Sleep</Button>
                )}
             </div>
          </div>
        );

      case GamePhase.GAME_OVER_DEBT:
      case GamePhase.GAME_OVER_WIFE:
      case GamePhase.GAME_OVER_MISSED_PAYMENT:
        const reason = phase;
        let title = "GAME OVER";
        let desc = "";
        let img = "";
        
        if (reason === GamePhase.GAME_OVER_DEBT) {
            title = "DEADLINE";
            desc = "You ran out of time. Vinnie didn't even knock.";
            img = IMG_CASINO; 
        } else if (reason === GamePhase.GAME_OVER_WIFE) {
            title = "EMPTY HOUSE";
            desc = "Sarah left a note. She took Leo. The silence is deafening.";
            img = IMG_SARAH_SAD;
        } else if (reason === GamePhase.GAME_OVER_MISSED_PAYMENT) {
            title = "EXECUTED";
            desc = "You missed the drop. They found you in the alley.";
            img = IMG_CASINO;
        }

        return (
          <div className="text-center max-w-4xl mx-auto animate-slide-up relative z-20">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] z-[-1] opacity-20 blur-sm pointer-events-none">
                 <img src={img} className="w-full h-full object-cover grayscale" />
             </div>
            <h2 className="text-8xl font-serif font-bold mb-8 text-white drop-shadow-lg">
                {title}
            </h2>
            <p className="text-slate-300 text-xl leading-relaxed mb-12 font-serif italic max-w-xl mx-auto">
              {desc}
            </p>
            <Button onClick={resetGame} variant="outline">Try Again</Button>
          </div>
        );

      case GamePhase.VICTORY:
        return (
          <div className="text-center py-12 max-w-lg mx-auto animate-slide-up">
            <Briefcase className="w-16 h-16 text-emerald-500 mx-auto mb-8 opacity-80" />
            <h2 className="text-6xl font-serif text-white mb-6">DEBT PAID</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12 font-serif">
              It's over. The shadow is lifted.<br/>
              But you can still see the cards when you close your eyes.
            </p>
            <div className="flex gap-4 justify-center">
                 <Button onClick={resetGame} variant="primary">New Life</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-full bg-[#0a0a0a] text-slate-200 font-sans overflow-hidden ${shake ? 'shake' : ''}`}>
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#111] to-[#050505] -z-10"></div>
      
      {/* Cinematic HUD - Absolute Top */}
      {phase !== GamePhase.INTRO && phase !== GamePhase.DIFFICULTY_SELECT && phase !== GamePhase.BEGINNER_INTRO_VINNIE_CALL && (
        <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-transparent">
             {/* Left Stats */}
             <div className="flex gap-8">
                 <StatBadge icon={Calendar} label="Day" value={state.day} />
                 {state.mode !== GameMode.BEGINNER && (
                    <StatBadge icon={Clock} label="Time" value={formatTime(state.time)} />
                 )}
                 <StatBadge icon={DollarSign} label="Wallet" value={`$${state.cash}`} highlight />
                 <StatBadge icon={Landmark} label="Bank" value={`$${state.bankBalance}`} />
                 <StatBadge icon={Target} label="Debt" value={`$${state.debt}`} danger />
             </div>

             {/* Right Suspicion */}
             <div className="w-64">
                <ProgressBar 
                    value={state.suspicion} 
                    max={SUSPICION_LIMIT} 
                    label="Suspicion" 
                    color={state.suspicion > 50 ? 'bg-rose-600' : 'bg-slate-400'}
                />
             </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 z-10">
        {renderContent()}
      </div>

      {/* Phone UI - Bottom Right */}
      {phase !== GamePhase.INTRO && phase !== GamePhase.DIFFICULTY_SELECT && phase !== GamePhase.BEGINNER_INTRO_VINNIE_CALL && (
          <div className="absolute bottom-8 right-8 z-50">
             {renderPhone()}
          </div>
      )}
    </div>
  );
}