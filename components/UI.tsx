import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  // More elegant, less "gamey" base style
  const baseStyle = "group relative flex items-center justify-center gap-3 px-8 py-3 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed tracking-[0.2em] uppercase font-bold text-xs";
  
  const variants = {
    primary: "text-white bg-indigo-950/50 border border-indigo-500/30 hover:bg-indigo-900/40 hover:border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)] hover:shadow-[0_0_25px_rgba(79,70,229,0.3)]",
    secondary: "text-slate-300 bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800/60 hover:text-white hover:border-slate-500",
    danger: "text-rose-100 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/40 hover:border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.1)]",
    outline: "text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200 bg-transparent",
    ghost: "text-slate-400 hover:text-slate-300 hover:bg-white/5"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {Icon && <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; label: string; color?: string }> = ({ value, max, label, color = "bg-rose-600" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full group">
      <div className="flex justify-between items-end mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <span className="text-xs uppercase tracking-[0.2em] font-serif text-slate-300 font-bold">{label}</span>
        <span className="text-xs font-mono-theme text-rose-500">{Math.floor(percentage)}%</span>
      </div>
      {/* Intense Bar */}
      <div className="h-3 w-full bg-slate-900 border border-slate-700 relative overflow-hidden rounded-sm shadow-inner">
        <div 
          className={`h-full ${color} transition-all duration-700 ease-out shadow-[0_0_15px_currentColor] relative`} 
          style={{ width: `${percentage}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const CardDisplay: React.FC<{ suit: string; value: string; hidden?: boolean; delay?: number }> = ({ suit, value, hidden, delay = 0 }) => {
  if (hidden) {
    return (
      <div 
        className="w-24 h-36 bg-slate-900/80 rounded border border-slate-700/50 shadow-2xl flex items-center justify-center relative overflow-hidden animate-deal backdrop-blur-sm"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)]"></div>
        <span className="text-3xl text-slate-700 font-serif italic">?</span>
      </div>
    );
  }

  const isRed = suit === '♥' || suit === '♦';
  const colorClass = isRed ? 'text-rose-600' : 'text-slate-900';
  
  return (
    <div 
      className="w-24 h-36 bg-[#e2e2e2] rounded shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden animate-deal group transition-transform hover:-translate-y-2 duration-500 ease-out"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20"></div>
      
      {/* Top Left */}
      <div className="absolute top-2 left-2 flex flex-col items-center leading-none">
        <span className={`text-xl font-bold font-serif ${colorClass}`}>{value}</span>
        <span className={`text-sm ${colorClass}`}>{suit}</span>
      </div>
      
      {/* Center Large */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-5xl ${colorClass} opacity-80`}>{suit}</span>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-2 right-2 flex flex-col items-center leading-none transform rotate-180">
        <span className={`text-xl font-bold font-serif ${colorClass}`}>{value}</span>
        <span className={`text-sm ${colorClass}`}>{suit}</span>
      </div>
    </div>
  );
};

export const StatBadge: React.FC<{ icon: LucideIcon, label: string, value: string | number, highlight?: boolean, danger?: boolean }> = ({ icon: Icon, label, value, highlight, danger }) => (
  <div className={`flex flex-col items-center px-4 py-2 min-w-[80px] transition-colors duration-500`}>
    <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400 mb-1 flex items-center gap-1.5 opacity-80">
       {label}
    </span>
    <div className="flex items-center gap-2">
        <span className={`font-serif text-lg tracking-wide ${danger ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.3)]' : highlight ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.2)]' : 'text-slate-200'}`}>
        {value}
        </span>
    </div>
  </div>
);
