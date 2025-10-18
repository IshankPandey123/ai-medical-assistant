"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, 
  FaPlus, 
  FaMinus, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock,
  FaStethoscope,
  FaHeart,
  FaBrain,
  FaBolt,
  FaThermometerHalf,
  FaChartLine,
  FaSpinner,
  FaTrash,
  FaHistory,
  FaTimes,
  FaUserMd,
  FaArrowRight
} from "react-icons/fa";

interface SymptomAnalysis {
  id: string;
  symptoms: string[];
  additionalInfo: string;
  severity: string;
  analysis: string;
  timestamp: string;
  createdAt: string;
}

interface SymptomCheckerProps {
  className?: string;
}

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Cough", "Sore throat", "Runny nose", "Nausea",
  "Vomiting", "Diarrhea", "Fatigue", "Dizziness", "Chest pain", "Shortness of breath",
  "Abdominal pain", "Joint pain", "Muscle aches", "Rash", "Itching", "Swelling",
  "Weight loss", "Weight gain", "Insomnia", "Anxiety", "Depression", "Confusion",
  "Memory problems", "Vision changes", "Hearing problems", "Balance issues",
  "Numbness", "Tingling", "Weakness", "Tremors", "Seizures", "Loss of appetite"
];

const SEVERITY_LEVELS = [
  { value: "mild", label: "Mild", color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/30" },
  { value: "moderate", label: "Moderate", color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/30" },
  { value: "severe", label: "Severe", color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/30" }
];

export default function SymptomChecker({ className = "" }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<SymptomAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const response = await fetch("/api/symptoms");
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error("Error loading analyses:", error);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/symptoms?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadAnalyses();
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          severity,
          additionalInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        loadAnalyses();
        
        // Reset form
        setSelectedSymptoms([]);
        setAdditionalInfo("");
        setSeverity("mild");
      } else {
        throw new Error("Failed to analyze symptoms");
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      setAnalysis("Sorry, I encountered an error while analyzing your symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityConfig = (severityValue: string) => {
    return SEVERITY_LEVELS.find(level => level.value === severityValue) || SEVERITY_LEVELS[0];
  };

  return (
    <div className={`min-h-screen bg-brand-gradient ${className}`}>
      {/* Header */}
      <motion.div 
        className="glass-dark border-b border-white/10 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-gradient rounded-xl shadow-yellow flex items-center justify-center">
              <FaStethoscope className="text-lg text-brand-dark" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Symptom Checker</h1>
              <p className="text-xs text-gray-400">AI-powered symptom analysis</p>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHistory className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="w-full flex h-[calc(100vh-80px)]">
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="w-80 glass-dark border-r border-white/10 flex flex-col"
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Analysis History</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {analyses.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <FaHistory className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No analysis history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyses.map((analysis) => (
                      <motion.div
                        key={analysis.id}
                        className="glass-dark rounded-xl p-4 hover-lift transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">
                              {analysis.symptoms.slice(0, 2).join(", ")}
                              {analysis.symptoms.length > 2 && "..."}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(analysis.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors duration-300"
                          >
                            <FaTrash className="w-3 h-3 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                          getSeverityConfig(analysis.severity).bgColor
                        } ${getSeverityConfig(analysis.severity).color}`}>
                          {getSeverityConfig(analysis.severity).label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col py-6 px-6 relative z-0">
          {/* Analysis Result */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                className="bg-black border border-yellow-500/30 rounded-2xl p-6 mb-6 shadow-2xl relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-gradient rounded-xl shadow-yellow flex items-center justify-center flex-shrink-0">
                    <FaUserMd className="w-6 h-6 text-brand-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-3">AI Analysis Results</h3>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {analysis}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Symptom Selection */}
          <motion.div 
            className="bg-black border border-white/30 rounded-2xl p-6 mb-8 shadow-2xl relative z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Select Your Symptoms</h2>
            
            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Selected Symptoms:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <motion.span
                      key={symptom}
                      className="inline-flex items-center px-3 py-2 bg-yellow-gradient text-brand-dark rounded-xl text-sm font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="ml-2 hover:bg-brand-dark/20 rounded-full p-1 transition-colors duration-300"
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Common Symptoms Grid */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Common Symptoms:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {COMMON_SYMPTOMS.map((symptom) => (
                  <motion.button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      selectedSymptoms.includes(symptom)
                        ? "bg-yellow-gradient text-brand-dark shadow-yellow"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {symptom}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Symptom Input */}
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Add custom symptom..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && addCustomSymptom()}
                />
              </div>
              <motion.button
                onClick={addCustomSymptom}
                disabled={!customSymptom.trim()}
                className="px-4 py-3 bg-yellow-gradient text-brand-dark rounded-xl shadow-yellow hover-lift hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlus className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Severity and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 relative z-20" style={{ isolation: 'isolate' }}>
            {/* Severity Selection */}
            <motion.div 
              className="solid-bg border border-white/30 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Severity Level</h3>
              <div className="space-y-3">
                {SEVERITY_LEVELS.map((level) => (
                  <motion.label
                    key={level.value}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      severity === level.value
                        ? `${level.bgColor} ${level.borderColor} ${level.color}`
                        : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={severity === level.value}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm opacity-75">
                        {level.value === "mild" && "Minor discomfort, doesn't interfere with daily activities"}
                        {level.value === "moderate" && "Noticeable discomfort, some impact on daily activities"}
                        {level.value === "severe" && "Significant discomfort, major impact on daily activities"}
                      </div>
                    </div>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div 
              className="solid-bg border border-white/30 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Additional Information</h3>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Describe any additional details about your symptoms, duration, triggers, or other relevant information..."
                className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 resize-none"
              />
            </motion.div>
          </div>

          {/* Analyze Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              onClick={analyzeSymptoms}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className="px-8 py-4 bg-yellow-gradient text-brand-dark font-bold text-lg rounded-2xl shadow-yellow hover-lift hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAnalyzing ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  <span>Analyzing Symptoms...</span>
                </>
              ) : (
                <>
                  <FaUserMd className="w-5 h-5" />
                  <span>Analyze Symptoms</span>
                  <FaArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}