import React, { useState } from 'react';
import Header from './components/Header';
import CurrencyConverter from './components/CurrencyConverter';
import CameraTranslator from './components/CameraTranslator';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Converter);

  return (
    <div className="min-h-screen text-white font-sans flex flex-col items-center p-4">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}
      </style>
      <Header currentMode={mode} setMode={setMode} />
      <main className="w-full flex-grow flex items-start justify-center pt-8">
        {mode === AppMode.Converter && <CurrencyConverter />}
        {mode === AppMode.Translator && <CameraTranslator />}
      </main>
       <footer className="w-full max-w-4xl mx-auto py-4 text-center text-gray-400 text-xs">
          <p>Desarrollado con Google Gemini. Solo para fines de demostración.</p>
        </footer>
    </div>
  );
};

export default App;