import React, { useState, useEffect, useRef } from 'react';
import LanguageSelector from './components/LanguageSelector';
import VoiceInput from './components/VoiceInput';
import GeneratedWebsite from './components/GeneratedWebsite';
import HistoryModal from './components/HistoryModal';
import { generateWebsite, editWebsite, getAddressFromCoords } from './services/geminiService';
import { LANGUAGES, TRANSLATIONS } from './constants';
import { BusinessData, LanguageCode, HistoryItem, Translation } from './types';
import { 
  Loader2, Send, History, MapPin, Sparkles, Store, Zap, Globe, 
  ChevronRight, CheckCircle2, Layout, Type, Palette, Radar, 
  Asterisk, ChevronLeft, Target, SignalHigh, Timer, Navigation, 
  XCircle, Crosshair, Map, Activity, Satellite, Brain, PenTool, 
  Layers, CheckCircle, Wand2, Coffee, Rocket, Heart, Star, Sparkle,
  LocateFixed, Languages
} from 'lucide-react';

const BG_IMAGES = {
  welcome: "https://images.unsplash.com/photo-1620935544521-81d3f9f94481?auto=format&fit=crop&q=80&w=1600",
  kirana: "https://images.unsplash.com/photo-1590664089779-bf7ff0529634?auto=format&fit=crop&q=80&w=1600",
  tailor: "https://images.unsplash.com/photo-1594913785162-e6785b4cd3d2?auto=format&fit=crop&q=80&w=1600",
  food: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=1600",
};

/**
 * ENHANCED STORYTELLING LOADER
 */
