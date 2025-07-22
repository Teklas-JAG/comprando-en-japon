import React, { useState, useRef, useCallback, useEffect } from 'react';
import { translateAndConvertFromImage } from '../services/geminiService';
import { CameraIcon, LoaderIcon } from './icons';
import type { TranslationResult } from '../types';
import { CameraStatus } from '../types';

const CameraTranslator: React.FC = () => {
  const [status, setStatus] = useState<CameraStatus>(CameraStatus.Idle);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<TranslationResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupCamera();
  }, [cleanupCamera]);

  useEffect(() => {
    if (status !== CameraStatus.Requesting) {
      return;
    }

    const initializeCamera = async () => {
      if (!videoRef.current) {
        setError("No se pudo iniciar la vista de la cámara. Inténtalo de nuevo.");
        setStatus(CameraStatus.Error);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
              facingMode: 'environment'
          },
        });
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;
        
        video.onplaying = () => {
            setStatus(CameraStatus.Active);
        };

        await video.play();
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = 'No se pudo acceder a la cámara. Revisa los permisos e inténtalo de nuevo.';
        
        if (err instanceof DOMException) {
          switch (err.name) {
            case 'NotAllowedError':
              message = 'Permiso de cámara denegado. Permite el acceso en la configuración de tu navegador.';
              break;
            case 'NotFoundError':
              message = 'No se encontró una cámara compatible en tu dispositivo.';
              break;
            case 'NotReadableError':
              message = 'Tu cámara podría estar en uso por otra aplicación.';
              break;
            case 'OverconstrainedError':
              message = 'La cámara trasera no está disponible en tu dispositivo.';
              break;
            default:
              message = `Ocurrió un error inesperado con la cámara: ${err.name}`;
          }
        }
        
        setError(message);
        setStatus(CameraStatus.Error);
        cleanupCamera();
      }
    };

    initializeCamera();
  }, [status, cleanupCamera]);

  const requestCameraStart = () => {
    if (status !== CameraStatus.Idle && status !== CameraStatus.Error) return;
    
    setStatus(CameraStatus.Requesting);
    setError('');
    setResult(null);
  };

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setStatus(CameraStatus.Scanning);
    setError('');
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        setError('No se pudo obtener el contexto del canvas.');
        setStatus(CameraStatus.Error);
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64ImageData = canvas.toDataURL('image/jpeg').split(',')[1];
    
    cleanupCamera();

    try {
      const apiResult = await translateAndConvertFromImage(base64ImageData);
      setResult(apiResult);
      setStatus(CameraStatus.Success);
    } catch (err) {
      console.error("Translation API error:", err);
      setError('Error al obtener la traducción. Por favor, inténtalo de nuevo.');
      setStatus(CameraStatus.Error);
    }
  }, [cleanupCamera]);
  
  const reset = () => {
      setStatus(CameraStatus.Idle);
      setResult(null);
      setError('');
      cleanupCamera();
  };

  const renderContent = () => {
    switch (status) {
      case CameraStatus.Idle:
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Traducir con la Cámara</h2>
            <p className="text-gray-300 mb-6">Apunta tu cámara a un texto en japonés con precios.</p>
            <button
              onClick={requestCameraStart}
              className="w-full flex justify-center items-center gap-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-fuchsia-600/30 hover:shadow-xl hover:shadow-fuchsia-600/40"
            >
              <CameraIcon className="w-6 h-6" />
              Iniciar Cámara
            </button>
          </div>
        );

      case CameraStatus.Requesting:
        return (
             <div className="flex flex-col items-center justify-center h-64 text-white">
                <video ref={videoRef} autoPlay playsInline className="hidden"></video>
                <LoaderIcon className="w-12 h-12 animate-spin text-fuchsia-400" />
                <p className="mt-4 text-lg">Iniciando cámara...</p>
            </div>
        );

      case CameraStatus.Active:
        return (
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                <div className="absolute inset-0 bg-black/20 flex items-end justify-center p-4">
                     <button
                        onClick={handleScan}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform"
                        >
                        <CameraIcon className="w-6 h-6" />
                        Escanear Imagen
                    </button>
                </div>
            </div>
        );
      
      case CameraStatus.Scanning:
         return (
             <div className="flex flex-col items-center justify-center h-64 text-white bg-slate-900/50 rounded-2xl">
                <LoaderIcon className="w-16 h-16 animate-spin text-fuchsia-400" />
                <p className="mt-4 text-xl font-semibold">Analizando Imagen...</p>
                <p className="text-gray-300">Traduciendo y convirtiendo precios.</p>
            </div>
        );

      case CameraStatus.Success:
        return (
          <div className="w-full text-left p-1 animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Resultados</h3>
            <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <div>
                <h4 className="font-semibold text-fuchsia-400 mb-1">Traducción (Español)</h4>
                <p className="text-gray-200 text-sm">{result?.fullTranslationSpanish || "No se detectó texto."}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lime-400 mb-2">Conversión de Precios</h4>
                {result?.currencyConversions && result.currencyConversions.length > 0 ? (
                  <ul className="space-y-2">
                    {result.currencyConversions.map((conv, index) => (
                      <li key={index} className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                        <span className="text-gray-300">{conv.originalJPY}</span>
                        <span className="font-mono font-bold text-lime-300">€ {conv.amountEUR.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No se detectaron precios.</p>
                )}
              </div>
            </div>
            <button onClick={reset} className="mt-6 w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-semibold transition">Escanear de Nuevo</button>
          </div>
        );

      case CameraStatus.Error:
        return (
            <div className="text-center p-4 bg-rose-900/50 border border-rose-700 rounded-2xl">
                <p className="text-rose-300 font-semibold mb-4">{error}</p>
                <button onClick={reset} className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition">Intentar de Nuevo</button>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-fuchsia-900/20 p-6">
      <canvas ref={canvasRef} className="hidden"></canvas>
      {renderContent()}
    </div>
  );
};

export default CameraTranslator;