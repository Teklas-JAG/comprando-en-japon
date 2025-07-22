import React from 'react';
import { AppMode } from '../types';
import { CameraIcon, YenIcon, ShoppingBagIcon } from './icons';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  const NavButton: React.FC<{ mode: AppMode; label: string; children: React.ReactNode }> = ({ mode, label, children }) => {
    const isActive = currentMode === mode;
    return (
      <button
        onClick={() => setMode(mode)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-fuchsia-600 text-white shadow-lg'
            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {children}
        {label}
      </button>
    );
  };

  return (
    <header className="w-full max-w-4xl mx-auto p-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div className="flex items-center gap-3">
        <div className="bg-fuchsia-600 p-2 rounded-lg shadow-md">
          <ShoppingBagIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Comprando en <span className="text-fuchsia-400">Japón</span>
        </h1>
      </div>
      <nav className="flex items-center bg-slate-800/80 p-1 rounded-lg shadow-inner">
        <NavButton mode={AppMode.Converter} label="Conversor">
          <YenIcon className="w-5 h-5" />
        </NavButton>
        <NavButton mode={AppMode.Translator} label="Cámara">
          <CameraIcon className="w-5 h-5" />
        </NavButton>
      </nav>
    </header>
  );
};

export default Header;