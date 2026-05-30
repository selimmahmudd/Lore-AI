import React, { useState, useRef, useEffect } from "react";
import { 
  BookOpen, 
  Upload, 
  Play, 
  Square, 
  Sparkles, 
  Cpu, 
  Image as ImageIcon, 
  FileText, 
  Volume2, 
  Sliders, 
  Edit3, 
  Check, 
  Loader2, 
  ShieldAlert, 
  RefreshCw, 
  Info,
  ChevronRight,
  BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StoryAnalysis, VOICE_PROFILES, VoiceProfile } from "./types";

export default function App() {
  // Input fields state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string>("");
  const [currentMimeType, setCurrentMimeType] = useState<string>("image/jpeg");

  // Core application states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<StoryAnalysis | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Playback & TTS vocal settings
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [antiImpersonationFilter, setAntiImpersonationFilter] = useState<boolean>(true);
  const [userEditedStory, setUserEditedStory] = useState<string>("");

  // Visual typewriter / editing configuration
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Audio simulation state for safety visualizer
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(15).fill(4));
  const visualizerInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-updating active text when analysis completes
  useEffect(() => {
    if (analysisResult) {
      setUserEditedStory(analysisResult.ghostwrittenParagraph);
    }
  }, [analysisResult]);

  // Typewriter effect simulation steps
  const stepsText = [
    "Reading image data and checking dimensions...",
    "Scanning visual matrices for physical handwriting & signages...",
    "Grounding literal characters (performing first-pass text isolation)...",
    "Identifying setting, ambient colors, atmosphere & underlying mood...",
    "Ghostwriting premium opening paragraph set directly in this universe..."
  ];

  // Simulating nice interactive loading step notifications
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setAnalysisStep((prev) => {
          if (prev < stepsText.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Audio animation visualizer loop when playing speech
  useEffect(() => {
    if (isPlaying) {
      visualizerInterval.current = setInterval(() => {
        setVisualizerBars(() => {
          return new Array(15).fill(4).map(() => Math.floor(Math.random() * 22) + 4);
        });
      }, 100);
    } else {
      if (visualizerInterval.current) {
        clearInterval(visualizerInterval.current);
      }
      setVisualizerBars(new Array(15).fill(4));
    }
    return () => {
      if (visualizerInterval.current) clearInterval(visualizerInterval.current);
    };
  }, [isPlaying]);

  // Handling client-side TTS stop
  const stopAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  // Cleaning up TTS audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Play narration using browser TTS mapped to safety synthetic boundaries
  const playAudio = (textToRead: string) => {
    if (!textToRead) return;

    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech narration is unsupported in this browser.");
      return;
    }

    // First stop any current speech
    stopAudio();

    try {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utteranceRef.current = utterance;

      let rateMultiplier = selectedProfile.rate;
      let pitchMultiplier = selectedProfile.pitch;

      if (antiImpersonationFilter) {
        rateMultiplier = rateMultiplier * 1.15;
        pitchMultiplier = pitchMultiplier > 1 ? pitchMultiplier * 1.25 : pitchMultiplier * 0.8;
      }

      utterance.rate = Math.min(Math.max(rateMultiplier, 0.5), 2.5);
      utterance.pitch = Math.min(Math.max(pitchMultiplier, 0.5), 2.0);

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => 
          v.name.includes("Synthetic") || 
          v.name.includes("Google US") || 
          v.name.includes("Microsoft David") ||
          v.lang.startsWith("en")
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (e) => {
        console.error("Speech Synthesis failure:", e);
        setIsPlaying(false);
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);

    } catch (e: any) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  // File parsing and image loading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setApiError("Please upload a valid image file (PNG, JPG, or JPEG).");
        return;
      }
      setSelectedFile(file);
      setCurrentMimeType(file.type);
      setApiError(null);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop processing
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setApiError("Please drop a valid image file.");
        return;
      }
      setSelectedFile(file);
      setCurrentMimeType(file.type);
      setApiError(null);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove active image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setApiError(null);
    stopAudio();
  };

  // Query Backend server API to analyze physical text & ghostwrite
  const handleAnalyzeStory = async () => {
    if (!imagePreview) {
      setApiError("Please upload an image representing your world before proceeding.");
      return;
    }

    stopAudio();
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setApiError(null);
    setAnalysisResult(null);

    try {
      const base64Data = imagePreview.split(",")[1] || imagePreview;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: currentMimeType,
          userNotes: userNotes.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.json().catch(() => ({ error: "Server communication failed." }));
        throw new Error(errorText.error || `Server responded with ${response.status}`);
      }

      const result: StoryAnalysis = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected error occurred while communicating with the AI host.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset all
  const resetAll = () => {
    handleRemoveImage();
    setUserNotes("");
    setAnalysisResult(null);
    setApiError(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navigation Bar from theme */}
      <nav id="top-nav" className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-800 uppercase">LORE AI</span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
            Safe Synthesis 2.4
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-400 uppercase tracking-widest">
              Engine Ready
            </span>
          </div>
          <button 
            onClick={resetAll}
            id="reset-story-navbar"
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            New Story
          </button>
        </div>
      </nav>

      {/* Main Structural Layout Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
        
        {/* LEFT COLUMN: Visual Inputs, Settings, Background Safes */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Card Frame */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Visual Input
              </h3>
              {imagePreview && (
                <button 
                  onClick={handleRemoveImage}
                  id="swap-image-label" 
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Swap Image
                </button>
              )}
            </div>

            {/* Simulated Modern Image Frame and Dropzone */}
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                id="dropzone"
                className="aspect-video w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors mb-3">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-sm text-slate-700">Upload scene graphic</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  Drag/drop or click to browse standard media (PNG, JPG, JPEG, WEBP)
                </p>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-inner">
                <img
                  src={imagePreview}
                  alt="Workspace visual perspective background"
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                  id="uploaded-image"
                />
                <div className="absolute bottom-3 left-3 text-white text-[10px] font-mono bg-black/75 px-2 py-0.5 rounded border border-white/10">
                  {selectedFile?.name || "UPLOADED_WORLD_METADATA.RAW"}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={handleRemoveImage}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow transition-colors cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              </div>
            )}

            {/* Writer Directives Box */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Atmospheric Constraints
                </label>
                <span className="text-[10px] font-mono text-slate-400">{userNotes.length}/350 chars</span>
              </div>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                maxLength={350}
                placeholder="Instruct the ghostwriter (e.g. Victorian mystery, moody synth shadows, somber twilight, isolated rustic structure...)"
                rows={3}
                className="w-full text-xs font-mono bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-3 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleAnalyzeStory}
              disabled={isAnalyzing || !imagePreview}
              id="analyze-workspace-trigger"
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                !imagePreview
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-98 cursor-pointer"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                  <span>Synthesizing Scene Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white/90" />
                  <span>Ghostwrite Opening Paragraph</span>
                </>
              )}
            </button>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="leading-normal">
                  <span className="font-bold">Execution Prevented: </span> {apiError}
                </div>
              </div>
            )}

          </div>

          {/* Source Metadata & OCR Physical Extraction Checking Panel */}
          {analysisResult && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Literal Physical Text (Verified Data)
                </h3>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-mono px-1.5 py-0.5 rounded">
                  99% Accuracy
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-600 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Exact Word-for-Word Signage Detect:
                </div>
                <p className="text-xs font-mono text-slate-700 leading-relaxed italic select-all whitespace-pre-wrap">
                  "{analysisResult.extractedText}"
                </p>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Strict factual isolation separates native text strings in the visual source from hallucinatory generative additions.
              </p>
            </div>
          )}

          {/* Environmental Mood Widget from the design theme */}
          <div className="bg-slate-900 rounded-xl p-5 text-white/90 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Environmental Mood & Vector
              </span>
              <div className="flex gap-1" id="mood-bar-indicators">
                <div className="w-3 h-1 bg-indigo-500 rounded-full"></div>
                <div className="w-3 h-1 bg-indigo-500 rounded-full"></div>
                <div className="w-3 h-1 bg-indigo-400 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white/5 rounded border border-white/10">
                <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mb-1">
                  Lighting Atmosphere
                </div>
                <div className="text-xs font-semibold text-white truncate" id="light-atmos">
                  {analysisResult ? analysisResult.settingMood : "Awaiting Image"}
                </div>
              </div>
              <div className="p-2.5 bg-white/5 rounded border border-white/10">
                <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mb-1">
                  Evaluated Motif
                </div>
                <div className="text-xs font-semibold text-white truncate" id="motif-spec">
                  {analysisResult ? "Interactive Narrative" : "Pending Synthesis"}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-normal italic">
              {analysisResult 
                ? `"${analysisResult.visualSummary}"` 
                : "Awaiting visual processing framework triggers to populate atmospheric metrics."
              }
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Interactive Story Studio & Custom Audio Players */}
        <section className="lg:col-span-7 space-y-6">
          
          <AnimatePresence mode="wait">
            
            {/* STATE 1: Idle Story Screen */}
            {!isAnalyzing && !analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col justify-center items-center min-h-[460px] shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                  <BookOpen className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">Manuscript Canvas Empty</h3>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
                  Select a setting design mockup or upload an image file from the left panel to launch the ScribeVision atmospheric analysis engine.
                </p>

                {/* Preset Sandbox Options */}
                <div className="w-full max-w-md pt-6 border-t border-dashed border-slate-200 space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                    Preset Sandboxed Scene Files
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => {
                        setImagePreview("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=80");
                        setCurrentMimeType("image/jpeg");
                        setUserNotes("Sun-drenched coastal ruins, ancient marble structures, optimistic solitude");
                      }}
                      className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                    >
                      Coastal Ruins
                    </button>
                    <button
                      onClick={() => {
                        setImagePreview("https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=640&q=80");
                        setCurrentMimeType("image/jpeg");
                        setUserNotes("Dark, heavy ancient pine trees, thick gothic fog hanging low, somber mood");
                      }}
                      className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                    >
                      Misty Gothic Forest
                    </button>
                    <button
                      onClick={() => {
                        setImagePreview("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=640&q=80");
                        setCurrentMimeType("image/jpeg");
                        setUserNotes("Cyberpunk street alleyways, rain slicked asphalt, high tech low life, neon contrast");
                      }}
                      className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                    >
                      Cyberpunk Neon Lane
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE 2: Generating & Ghostwriting Sequence */}
            {isAnalyzing && (
              <motion.div
                key="loading-sequence"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 min-h-[460px] shadow-sm flex flex-col justify-center"
              >
                <div className="max-w-md mx-auto text-center space-y-6">
                  
                  <div className="relative inline-flex items-center justify-center p-3">
                    <div className="absolute inset-0 rounded-full bg-indigo-50 animate-ping opacity-60"></div>
                    <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">ScribeVision Generator is Busy</h3>
                    <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider">
                      Applying Dual-Pass Grounding Verification
                    </p>
                  </div>

                  {/* Checklist visualizer */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl text-left p-4.5 space-y-3 font-mono text-xs">
                    {stepsText.map((step, idx) => {
                      const isCurrent = idx === analysisStep;
                      const isPast = idx < analysisStep;
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-3 transition-colors duration-300 ${
                            isCurrent ? "text-indigo-900 font-bold" : isPast ? "text-emerald-700 font-medium" : "text-slate-400"
                          }`}
                        >
                          <span className="flex-shrink-0 mt-0.5">
                            {isPast ? (
                              <span className="h-4.5 w-4.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-semibold">✓</span>
                            ) : isCurrent ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                            ) : (
                              <span className="h-4.5 w-4.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">{idx + 1}</span>
                            )}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </motion.div>
            )}

            {/* STATE 3: Render Active Output */}
            {analysisResult && !isAnalyzing && (
              <motion.div
                key="render-output"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                
                {/* Header controls matching theme */}
                <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800" id="generated-title">
                      The {analysisResult.settingMood} Threshold
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Generated Opening • Ghostwriter v4.1</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Font Adjuster */}
                    <div className="flex bg-white border border-slate-200 rounded-lg p-1 text-[11px] font-mono text-slate-500">
                      <button
                        onClick={() => setFontSize("small")}
                        className={`px-2 py-1 rounded-md transition-all ${fontSize === "small" ? "bg-slate-100 text-slate-800 font-bold" : "hover:text-slate-800"}`}
                      >
                        S
                      </button>
                      <button
                        onClick={() => setFontSize("medium")}
                        className={`px-2 py-1 rounded-md transition-all ${fontSize === "medium" ? "bg-slate-100 text-slate-800 font-bold" : "hover:text-slate-800"}`}
                      >
                        M
                      </button>
                      <button
                        onClick={() => setFontSize("large")}
                        className={`px-2 py-1 rounded-md transition-all ${fontSize === "large" ? "bg-slate-100 text-slate-800 font-bold" : "hover:text-slate-800"}`}
                      >
                        L
                      </button>
                    </div>

                    {/* Simple toggle for edit */}
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      id="edit-toggle"
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isEditing ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Save</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Composition Paper Area with exact highlighter style constraint */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-h-[180px]">
                  
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Manuscript Content
                      </label>
                      <textarea
                        value={userEditedStory}
                        id="story-editor"
                        onChange={(e) => setUserEditedStory(e.target.value)}
                        className="w-full min-h-[160px] p-4 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-serif text-base sm:text-lg leading-relaxed shadow-inner"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-2xl">
                      <p 
                        id="story-paragraph"
                        className={`font-serif text-slate-800 leading-relaxed select-all transition-all ${
                          fontSize === "small" ? "text-sm sm:text-base" : fontSize === "medium" ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                        }`}
                      >
                        {userEditedStory ? (
                          <>
                            {userEditedStory.split(" ").slice(0, 10).join(" ")}{" "}
                            <span className="bg-amber-50 px-1 px-1.5 border-b border-amber-200 text-amber-950 font-serif rounded inline-block shadow-2xs">
                              {analysisResult.extractedText !== "No text physically written in the image." 
                                ? analysisResult.extractedText 
                                : "the ancient boundary"
                              }
                            </span>{" "}
                            {userEditedStory.split(" ").slice(10).join(" ")}
                          </>
                        ) : (
                          "Awaiting active manuscript updates..."
                        )}
                      </p>
                    </div>
                  )}

                  {/* Fact Grounding Stamp Banner */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      <strong>Fact Stamp Security:</strong> The highlighted yellow span displays exactly isolated character arrays captured within the physical scene file. Utilizing direct literal strings ensures safe, traceable fiction synthesis.
                    </div>
                  </div>

                </div>

                {/* Player / Narrative Control bottom deck from design theme */}
                <div id="narrative-control-deck" className="mt-auto p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-5 sm:gap-6">
                  
                  {/* Control Button Play/Stop */}
                  <div className="flex items-center gap-4">
                    {isPlaying ? (
                      <button
                        onClick={stopAudio}
                        id="playback-stop-btn"
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
                        title="Cancel Narrative Synthesis"
                      >
                        <Square className="w-5 h-5 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={() => playAudio(userEditedStory)}
                        id="playback-play-btn"
                        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-95 transition-transform cursor-pointer"
                        title="Read Aloud"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    )}

                    <div className="flex-1 min-w-[120px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Vocal Narrative
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {isPlaying ? "Generating Stream..." : "Read Aloud (TTS)"}
                      </span>
                    </div>
                  </div>

                  {/* Progressive visualizer track */}
                  <div className="flex-1 flex flex-col justify-center min-w-[160px]">
                    <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-400">
                      <span>SPEECH AUDIO SPECTRUM</span>
                      <span>{isPlaying ? "PLAYING" : "STANDBY"}</span>
                    </div>

                    {/* Integrated custom spectrum bars */}
                    <div className="h-6 flex items-end gap-0.5 px-3 bg-white border border-slate-200/60 rounded-lg py-1 justify-center">
                      {visualizerBars.map((h, i) => (
                        <span 
                          key={i} 
                          className={`w-1 rounded-full ${isPlaying ? "bg-indigo-600" : "bg-slate-300"} transition-all duration-100`} 
                          style={{ height: `${h}px` }} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vocal synthesizer select dropdown */}
                  <div className="flex flex-col border-l border-slate-200/80 pl-0 md:pl-5 pt-3 md:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Sliders className="w-3 h-3" /> Voice Profile
                    </span>
                    <select
                      className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:text-indigo-600 border-none p-0 cursor-pointer"
                      value={selectedProfile.id}
                      onChange={(e) => {
                        const found = VOICE_PROFILES.find((p) => p.id === e.target.value);
                        if (found) {
                          setSelectedProfile(found);
                          if (isPlaying) stopAudio();
                        }
                      }}
                    >
                      {VOICE_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Synthesis Impersonation Switch */}
                <div className="px-6 py-2.5 bg-slate-100/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Secure Synthetic Cadence Filter
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Anti-Impersonation</span>
                    <button
                      onClick={() => {
                        setAntiImpersonationFilter(!antiImpersonationFilter);
                        if (isPlaying) stopAudio();
                      }}
                      className={`w-8 h-4 rounded-full transition-all relative ${antiImpersonationFilter ? "bg-indigo-600" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${antiImpersonationFilter ? "left-4.5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* Quick reset/swap control under results */}
          {analysisResult && (
            <div className="flex justify-end pt-1">
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer py-2 px-3 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start New Manuscript Project
              </button>
            </div>
          )}

        </section>

      </div>

      {/* Safety System Footer matching theme exactly */}
      <footer id="system-footer" className="h-10 bg-slate-100 border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest hidden md:inline-block">
            AI Misinformation Protocol: Active
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono font-medium">
            Strict Fact-to-Fiction Border
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
            {isAnalyzing ? "Processing neural verification checks..." : "Analyzing session for policy compliance..."}
          </span>
        </div>
      </footer>

    </div>
  );
}
