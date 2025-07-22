import React, { useState, useCallback } from 'react';
import { YenIcon, EuroIcon, LoaderIcon } from './icons';
import { getManualConversion } from '../services/geminiService';

const CurrencyConverter: React.FC = () => {
  const [jpy, setJpy] = useState<string>('1000');
  const [eur, setEur] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleConversion = useCallback(async () => {
    setError('');
    const amount = parseFloat(jpy);
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, introduce un número positivo válido.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await getManualConversion(amount);
      if (result > 0) {
        setEur(result.toFixed(2));
      } else {
        setError('No se pudo obtener una conversión válida.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error durante la conversión.');
    } finally {
      setIsLoading(false);
    }
  }, [jpy]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-fuchsia-900/20 p-8 space-y-6 animate-fade-in">
      <h2 className="text-center text-2xl font-bold text-white">Conversor Manual</h2>
      <p className="text-center text-gray-300">Introduce una cantidad en JPY para convertir a EUR.</p>
      
      <div className="space-y-4">
        {/* JPY Input */}
        <div>
          <label htmlFor="jpy-input" className="block text-sm font-medium text-gray-300 mb-1">
            Yen Japonés (JPY)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <YenIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="jpy-input"
              className="w-full bg-slate-900/80 border border-slate-700 text-white text-lg rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 block pl-10 p-3 transition"
              placeholder="p. ej., 1000"
              value={jpy}
              onChange={(e) => setJpy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConversion()}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* EUR Output */}
        <div>
          <label htmlFor="eur-output" className="block text-sm font-medium text-gray-300 mb-1">
            Euros (EUR)
          </label>
          <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <EuroIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="eur-output"
              readOnly
              className="w-full bg-slate-700/80 border border-slate-600 text-lime-400 font-bold text-lg rounded-lg block pl-10 p-3 cursor-not-allowed"
              value={eur ? `€ ${eur}`: ''}
              placeholder="Importe convertido..."
            />
          </div>
        </div>
      </div>
      
      {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleConversion}
        disabled={isLoading || !jpy}
        className="w-full flex justify-center items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-900/50 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-fuchsia-600/30 hover:shadow-xl hover:shadow-fuchsia-600/40"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="w-5 h-5 animate-spin" />
            Convirtiendo...
          </>
        ) : (
          'Convertir'
        )}
      </button>
    </div>
  );
};

export default CurrencyConverter;