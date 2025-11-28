import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Search, ChevronRight, AlertCircle, Share2, RefreshCw, Scan, Activity } from 'lucide-react';
import TechLayout from './components/TechLayout';
import ScanningEffect from './components/ScanningEffect';
import { HealthRadar, MetricBars } from './components/DashboardCharts';
import { HairAnalysisData, AppState } from './types';
import { analyzeHairImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<HairAnalysisData | null>(null);
  const [loadingText, setLoadingText] = useState("INICIALIZANDO");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAppState(AppState.SCANNING);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanComplete = async () => {
    if (!imagePreview) return;
    
    setAppState(AppState.ANALYZING);
    setLoadingText("PROCESSANDO DADOS DE IA...");

    try {
      const data = await analyzeHairImage(imagePreview);
      setAnalysisData(data);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  // Simulate scanning duration
  useEffect(() => {
    if (appState === AppState.SCANNING) {
      setLoadingText("CALIBRANDO SENSORES ÓPTICOS...");
      const timer = setTimeout(() => {
        handleScanComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setImagePreview(null);
    setAnalysisData(null);
  };

  return (
    <TechLayout status={appState}>
      {/* HERO / IDLE STATE */}
      {appState === AppState.IDLE && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fadeIn">
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full"></div>
            <div className="w-32 h-32 rounded-full border-2 border-amber-500/50 flex items-center justify-center relative bg-[#020617] shadow-[0_0_30px_rgba(251,191,36,0.2)]">
               <Search className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          
          <div className="space-y-2 max-w-lg">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              TRICOSCOPIA DIGITAL
            </h2>
            <p className="text-blue-300/80 font-light text-lg">
              Sistema de análise capilar avançado. Carregue uma imagem de tricoscopia ou macro para diagnóstico instantâneo via IA.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold py-4 px-6 rounded-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.3)] clip-path-tech"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              <Upload size={20} />
              Carregar Imagem
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </div>
          
          <p className="text-xs text-slate-600 font-mono mt-8 border-t border-slate-800 pt-4">
            * UTILIZE LENTES MACRO OU DERMATOSCÓPIO PARA MELHORES RESULTADOS
          </p>
        </div>
      )}

      {/* SCANNING & ANALYZING STATE */}
      {(appState === AppState.SCANNING || appState === AppState.ANALYZING) && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
          <div className="relative w-80 h-80 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
            {imagePreview && (
              <img src={imagePreview} alt="Analysis Target" className="w-full h-full object-cover opacity-60" />
            )}
            <ScanningEffect />
          </div>
          
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-xs font-mono text-amber-400">
              <span>{loadingText}</span>
              <span>{appState === AppState.ANALYZING ? '85%' : '30%'}</span>
            </div>
            <div className="h-1 bg-slate-800 w-full rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 animate-progress w-full origin-left"></div>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {['DENSIDADE', 'CÓRTEX', 'BULBO'].map((item, i) => (
                <div key={i} className="bg-slate-800/50 p-1 text-[10px] text-center text-slate-500 border border-slate-700/50">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {appState === AppState.RESULTS && analysisData && (
        <div className="animate-slideUp space-y-6">
          <div className="flex justify-between items-end border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-display text-white">RELATÓRIO DE ANÁLISE</h2>
              <p className="text-amber-500 font-mono text-sm">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <button onClick={resetApp} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
              <RefreshCw size={16} /> NOVA ANÁLISE
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Image & Radar */}
            <div className="space-y-6">
              <div className="glass-panel p-1 rounded-sm relative overflow-hidden group">
                 <div className="absolute top-0 left-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 font-mono z-10">
                   AMOSTRA ORIGINAL
                 </div>
                 <img src={imagePreview!} alt="Original" className="w-full h-64 object-cover filter grayscale hover:grayscale-0 transition-all duration-500" />
                 <div className="absolute bottom-0 right-0 p-2">
                    <Scan className="text-amber-500 w-6 h-6" />
                 </div>
              </div>

              <div className="glass-panel p-6 rounded-sm border-t-2 border-t-amber-500">
                <h3 className="text-sm font-mono text-slate-400 mb-4 uppercase tracking-widest">Métricas Biométricas</h3>
                <HealthRadar data={analysisData} />
                <MetricBars data={analysisData} />
              </div>
            </div>

            {/* Middle Column: Diagnosis & Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "SAÚDE GERAL", value: analysisData.overallHealthScore, color: "text-white" },
                  { label: "DENSIDADE", value: analysisData.densityScore, color: "text-blue-400" },
                  { label: "ESPESSURA", value: analysisData.thicknessScore, color: "text-blue-400" },
                  { label: "HIDRATAÇÃO", value: analysisData.hydrationScore, color: "text-blue-400" }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent"></div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{stat.label}</span>
                    <span className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Technical Summary */}
              <div className="glass-panel p-6 relative">
                 <div className="absolute -left-[1px] top-4 bottom-4 w-[2px] bg-amber-500"></div>
                 <h3 className="text-lg font-display text-white mb-2 flex items-center gap-2">
                   <Activity size={20} className="text-amber-500" />
                   DIAGNÓSTICO TÉCNICO
                 </h3>
                 <p className="text-slate-300 leading-relaxed font-light border-b border-slate-800 pb-4 mb-4">
                   {analysisData.technicalSummary}
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {analysisData.detectedIssues.map((issue, i) => (
                      <span key={i} className="px-3 py-1 bg-red-900/20 border border-red-500/30 text-red-200 text-xs rounded-full flex items-center gap-2">
                        <AlertCircle size={12} /> {issue}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-emerald-900/20 border border-emerald-500/30 text-emerald-200 text-xs rounded-full">
                       Condição: {analysisData.condition}
                    </span>
                 </div>
              </div>

              {/* Recommendations */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-mono text-slate-400 mb-4 uppercase tracking-widest flex justify-between">
                  <span>Protocolo Sugerido</span>
                  <span>RC-BIOSCAN AI v2.4</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded hover:bg-slate-800/50 transition-colors border-l border-slate-700 hover:border-amber-500">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-mono shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-200">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 font-mono text-sm uppercase tracking-wider transition-colors">
                  Exportar PDF <Share2 size={16} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </TechLayout>
  );
};

export default App;