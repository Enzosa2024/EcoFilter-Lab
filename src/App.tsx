/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  Trash2, 
  Play, 
  RotateCcw, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  ArrowDown
} from 'lucide-react';
import { MATERIALS, MaterialType, Material, GameStatus } from './types';

export default function App() {
  const [layers, setLayers] = useState<MaterialType[]>([]);
  const [status, setStatus] = useState<GameStatus>('building');
  const [cleanliness, setCleanliness] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [overlayMessage, setOverlayMessage] = useState<{ text: string; success: boolean } | null>(null);

  const addLayer = (type: MaterialType) => {
    if (layers.length < 8 && status === 'building') {
      setLayers([...layers, type]);
    }
  };

  const removeLayer = (index: number) => {
    if (status === 'building') {
      const newLayers = [...layers];
      newLayers.splice(index, 1);
      setLayers(newLayers);
    }
  };

  const resetGame = () => {
    setLayers([]);
    setStatus('building');
    setCleanliness(0);
    setFeedback([]);
  };

  const startFiltering = () => {
    if (layers.length === 0) return;
    setStatus('filtering');
    
    // Calculate result after animation
    setTimeout(() => {
      const result = calculateResult();
      setStatus('result');
      
      // Show success/failure overlay
      if (result >= 70) {
        setOverlayMessage({ text: 'O seu filtro deu certo PARABÉNS', success: true });
      } else {
        setOverlayMessage({ text: 'O seu filtro não funcionou', success: false });
      }

      // Remove overlay after 5 seconds
      setTimeout(() => {
        setOverlayMessage(null);
      }, 5000);
    }, 4000);
  };

  const calculateResult = () => {
    const perfectOrder: MaterialType[] = [
      'cotton',       // 8 (Bottom)
      'sand',         // 7
      'charcoal',     // 6
      'sand',         // 5
      'charcoal',     // 4
      'coarse_sand',  // 3
      'small_stones', // 2
      'large_stones'  // 1 (Top)
    ];

    // Check for perfect match
    const isPerfect = layers.length === 8 && layers.every((val, index) => val === perfectOrder[index]);

    if (isPerfect) {
      setCleanliness(100);
      setFeedback([
        "Configuração mestre detectada!",
        "A água atingiu a pureza absoluta.",
        "O equilíbrio entre filtragem física e química está perfeito."
      ]);
      return 100;
    }

    // Fallback scoring logic (heuristic)
    let score = 0;
    const reasons: string[] = [];

    const counts = layers.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Basic presence and weight
    if (counts.large_stones) score += 10;
    if (counts.small_stones) score += 10;
    if (counts.coarse_sand) score += 10;
    if (counts.sand) score += 15;
    if (counts.charcoal) score += 15;
    if (counts.cotton) score += 10;

    // Bonus for multiple layers (as in the secret sequence)
    if (counts.sand >= 2) score += 10;
    if (counts.charcoal >= 2) score += 10;

    // Position hints (vague)
    if (layers[0] === 'cotton') {
      score += 10;
      reasons.push("A base parece adequada para o polimento final.");
    } else if (layers.includes('cotton')) {
      reasons.push("Dica: O material mais fino deve estar onde a água sai.");
    }

    if (layers[layers.length - 1] === 'large_stones') {
      score += 10;
      reasons.push("A entrada está protegida contra detritos maiores.");
    } else if (layers.includes('large_stones')) {
      reasons.push("Dica: Materiais brutos devem enfrentar a sujeira primeiro.");
    }

    if (layers.length === 8) {
      score += 5;
      reasons.push("A densidade do filtro está no nível máximo.");
    }

    // General status
    if (score < 40) {
      reasons.push("A água ainda está muito turva e impura.");
    } else if (score < 70) {
      reasons.push("A filtragem está ocorrendo, mas o fluxo não é ideal.");
    } else if (score < 95) {
      reasons.push("Excelente! A água parece limpa, mas falta um detalhe para a pureza total.");
    } else {
      reasons.push("Quase perfeito! Existe uma ordem específica que garante 100% de pureza.");
    }

    const finalScore = Math.min(99, score);
    setCleanliness(finalScore);
    setFeedback(reasons);
    return finalScore;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      {/* Success/Failure Overlay */}
      <AnimatePresence>
        {overlayMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className={`
              px-8 py-6 rounded-3xl shadow-2xl border-4 flex flex-col items-center gap-4 text-center max-w-sm
              ${overlayMessage.success ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}
            `}>
              {overlayMessage.success ? (
                <CheckCircle2 size={64} className="text-green-500" />
              ) : (
                <AlertCircle size={64} className="text-red-500" />
              )}
              <h2 className="text-2xl font-black uppercase italic">{overlayMessage.text}</h2>
              <div className="text-4xl font-mono font-bold">{cleanliness}%</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Droplets className="text-blue-600 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight uppercase italic font-serif">
            EcoFilter Lab
          </h1>
        </div>
        <p className="text-sm text-gray-600 font-mono uppercase tracking-widest">
          Simulador de Purificação de Água v1.0
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Materials Selection */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Info size={14} /> Materiais Disponíveis
            </h2>
            <div className="flex flex-col gap-3">
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => addLayer(m.id)}
                  disabled={status !== 'building' || layers.length >= 8}
                  className="group relative flex flex-col p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300" 
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="font-bold text-sm">{m.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{m.description}</p>
                </button>
              ))}
            </div>
          </div>

          {status === 'result' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Relatório de Qualidade</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * cleanliness) / 100}
                      className={cleanliness > 70 ? "text-green-500" : cleanliness > 40 ? "text-yellow-500" : "text-red-500"}
                    />
                  </svg>
                  <span className="absolute text-sm font-bold font-mono">{cleanliness}%</span>
                </div>
                <div>
                  <p className="text-xs font-bold">Pureza Alcançada</p>
                  <p className="text-[10px] text-gray-500">Baseado na eficiência das camadas.</p>
                </div>
              </div>
              <ul className="space-y-2">
                {feedback.map((f, i) => (
                  <li key={i} className="flex gap-2 text-[10px] leading-tight">
                    {f.includes("Dica") ? (
                      <AlertCircle size={12} className="text-yellow-500 shrink-0" />
                    ) : (
                      <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    )}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Center Column: The Filter Container */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] aspect-[3/6] bg-cyan-50/20 rounded-b-[120px] rounded-t-3xl border-x-2 border-b-4 border-white/60 overflow-hidden shadow-[inset_0_0_40px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-[1px]">
            
            {/* PET Bottle Gloss Effect */}
            <div className="absolute top-0 left-[5%] w-[15%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 right-[15%] w-[5%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
            
            {/* PET Bottle Ribs (Textura) */}
            <div className="absolute inset-0 flex flex-col justify-between py-12 pointer-events-none opacity-10 z-10">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-[2px] w-full bg-black/40" />
              ))}
            </div>

            {/* Dirty Water Source (Animation) */}
            {status === 'filtering' && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute top-0 left-0 w-full bg-[#5D4037]/40 z-10 pointer-events-none"
              />
            )}

            {/* Filter Layers */}
            <div className="absolute bottom-0 left-0 w-full flex flex-col-reverse">
              <AnimatePresence>
                {layers.map((type, index) => {
                  const material = MATERIALS.find(m => m.id === type)!;
                  return (
                    <motion.div
                      key={`${type}-${index}`}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                      className="relative h-14 w-full border-t border-black/10 flex items-center justify-center group"
                      style={{ backgroundColor: material.color }}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${type === 'charcoal' ? 'text-white' : 'text-black/60'}`}>
                        {material.name}
                      </span>
                      {status === 'building' && (
                        <button 
                          onClick={() => removeLayer(index)}
                          className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded-md"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {layers.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
                <ArrowDown className="mb-4 animate-bounce" />
                <p className="text-sm font-mono uppercase">Adicione camadas para começar a construção</p>
              </div>
            )}
          </div>

          {/* Output Container */}
          <div className="mt-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-b-3xl border-x-2 border-b-2 border-gray-300 relative overflow-hidden bg-white/30">
              {status === 'result' && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${cleanliness}%` }}
                  transition={{ duration: 2 }}
                  className="absolute bottom-0 left-0 w-full bg-blue-400/60"
                  style={{ 
                    opacity: cleanliness / 100,
                    backgroundColor: `rgba(96, 165, 250, ${0.3 + (cleanliness / 100) * 0.7})`
                  }}
                />
              )}
            </div>
            <p className="text-[10px] font-mono mt-2 uppercase text-gray-400 tracking-widest">Reservatório de Saída</p>
          </div>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Controles do Sistema</h2>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={startFiltering}
                disabled={status !== 'building' || layers.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Play size={18} /> INICIAR FILTRAGEM
              </button>
              
              <button
                onClick={resetGame}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={18} /> REINICIAR PROJETO
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3">Status do Processo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Construção</span>
                  <div className={`w-2 h-2 rounded-full ${status === 'building' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Filtragem</span>
                  <div className={`w-2 h-2 rounded-full ${status === 'filtering' ? 'bg-blue-500 animate-pulse' : status === 'result' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Análise</span>
                  <div className={`w-2 h-2 rounded-full ${status === 'result' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#151619] p-6 rounded-2xl shadow-lg text-white font-mono">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">Manual de Operação</h2>
            <p className="text-[10px] leading-relaxed text-gray-400">
              O objetivo é criar um filtro eficiente. A ordem das camadas importa: use materiais mais grossos no topo para remover detritos visíveis e materiais mais finos na base para o polimento final. O carvão ativado triturado ajuda na remoção de impurezas químicas e odores.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-4 text-center text-[10px] text-gray-400 font-mono uppercase tracking-widest">
        &copy; 2026 EcoFilter Lab - Simulação Educacional
      </footer>
    </div>
  );
}