const MithraLoader = ({ translations, businessData }: { translations: Translation, businessData: BusinessData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [microMessageIdx, setMicroMessageIdx] = useState(0);
  const shopName = businessData.name || "Apna Business";
  const category = businessData.description.split(' ')[0] || "Special";

  const steps = [
    { 
      title: translations.step_analyzing,
      icon: <Brain className="w-12 h-12" />,
      color: "from-blue-400 to-indigo-600",
      microMessages: [
        `Studying the story of ${shopName}...`,
        `Analyzing ${category} industry trends...`,
        "Finding the perfect keywords for you..."
      ]
    },
    { 
      title: translations.step_designing,
      icon: <PenTool className="w-12 h-12" />,
      color: "from-emerald-400 to-teal-600",
      microMessages: [
        "Sketching a mobile-friendly layout...",
        "Placing your products in the spotlight...",
        "Crafting a beautiful header design..."
      ]
    },
    { 
      title: translations.step_coloring,
      icon: <Palette className="w-12 h-12" />,
      color: "from-orange-400 to-rose-600",
      microMessages: [
        "Mixing a premium color palette...",
        "Selecting trust-building typography...",
        "Polishing buttons and icons..."
      ]
    },
    { 
      title: translations.step_finalizing,
      icon: <Wand2 className="w-12 h-12" />,
      color: "from-amber-400 to-yellow-600",
      microMessages: [
        "Adding the Mithra magic touch...",
        "Optimizing images for fast loading...",
        "Your business is ready to shine!"
      ]
    }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      setMicroMessageIdx(0);
    }, 4500);

    const microInterval = setInterval(() => {
      setMicroMessageIdx((prev) => (prev < 2 ? prev + 1 : 0));
    }, 1500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(microInterval);
    };
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-10 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
            <div 
              className={`h-full bg-gradient-to-r ${steps[activeStep].color} transition-all duration-700 ease-out`}
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mb-10 flex justify-center">
            <div className={`relative p-8 rounded-[3rem] bg-gradient-to-br ${steps[activeStep].color} text-white shadow-2xl transition-all duration-500 transform hover:scale-110`}>
              <div className="absolute inset-0 bg-white/20 rounded-[3rem] animate-ping opacity-20" />
              {steps[activeStep].icon}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {steps[activeStep].title}
            </h2>
            <div className="h-12 flex items-center justify-center">
              <p className="text-emerald-400 font-bold text-lg animate-in fade-in slide-in-from-bottom-2 duration-300" key={microMessageIdx}>
                {steps[activeStep].microMessages[microMessageIdx]}
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-3">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${idx <= activeStep ? `bg-gradient-to-r ${steps[idx].color} opacity-100` : 'bg-white/10 opacity-30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [businessData, setBusinessData] = useState<BusinessData>({ description: '', phone: '', name: '', email: '', address: '' });
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [editCommand, setEditCommand] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionAccuracy, setDetectionAccuracy] = useState<number | null>(null);
  const [detectionStage, setDetectionStage] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const t = TRANSLATIONS[lang];
  const [currentBg, setCurrentBg] = useState(BG_IMAGES.welcome);

  useEffect(() => {
    const savedLang = localStorage.getItem('vyapara_lang');
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) setLang(savedLang as LanguageCode);
  }, []);

  useEffect(() => {
    if (step === 0) setCurrentBg(BG_IMAGES.welcome);
    else if (step === 1) setCurrentBg(BG_IMAGES.kirana);
    else setCurrentBg(BG_IMAGES.welcome);
  }, [step]);

  const handleLanguageChange = (code: LanguageCode) => {
    setLang(code);
    localStorage.setItem('vyapara_lang', code);
  };

  const handleGenerate = async () => {
    if (!businessData.name?.trim()) { alert("Shop Name is mandatory!"); return; }
    if (!businessData.address?.trim() && !businessData.lat) { alert("Address or Pinned Location is mandatory!"); return; }
    setIsGenerating(true);
    setStep(2);
    const currentLangName = LANGUAGES.find(l => l.code === lang)?.name || 'English';
    try {
      const html = await generateWebsite(businessData, currentLangName);
      setGeneratedHtml(html);
      const initialHistory: HistoryItem = { id: Date.now().toString(), html: html, instruction: t.initial_website, timestamp: Date.now() };
      setHistory([initialHistory]);
      setStep(3);
    } catch (err) { console.error(err); setStep(1); } finally { setIsGenerating(false); }
  };

  const handleEdit = async (customCommand?: string) => {
    const finalCommand = customCommand || editCommand;
    if (!finalCommand.trim()) return;
    setIsEditing(true);
    const newHtml = await editWebsite(generatedHtml, finalCommand);
    setGeneratedHtml(newHtml);
    const newHistoryItem: HistoryItem = { id: Date.now().toString(), html: newHtml, instruction: finalCommand, timestamp: Date.now() };
    setHistory(prev => [...prev, newHistoryItem]);
    setEditCommand('');
    setIsEditing(false);
  };

  const handleManualEdit = (newHtml: string) => {
    if (newHtml === generatedHtml) return;
    setGeneratedHtml(newHtml);
    const newHistoryItem: HistoryItem = { id: Date.now().toString(), html: newHtml, instruction: t.manual_edit, timestamp: Date.now() };
    setHistory(prev => [...prev, newHistoryItem]);
  };

  /**
   * REFINED EXACT GPS DETECTION LOGIC
   * Prioritizes high precision and waits for signal stabilization.
   */
  const handleDetectLocation = (callback?: (address: string, lat?: number, lng?: number) => void) => {
    if (!navigator.geolocation) { alert(t.geo_not_supported); return; }
    
    setIsDetecting(true);
    setDetectionAccuracy(null);
    setDetectionStage('Connecting to Satellites...');

    let bestFix: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let startTimestamp = Date.now();

    const cleanup = () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };

    const finalize = async (pos: GeolocationPosition) => {
      cleanup();
      clearTimeout(maxTimeoutId);
      
      const { latitude, longitude, accuracy } = pos.coords;
      setDetectionAccuracy(Math.round(accuracy));
      setDetectionStage('Pinpoint Exact!');

      try {
        const addr = await getAddressFromCoords(latitude, longitude, LANGUAGES.find(l => l.code === lang)?.name || 'English');
        if (callback) callback(addr, latitude, longitude);
        else setBusinessData(prev => ({ ...prev, address: addr, lat: latitude, lng: longitude }));
      } catch (err) {
        const fallback = `Exact Shop Spot (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
        if (callback) callback(fallback, latitude, longitude);
        else setBusinessData(prev => ({ ...prev, address: fallback, lat: latitude, lng: longitude }));
      } finally {
        setIsDetecting(false);
      }
    };

    // Extended search time (40s) to guarantee the device has time for a cold start GPS fix.
    const maxTimeoutId = setTimeout(() => {
      if (bestFix) finalize(bestFix);
      else {
        cleanup();
        alert(t.location_error);
        setIsDetecting(false);
      }
    }, 40000); 

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const currentAccuracy = pos.coords.accuracy;
        setDetectionAccuracy(Math.round(currentAccuracy));
        
        // Accurate user feedback based on industry-standard GPS metrics
        if (currentAccuracy < 7) setDetectionStage('Pinpoint satellite lock achieved!');
        else if (currentAccuracy < 15) setDetectionStage('High precision fix found. Stabilizing...');
        else if (currentAccuracy < 40) setDetectionStage('Honing in on your exact storefront...');
        else if (currentAccuracy < 100) setDetectionStage('Signal strengthening. Stay still...');
        else setDetectionStage('Waiting for better satellite signal...');

        // Update the best fix found so far
        if (!bestFix || currentAccuracy < bestFix.coords.accuracy) {
          bestFix = pos;
        }

        // Only finalize immediately if accuracy is exceptional (under 7 meters) 
        // AND we've had a few seconds to let the GPS settle.
        if (currentAccuracy < 7 && (Date.now() - startTimestamp > 4000)) {
          finalize(pos);
        }
      },
      (err) => {
        // If high accuracy fails immediately (e.g. user denied or hardware off), 
        // try one low-accuracy quick fix before failing.
        navigator.geolocation.getCurrentPosition(
          (pos) => finalize(pos),
          () => {
            cleanup();
            clearTimeout(maxTimeoutId);
            alert(t.location_error);
            setIsDetecting(false);
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0, 
        timeout: 25000 
      }
    );
  };

  const isFormComplete = !!(businessData.name?.trim() && (businessData.address?.trim() || businessData.lat));

  return (
    <div className="relative min-h-screen max-w-lg mx-auto bg-slate-50 flex flex-col overflow-x-hidden">
      <div className="app-bg-image" style={{ backgroundImage: `url(${currentBg})`, filter: step >= 2 ? 'blur(12px)' : (step === 1 ? 'blur(8px)' : 'blur(4px)') }}></div>
      <div className="bg-overlay"></div>

      <div className="relative z-10 flex flex-col h-full flex-1">
        {step === 0 ? (
          <div className="flex-1 flex flex-col slide-up overflow-hidden h-full">
            {/* REFINED HEADER: Matches the premium look of the login screen */}
            <div className="flex justify-between items-center p-6 bg-slate-900/30 backdrop-blur-xl shrink-0 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-lg">
                  <Store className="w-6 h-6" />
                </div>
                <span className="font-black text-xl text-white tracking-tight drop-shadow-md">
                  Vyapara Mithra
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowLanguageModal(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white border border-white/10 transition-all active:scale-95"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold">
                    {LANGUAGES.find(l => l.code === lang)?.name || 'Language'}
                  </span>
                </button>
                
                {businessData.name && (
                  <button 
                    onClick={() => setStep(1)} 
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white shadow-lg transition-all active:scale-95"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center gap-8 text-center p-6 overflow-y-auto no-scrollbar">
              <div className="space-y-4 shrink-0">
                <h1 className="text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                  {t.welcome.split('!')[0]}<span className="text-emerald-400">!</span>
                </h1>
                <p className="text-2xl text-white font-bold px-4 opacity-90 drop-shadow-md">
                  {t.tell_me_about}
                </p>
              </div>

              <div className="glass-card p-10 rounded-[3.8rem] shadow-2xl relative overflow-hidden border-b-[10px] border-emerald-500/20 flex flex-col gap-6">
                {/* Animated accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>
                
                <div className="border-4 border-slate-200/60 rounded-[2.5rem] bg-white shadow-inner overflow-hidden focus-within:border-emerald-500 transition-all min-h-[220px]">
                  <VoiceInput 
                    value={businessData.description} 
                    onChange={(text) => setBusinessData({ ...businessData, description: text })} 
                    onTranscript={(text) => setBusinessData(prev => ({ ...prev, description: prev.description + " " + text }))} 
                    language={lang} 
                    translations={t} 
                    multiline={true} 
                    placeholder={t.placeholder_desc} 
                  />
                </div>

                <div className="pt-4">
                  <button 
                    disabled={!businessData.description.trim()} 
                    onClick={() => setStep(1)} 
                    className="w-full h-24 btn-accent pulse-button disabled:opacity-50 text-white text-2xl font-black rounded-[2.2rem] flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl"
                  >
                    {t.btn_continue} <ChevronRight className="w-9 h-9" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="flex-1 flex flex-col slide-up bg-slate-50/5 h-full overflow-hidden">
            <div className="glass-card sticky top-0 p-6 z-50 border-b border-white/20 flex justify-between items-center shrink-0">
              <button onClick={() => setStep(0)} className="p-4 bg-slate-100 rounded-[1.8rem] text-slate-500 hover:text-emerald-600 transition-colors shadow-sm active:scale-95"><ChevronLeft className="w-7 h-7" /></button>
              <div className="text-center"><span className="font-black text-slate-800 text-2xl leading-none">{t.contact_details}</span><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Step 2 of 2</p></div>
              <div className="flex gap-2">{generatedHtml && (<button onClick={() => setStep(3)} className="p-4 bg-emerald-500 text-white rounded-[1.8rem] shadow-lg shadow-emerald-100 active:scale-95 transition-all"><ChevronRight className="w-7 h-7" /></button>)}<div className={generatedHtml ? "hidden" : "w-16"}></div></div>
            </div>
            <div className="flex-1 p-8 space-y-10 pb-48 overflow-y-auto no-scrollbar">
              <div className="glass-card p-10 rounded-[3.5rem] shadow-2xl border-l-[12px] border-emerald-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 ml-4"><label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{t.lbl_name}</label><Asterisk className="w-3 h-3 text-rose-500" /><span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">({t.compulsory})</span></div>
                  <div className="border-4 border-slate-200/60 rounded-[2.2rem] bg-white shadow-inner overflow-hidden focus-within:border-emerald-500 transition-all"><VoiceInput value={businessData.name || ''} onChange={(text) => setBusinessData({ ...businessData, name: text })} onTranscript={(text) => setBusinessData(prev => ({ ...prev, name: text }))} language={lang} translations={t} placeholder={t.placeholder_name} /></div>
                </div>
                <div className="pt-10 border-t-2 border-slate-50 space-y-4">
                  <div className="flex items-center gap-1.5 ml-4"><label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{t.lbl_address}</label><Asterisk className="w-3 h-3 text-rose-500" /><span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">({t.compulsory})</span></div>
                  <div className="border-4 border-slate-200/60 rounded-[2.2rem] bg-white shadow-inner overflow-hidden focus-within:border-emerald-500 transition-all min-h-[120px]"><VoiceInput value={businessData.address || ''} onChange={(text) => setBusinessData({ ...businessData, address: text })} onTranscript={(text) => setBusinessData(prev => ({ ...prev, address: text }))} language={lang} translations={t} placeholder={t.placeholder_address} multiline={true} /></div>
                  
                  <div className="relative group">
                    <button 
                      onClick={() => handleDetectLocation()} 
                      disabled={isDetecting} 
                      className={`w-full mt-6 flex flex-col items-center justify-center gap-3 px-6 py-8 font-black rounded-[2.2rem] active:scale-95 transition-all shadow-md border-4 overflow-hidden relative ${businessData.lat && !isDetecting ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-white text-emerald-700 border-emerald-100'}`}
                    >
                      <div className="flex items-center justify-center gap-4 relative z-10 w-full flex-wrap">
                        {isDetecting ? <Radar className="w-8 h-8 animate-spin text-emerald-600" /> : businessData.lat ? <LocateFixed className="w-8 h-8" /> : <Satellite className="w-8 h-8" />}
                        <span className="text-xl md:text-2xl leading-tight text-center break-words max-w-[85%]">
                          {isDetecting ? t.location_detecting_msg : businessData.lat ? t.location_locked : t.location_detect}
                        </span>
                      </div>
                    </button>
                    {isDetecting && (
                      <div className="flex flex-col items-center mt-4 animate-in fade-in slide-in-from-top-2">
                         <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2 max-w-[85%] mx-auto border border-slate-200">
                           <div 
                            className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out`} 
                            style={{ width: `${Math.min(100, Math.max(15, detectionAccuracy ? (100 - (detectionAccuracy / 1.2)) : 10))}%` }}
                           ></div>
                         </div>
                        <p className="text-[11px] font-black text-slate-500 animate-pulse uppercase tracking-[0.2em] flex items-center gap-2">
                          <SignalHigh className="w-4 h-4 text-emerald-500" /> {detectionStage} {detectionAccuracy ? `(${detectionAccuracy}m)` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-10 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none z-50"><button disabled={!isFormComplete || isDetecting} onClick={handleGenerate} className="w-full h-24 btn-accent pulse-button disabled:opacity-50 disabled:grayscale text-white text-2xl font-black rounded-[2.8rem] shadow-2xl flex items-center justify-center gap-5 transition-all active:scale-95 pointer-events-auto"><Sparkles className="w-9 h-9" />{generatedHtml ? t.btn_update : t.btn_create}</button></div>
          </div>
        ) : step === 2 ? (
          <MithraLoader translations={t} businessData={businessData} />
        ) : step === 3 ? (
          <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar h-screen relative">
            <div className="sticky top-0 bg-white/98 backdrop-blur-md p-6 shadow-sm z-[60] border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-5">
                <button onClick={() => setStep(1)} className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-emerald-600 active:scale-90 transition-all shadow-sm">
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <div>
                  <h2 className="font-black text-slate-800 text-2xl leading-none">{t.preview_title}</h2>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking widest mt-1.5">Live Business Story</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowHistory(true)} className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] relative active:scale-90 transition-transform shadow-sm">
                  <History className="w-7 h-7" />
                </button>
              </div>
            </div>

            <GeneratedWebsite htmlContent={generatedHtml} onHtmlUpdate={handleManualEdit} />

            <div className="p-6 bg-slate-50 border-t-8 border-emerald-500/10 mt-16 pb-48 space-y-8 animate-in slide-in-from-bottom-10 duration-700">
               <div className="text-center space-y-2">
                 <div className="flex items-center justify-center gap-3">
                    <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.lbl_update_website}</h3>
                 </div>
                 <p className="text-slate-500 font-bold text-lg px-8">{t.lbl_edit_instruction}</p>
               </div>
               
               <div className="glass-card p-6 rounded-[3.5rem] shadow-2xl border-2 border-white space-y-6">
                 <div className="bg-white rounded-[2.5rem] border-4 border-slate-100 focus-within:border-emerald-400 transition-all overflow-hidden flex flex-col min-h-[250px] shadow-inner">
                    <VoiceInput value={editCommand} onChange={(text) => setEditCommand(text)} onTranscript={(text) => setEditCommand(text)} language={lang} translations={t} placeholder={t.edit_placeholder} multiline={true} />
                 </div>
                 
                 <div className="flex gap-4">
                   <button 
                    onClick={() => handleDetectLocation((addr, lat, lng) => { 
                      setBusinessData(prev => ({ ...prev, lat, lng })); 
                      handleEdit(`My shop location has changed to these EXACT satellite coordinates: ${lat}, ${lng}. Please update the business address section and the map to point EXACTLY to this verified storefront spot. Explicitly mention nearby local landmarks for customer ease.`); 
                    })} 
                    disabled={isDetecting || isEditing} 
                    className={`flex-1 h-24 rounded-[2.2rem] flex items-center justify-center gap-4 text-xl font-black transition-all shadow-xl border-4 ${isDetecting ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-white text-slate-600 border-slate-50 hover:text-emerald-600'}`}
                   >
                      {isDetecting ? <Radar className="w-10 h-10 animate-spin text-amber-600" /> : <Map className="w-10 h-10" />}
                      {isDetecting ? `...` : "Fix Map"}
                   </button>
                   <button onClick={() => handleEdit()} disabled={isEditing || !editCommand.trim()} className="flex-[2] h-24 bg-emerald-600 rounded-[2.2rem] flex items-center justify-center gap-4 text-white text-2xl font-black shadow-2xl shadow-emerald-200 active:scale-95 transition-all">
                     {isEditing ? <Loader2 className="w-10 h-10 animate-spin" /> : <><Send className="w-9 h-9" /> {t.btn_update}</>}
                   </button>
                 </div>
               </div>

               <div className="pt-10">
                 <button 
                  onClick={() => setIsFinalized(true)} 
                  className="w-full h-24 btn-accent pulse-button text-white text-2xl font-black rounded-[3rem] shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all border-b-8 border-orange-700"
                 >
                   <CheckCircle className="w-8 h-8" />
                   {t.btn_confirm}
                 </button>
               </div>

               <div className="text-center py-8"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{t.lbl_copyright}</p></div>
            </div>
          </div>
        ) : null}

        {isFinalized && (
          <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-[10%] left-[20%] animate-bounce opacity-40"><Star className="w-8 h-8 text-amber-400 fill-amber-400" /></div>
               <div className="absolute bottom-[20%] right-[15%] animate-pulse opacity-40"><Heart className="w-10 h-10 text-rose-500 fill-rose-500" /></div>
               <div className="absolute top-[40%] right-[10%] animate-bounce delay-300 opacity-40"><Sparkle className="w-12 h-12 text-emerald-400" /></div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 border border-white/10 text-center max-w-sm w-full shadow-[0_0_100px_rgba(16,185,129,0.2)]">
               <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
                  <CheckCircle2 className="w-14 h-14 text-white" />
               </div>
               <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                  Congratulations!
               </h2>
               <p className="text-emerald-400 font-black text-xl mb-12">
                  {businessData.name} is now ready for the world.
               </p>
               <button 
                onClick={() => setIsFinalized(false)}
                className="w-full h-18 bg-white text-slate-900 font-black rounded-3xl active:scale-95 transition-all shadow-xl"
               >
                 Go Back
               </button>
            </div>
            <p className="mt-10 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Finalized with Vyapara Mithra</p>
          </div>
        )}
      </div>

      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} onRevert={(item) => { setGeneratedHtml(item.html); setShowHistory(false); }} onDelete={(item) => setHistory(prev => prev.filter(h => h.id !== item.id))} translations={t} />
      <LanguageSelector 
        isOpen={showLanguageModal} 
        onClose={() => setShowLanguageModal(false)} 
        selected={lang} 
        onChange={handleLanguageChange} 
      />
    </div>
  );
};

export default App;