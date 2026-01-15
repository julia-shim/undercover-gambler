import React, { useState, useEffect, useRef } from 'react';
import { 
  GamePhase, 
  PlayerState,
  InteractionEvent
} from './types';
import { 
  INITIAL_CASH, 
  INITIAL_BANK,
  INITIAL_DEBT, 
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
import { BedMaking, LunchMaking, FindKeys, WaterPlants } from './components/QTEs';
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
  Skull
} from 'lucide-react';

// --- Stock Photos ---
const IMG_SARAH_SAD = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"; 
const IMG_LEO_SAD = "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000&auto=format&fit=crop"; 
const IMG_CASINO = "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000&auto=format&fit=crop"; 

// --- Phone Types ---
type PhoneMode = 'LOCKED' | 'NOTES' | 'INCOMING_CALL' | 'IN_CALL';

const INITIAL_STATE: PlayerState = {
    cash: INITIAL_CASH,
    bankBalance: INITIAL_BANK,
    debt: INITIAL_DEBT,
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
    hasCalledInCasino: false
};

export default function App() {
  const [state, setState] = useState<PlayerState>(INITIAL_STATE);
  const [phase, setPhase] = useState<GamePhase>(GamePhase.INTRO);
  const [logs, setLogs] = useState<{id: number, text: string, time: string}[]>([]);
  const [currentEvent, setCurrentEvent] = useState<InteractionEvent | null>(null);
  const [shake, setShake] = useState(false);
  const [amountToHandle, setAmountToHandle] = useState(0); 
  
  // Phone State
  const [phoneMode, setPhoneMode] = useState<PhoneMode>('NOTES');
  const [phoneNotification, setPhoneNotification] = useState(false);
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Determine Daily QTEs
  // We will store the "Task 2" in a ref or state to know what comes after Task 1
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

  useEffect(() => {
    if (state.suspicion >= SUSPICION_LIMIT && phase !== GamePhase.GAME_OVER_WIFE) {
      setPhase(GamePhase.GAME_OVER_WIFE);
      triggerShake();
    }
  }, [state.suspicion, phase]);

  const resetGame = () => {
      setState(INITIAL_STATE);
      setLogs([]);
      setPhase(GamePhase.INTRO);
      setPhoneMode('NOTES');
      setPhoneNotification(false);
  };

  const randomizeDailyRoutine = () => {
      // Task 1 is always Make Bed now (Coffee removed)
      const selectedTask1 = GamePhase.MAKE_BED;
      
      // Pick Task 2
      const task2Options = [GamePhase.MAKE_LUNCH, GamePhase.FIND_KEYS];
      const selectedTask2 = task2Options[Math.floor(Math.random() * task2Options.length)];
      
      setNextQTE(selectedTask2);
      return selectedTask1;
  };

  const startGame = () => {
    const firstTask = randomizeDailyRoutine();
    setPhase(firstTask);
    addLog("Wake up. Head throbbing.");
  };

  // --- QTE HANDLERS ---

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

  // Wrappers for specific components
  const handleBedComplete = (s: boolean) => handleTask1Complete(s, "Made the bed. A small victory.", "Left the sheets messy. Sarah will notice.");
  
  const handleLunchComplete = (s: boolean) => handleTask2Complete(s, "Leo's lunch packed. Just how he likes it.", "Messed up the sandwich. He'll go hungry.");
  const handleKeysComplete = (s: boolean) => handleTask2Complete(s, "Found the keys immediately.", "Couldn't find keys. Panic. Lost time.");


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
    // Current time is roughly 8:00 AM (480)
    
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
          time: 570 // Arrive at 9:30 AM
      });
      addLog("Drove safe. Arrived at Casino: 9:30 AM.");
    } else {
      const success = Math.random() > 0.4;
      if (success) {
        updateState({ 
            zoneMode: true,
            time: 540 // Arrive at 9:00 AM (Reward)
        });
        addLog("Drove like a maniac. Arrived early: 9:00 AM.");
      } else {
        updateState({ 
            suspicion: state.suspicion + 15, 
            zoneMode: false,
            time: 570 // Late anyway due to traffic stop/near miss
        });
        triggerShake();
        addLog("Near miss on the highway. Late anyway: 9:30 AM.");
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
              addLog("Withdrew $100. Paper trail created. (+Suspicion)");
          }
      } else if (action === 'loan') {
          if (state.loansTaken >= MAX_LOANS) {
              addLog("Vinnie denied the loan. 'Pay what you owe first.'");
              triggerShake();
              return;
          }
          updateState({ cash: state.cash + 500, debt: state.debt + 750, loansTaken: state.loansTaken + 1 });
          addLog(`Took shark loan #${state.loansTaken + 1}. Soul sold.`);
      } else if (action === 'gift') {
          if (state.cash >= COST_GIFT) {
              updateState({ 
                  cash: state.cash - COST_GIFT, 
                  suspicion: Math.max(0, state.suspicion - SUSPICION_REDUCTION_GIFT) 
              });
              addLog("Bought flowers for Sarah. Guilt money.");
          } else {
              addLog("Can't afford the flowers. Pathetic.");
          }
      }
  };

  const finishBanking = () => {
      updateState({ hasCalledInCasino: false }); // Reset call flag for new session
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
              addLog("Called home. 'Just checking in.' She sounded tired.");
          } else {
              updateState({ 
                  time: state.time + 10,
                  callsMadeToday: newCalls
              });
              addLog("Called home. No need, she trusts you right now.");
          }
      } else {
          // 3rd call or more
          updateState({
              suspicion: state.suspicion + 10,
              time: state.time + 10,
              callsMadeToday: newCalls
          });
          triggerShake();
          addLog("Called home again. 'Why do you keep calling? What did you do?'");
      }
  };

  const handlePhoneResponse = (responseType: 'truth' | 'lie_work' | 'lie_traffic' | 'hangup') => {
      setPhoneMode('NOTES');
      setPhoneNotification(false);

      if (responseType === 'truth') {
          updateState({ suspicion: state.suspicion + 40 });
          addLog("Call: Told Sarah you're gambling. Silence on the line.");
          triggerShake();
      } else if (responseType === 'hangup') {
          updateState({ suspicion: state.suspicion + 15 });
          addLog("Call: Sent Sarah to voicemail. Risky.");
      } else {
          // Lies
          const success = Math.random() > 0.4;
          if (success) {
              updateState({ suspicion: Math.max(0, state.suspicion - 5) });
              addLog(`Call: Lied ("${responseType === 'lie_work' ? 'Working late' : 'Traffic'}"). She bought it.`);
          } else {
              updateState({ suspicion: state.suspicion + 10 });
              addLog(`Call: Lied. She heard the slot machines in the background.`);
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

    // 15:00 (3:00 PM) Pickup Alarm
    if (newTime >= 900 && !state.skippedPickup) {
        setPhase(GamePhase.PICKUP_DECISION);
        addLog("ALARM: 3:00 PM. Pick up Leo.");
        return;
    }

    // Phone Call Logic (Increasing chance), ONLY if hasn't called yet this session
    const baseChance = 0.05;
    const callChance = baseChance * newHandsPlayed; 
    
    if (Math.random() < callChance && phoneMode !== 'INCOMING_CALL' && !state.hasCalledInCasino) {
        triggerIncomingCall();
    }
  };

  const handlePickupDecision = (choice: 'home' | 'casino') => {
      if (choice === 'home') {
          updateState({ time: 1080 }); // 6:00 PM
          setPhase(GamePhase.THE_DROP);
          setAmountToHandle(0);
      } else {
          // Back to Casino - Very Risky
          updateState({ 
              suspicion: state.suspicion + 30, 
              time: 960, // 4:00 PM start
              skippedPickup: true,
              hasCalledInCasino: false // Reset flag for new session
          });
          addLog("Ignored school pickup. Sarah will have to get him. She is furious.");
          triggerShake();
          setPhase(GamePhase.CASINO);
      }
  };

  const leaveCasino = () => {
    if (phoneMode === 'INCOMING_CALL') {
        handlePhoneResponse('hangup');
    }
    
    // If we are leaving and haven't hit the pickup time yet, fast forward to pickup
    if (state.time < 900) {
        addLog("Waiting in car until school ends...");
        updateState({ time: 900 });
        setPhase(GamePhase.PICKUP_DECISION);
    } else {
        // If we are leaving after 3PM (skipped pickup), go straight to drop
        setPhase(GamePhase.THE_DROP);
        setAmountToHandle(0);
    }
  };
  
  const handlePayment = () => {
      if (amountToHandle > state.cash) return;
      
      const newTotalPaid = state.totalPaid + amountToHandle;
      const newDebt = state.debt - amountToHandle;
      
      updateState({
          cash: state.cash - amountToHandle,
          debt: newDebt,
          totalPaid: newTotalPaid
      });

      if (state.day === MAX_DAYS) {
          if (newDebt <= 0) {
             setPhase(GamePhase.VICTORY);
          } else {
             finishDrop(); 
          }
      } else {
          if (amountToHandle >= DAILY_MIN_PAYMENT) {
              addLog(`Paid Vinnie $${amountToHandle}. Safe for tonight.`);
              setPhase(GamePhase.WATER_PLANTS); // New Flow: Go to plants before interrogation
          }
      }
  };
  
  const finishDrop = () => {
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
      const newBank = state.bankBalance - DAILY_EXPENSES;
      let susChange = 0;
      
      if (newBank < 0) {
          susChange = 20;
          addLog("Bill autopay failed. Sarah is crying in the kitchen.");
          triggerShake();
      } else if (newBank < 100) {
          susChange = 10;
          addLog("Bank balance critical. Fridge is empty.");
      } else {
          addLog("Bills paid. Another day survived.");
      }
      
      updateState({ bankBalance: newBank, suspicion: state.suspicion + susChange });
      
      if (state.debt <= 0 && state.day === MAX_DAYS) {
          setPhase(GamePhase.VICTORY);
      } else if (state.day >= MAX_DAYS && state.debt > 0) {
           setPhase(GamePhase.GAME_OVER_DEBT);
      } else {
          setPhase(GamePhase.NEXT_DAY_TRANSITION);
      }
  };

  const payDebt = () => {
    if (state.cash >= state.debt) {
        updateState({ cash: state.cash - state.debt, debt: 0 });
        setPhase(GamePhase.VICTORY);
    }
  };

  const nextDay = () => {
    const firstTask = randomizeDailyRoutine();
    updateState({ 
        day: state.day + 1, 
        beardShaved: false, 
        zoneMode: false, 
        time: 420,
        handsPlayedToday: 0,
        skippedPickup: false,
        callsMadeToday: 0
    });
    setPhase(firstTask);
    addLog(`--- DAY ${state.day + 1} ---`);
  };

  // --- RENDER HELPERS ---

  const renderPhone = () => {
    const isRinging = phoneMode === 'INCOMING_CALL';
    
    return (
        <div className={`w-72 h-[500px] bg-black border-4 border-slate-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative transition-transform duration-300 ${shake && isRinging ? 'animate-bounce' : ''}`}>
            {/* Bezel / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
            
            {/* Status Bar */}
            <div className="w-full h-8 bg-slate-950 flex justify-between items-center px-6 pt-2 z-10 text-[10px] text-slate-400">
                <span>{formatTime(state.time)}</span>
                <div className="flex gap-1">
                    <Signal size={10} />
                    <Wifi size={10} />
                    <Battery size={10} />
                </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 bg-slate-900 relative overflow-hidden">
                {/* Wallpaper */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop')] bg-cover"></div>

                {phoneMode === 'NOTES' && (
                    <div className="flex flex-col h-full relative z-10">
                         <div className="bg-yellow-100/10 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-yellow-100">Notes</h3>
                            <button onClick={handleCallHome} className="p-2 bg-white/10 rounded-full hover:bg-white/20" title="Call Home">
                                <Phone size={14} className="text-white" />
                            </button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs text-yellow-100/80 custom-scrollbar">
                             {logs.length === 0 && <span className="opacity-50 italic">No entries yet...</span>}
                             {logs.map((log) => (
                                 <div key={log.id} className="border-b border-white/5 pb-2">
                                     <span className="opacity-50 text-[10px] block mb-1">{log.time}</span>
                                     {log.text}
                                 </div>
                             ))}
                             <div ref={notesEndRef} />
                         </div>
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
                             <button onClick={() => setPhoneMode('IN_CALL')} className="w-full py-4 bg-emerald-600 rounded-full flex items-center justify-center gap-2 text-white font-bold hover:bg-emerald-500 transition-colors animate-pulse">
                                 <PhoneIncoming size={20} /> Slide to Answer
                             </button>
                             <button onClick={() => handlePhoneResponse('hangup')} className="w-full py-4 bg-rose-900/50 border border-rose-800 rounded-full flex items-center justify-center gap-2 text-rose-200 font-bold hover:bg-rose-900 transition-colors">
                                 <X size={20} /> Decline (+Suspicion)
                             </button>
                         </div>
                    </div>
                )}

                {phoneMode === 'IN_CALL' && (
                    <div className="flex flex-col h-full relative z-10 bg-slate-900/95 p-4">
                        <div className="text-center mb-8 mt-4">
                            <span className="text-emerald-400 text-xs uppercase tracking-widest">Connected 00:03</span>
                            <h3 className="text-xl text-white font-serif mt-2">"Where are you??"</h3>
                        </div>
                        
                        <div className="space-y-3 mt-auto">
                            <button onClick={() => handlePhoneResponse('truth')} className="w-full p-3 bg-slate-800 border border-slate-700 hover:bg-rose-900/30 hover:border-rose-500 rounded text-left transition-all">
                                <span className="block text-white text-sm font-bold">Tell Truth</span>
                                <span className="text-[10px] text-slate-400">"At the casino." (+40 Sus)</span>
                            </button>
                            <button onClick={() => handlePhoneResponse('lie_work')} className="w-full p-3 bg-slate-800 border border-slate-700 hover:bg-indigo-900/30 hover:border-indigo-500 rounded text-left transition-all">
                                <span className="block text-white text-sm font-bold">Lie: Work</span>
                                <span className="text-[10px] text-slate-400">"Working late." (Risk)</span>
                            </button>
                            <button onClick={() => handlePhoneResponse('lie_traffic')} className="w-full p-3 bg-slate-800 border border-slate-700 hover:bg-indigo-900/30 hover:border-indigo-500 rounded text-left transition-all">
                                <span className="block text-white text-sm font-bold">Lie: Traffic</span>
                                <span className="text-[10px] text-slate-400">"Stuck in jam." (Risk)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Home Bar */}
            <div className="w-full h-1 bg-slate-800 mx-auto mb-1 rounded-full w-1/3 opacity-50 absolute bottom-2 left-1/2 -translate-x-1/2"></div>
        </div>
    );
  };

  const renderContent = () => {
    switch (phase) {
      case GamePhase.INTRO:
        return (
          <div className="flex flex-col items-center justify-center min-h-[100vh] text-center animate-slide-up z-20 w-full relative py-8 px-4">
            <div className="absolute inset-0 bg-black/60 z-[-1]"></div>
            <div className="rain-overlay"></div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter mb-4 text-slate-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none text-flicker">
              UNDERCOVER<br/><span className="text-rose-950 stroke-white bg-clip-text text-transparent bg-gradient-to-t from-red-900 to-black stroke-1">GAMBLER</span>
            </h1>
            <div className="w-16 h-[1px] bg-slate-500 mb-6 mx-auto"></div>

            <div className="max-w-2xl mx-auto mb-8 text-center space-y-4 relative z-10">
                <p className="text-slate-300 font-serif text-lg leading-relaxed italic opacity-90">
                    "You were clean. You were stable. You were almost happy."
                </p>
                <div className="text-slate-400 font-serif text-sm leading-relaxed space-y-2">
                    <p>
                        Then the old itch came back, and <span className="text-rose-500 font-bold">Vinnie</span>—your old drug dealer turned loan shark—was all too happy to scratch it.
                        Now you're <b>${state.debt}</b> deep in a hole dug by trembling hands and cheap whiskey.
                    </p>
                    <p>
                        You walk through your front door like a ghost. A deadbeat in the mirror. A stranger to your wife.
                        You have <span className="text-slate-200 font-bold border-b border-slate-500">7 days</span> to pay the debt, keep Sarah from packing her bags, and prove to your son Leo that his father is more than just a shadow.
                    </p>
                </div>
                <p className="text-rose-600 font-serif text-base font-bold tracking-widest uppercase pt-2 drop-shadow-md">
                    One week to turn it all around. Or the alleyway gets another stain.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8 text-left relative z-10 w-full">
                <div className="p-4 bg-black/40 border-l-2 border-pink-900/50 backdrop-blur-sm hover:bg-black/60 transition-colors">
                    <h3 className="text-pink-400 font-serif text-xl mb-1">Sarah</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Your Wife. She watches you with suspicious eyes. Too many lies, and she's gone forever.</p>
                </div>
                <div className="p-4 bg-black/40 border-l-2 border-indigo-900/50 backdrop-blur-sm hover:bg-black/60 transition-colors">
                    <h3 className="text-indigo-400 font-serif text-xl mb-1">Leo</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Your Son. He just wants his dad back. Don't let him down again.</p>
                </div>
                <div className="p-4 bg-black/40 border-l-2 border-red-900/50 backdrop-blur-sm hover:bg-black/60 transition-colors">
                    <h3 className="text-red-500 font-serif text-xl mb-1">Vinnie</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">The Shark. The debt is real. Pay <b>${DAILY_MIN_PAYMENT}</b> daily or find out what he keeps in his trunk.</p>
                </div>
            </div>

            <Button 
                onClick={startGame} 
                className="w-64 py-4 text-xl font-black !bg-slate-100 !text-black hover:!bg-white hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] shadow-[0_0_30px_rgba(255,255,255,0.3)] border-4 border-slate-300 tracking-[0.25em] animate-pulse transition-all duration-300 z-50"
            >
                WAKE UP
            </Button>
          </div>
        );

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
                        Shark Loan ($500) {state.loansTaken >= MAX_LOANS ? '(MAXED)' : ''}
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
             {/* Subtle overlay for casino vibe */}
             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000000_100%)] z-0 opacity-50"></div>
             
             {/* If Phone is ringing/in-call, we visually dim the blackjack game to focus on phone */}
             <div className={`transition-all duration-500 ${phoneMode !== 'NOTES' ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
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
          const isFinalDay = state.day === MAX_DAYS;
          const required = isFinalDay ? state.debt : DAILY_MIN_PAYMENT;
          const stillNeed = required;
          
          return (
             <div className="max-w-lg w-full mx-auto animate-slide-up text-center">
                 <h2 className="text-4xl font-serif text-rose-700 mb-8 tracking-widest">THE DROP</h2>
                 
                 <div className="bg-black/80 p-8 border border-rose-900/30 shadow-[0_0_50px_rgba(225,29,72,0.1)] mb-8">
                     <p className="text-slate-500 text-sm mb-6 font-mono-theme">Vinnie is waiting in the alley.</p>
                     
                     <div className="space-y-4 font-serif">
                         <div className="border-t border-slate-800 pt-4 flex justify-between text-rose-500 text-xl">
                             <span>DUE TODAY</span>
                             <span>${stillNeed}</span>
                         </div>
                     </div>
                 </div>

                 <div className="flex items-center justify-center gap-6 mb-8">
                     <button onClick={() => setAmountToHandle(Math.max(0, amountToHandle - 100))} className="w-12 h-12 rounded-full border border-slate-700 hover:bg-white/10 text-xl">-</button>
                     <div className="text-5xl font-serif text-white">${amountToHandle}</div>
                     <button onClick={() => setAmountToHandle(Math.min(state.cash, amountToHandle + 100))} className="w-12 h-12 rounded-full border border-slate-700 hover:bg-white/10 text-xl">+</button>
                 </div>
                 
                 <div className="space-y-4">
                    <Button onClick={handlePayment} variant="danger" fullWidth disabled={amountToHandle === 0}>HAND OVER CASH</Button>
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
                {state.cash >= state.debt && state.day === MAX_DAYS ? (
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
            <Button onClick={resetGame} variant="primary">New Life</Button>
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
      {phase !== GamePhase.INTRO && (
        <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-transparent">
             {/* Left Stats */}
             <div className="flex gap-8">
                 <StatBadge icon={Calendar} label="Day" value={state.day} />
                 <StatBadge icon={Clock} label="Time" value={formatTime(state.time)} />
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
      {phase !== GamePhase.INTRO && (
          <div className="absolute bottom-8 right-8 z-50">
             {renderPhone()}
          </div>
      )}
    </div>
  );
}