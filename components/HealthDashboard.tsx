"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  FaHeart, 
  FaTint, 
  FaWeight, 
  FaPills, 
  FaPlus, 
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaUserMd,
  FaArrowRight,
  FaSpinner,
  FaTimes
} from "react-icons/fa";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface BloodPressureReading {
  _id: string;
  systolic: number;
  diastolic: number;
  timestamp: string;
  notes?: string;
}

interface BloodSugarReading {
  _id: string;
  value: number;
  type: 'fasting' | 'post-meal' | 'random' | 'hba1c';
  timestamp: string;
  notes?: string;
}

interface WeightReading {
  _id: string;
  value: number;
  timestamp: string;
  notes?: string;
}

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reminders: {
    time: string;
    days: string[];
  }[];
  notes?: string;
}

interface MedicationLog {
  _id: string;
  medicationId: string;
  taken: boolean;
  timestamp: string;
  notes?: string;
}

interface HealthDashboardProps {
  className?: string;
}

const COLORS = ['#ffc300', '#ffd60a', '#003566', '#001d3d', '#000814'];

export default function HealthDashboard({ className = "" }: HealthDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'blood-pressure' | 'blood-sugar' | 'weight' | 'medications'>('overview');
  const [bloodPressure, setBloodPressure] = useState<BloodPressureReading[]>([]);
  const [bloodSugar, setBloodSugar] = useState<BloodSugarReading[]>([]);
  const [weight, setWeight] = useState<WeightReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<'blood-pressure' | 'blood-sugar' | 'weight' | 'medication'>('blood-pressure');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/health?type=all");
      if (response.ok) {
        const data = await response.json();
        setBloodPressure(data.bloodPressure || []);
        setBloodSugar(data.bloodSugar || []);
        setWeight(data.weight || []);
        setMedications(data.medications || []);
        setMedicationLogs(data.medicationLogs || []);
      } else {
        throw new Error("Failed to fetch health data");
      }
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120)
      return { status: "Hypertensive Crisis", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
    if (systolic >= 140 || diastolic >= 90)
      return { status: "High BP (Stage 2)", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
    if (systolic >= 130 || diastolic >= 80)
      return { status: "High BP (Stage 1)", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    if (systolic >= 120 && diastolic < 80)
      return { status: "Elevated", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    return { status: "Normal", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" };
  };

  const getBloodSugarStatus = (value: number, type: BloodSugarReading["type"]) => {
    if (type === "fasting") {
      if (value < 100) return { status: "Normal", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" };
      if (value >= 100 && value <= 125) return { status: "Prediabetes", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
      return { status: "Diabetes", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
    } else if (type === "post-meal") {
      if (value < 140) return { status: "Normal", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" };
      if (value >= 140 && value <= 199) return { status: "Prediabetes", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
      return { status: "Diabetes", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
    }
    if (value < 140) return { status: "Normal", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" };
    if (value >= 140 && value < 200) return { status: "Elevated", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    return { status: "High", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
  };

  const getWeightTrend = () => {
    if (weight.length < 2) return { trend: "No trend", icon: null, color: "text-gray-400" };
    const latest = weight[0].value;
    const previous = weight[1].value;
    const diff = latest - previous;

    if (Math.abs(diff) < 0.5) return { trend: "Stable", icon: null, color: "text-gray-400" };
    if (diff > 0) return { trend: "Gaining", icon: FaArrowUp, color: "text-red-400" };
    return { trend: "Losing", icon: FaArrowDown, color: "text-green-400" };
  };

  const getMedicationAdherence = () => {
    const today = new Date();
    const todayLogs = medicationLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === today.toDateString();
    });

    const totalReminders = medications.reduce((total, med) => {
      return total + med.reminders.length;
    }, 0);

    const takenToday = todayLogs.filter((log) => log.taken).length;

    if (totalReminders === 0) return { percentage: 0, status: "No medications", color: "text-gray-400" };

    const percentage = Math.round((takenToday / totalReminders) * 100);

    if (percentage >= 80) return { percentage, status: "Excellent", color: "text-green-400" };
    if (percentage >= 60) return { percentage, status: "Good", color: "text-yellow-400" };
    return { percentage, status: "Needs improvement", color: "text-red-400" };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        timestamp: formData.timestamp || new Date().toISOString(),
      };

      const response = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: formType, data: dataToSend }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({});
        setEditingRecord(null);
        loadHealthData();
      } else {
        const errorData = await response.json();
        console.error("Save failed:", errorData);
        alert(`Failed to save data: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  const handleEdit = (record: any, type: string) => {
    setEditingRecord(record);
    setFormType(type as any);
    setFormData(record);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string, type: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/health?type=${type}&id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          loadHealthData();
        } else {
          const errorData = await response.json();
          console.error("Delete failed:", errorData);
          alert(`Failed to delete record: ${errorData.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        alert("Failed to delete record. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingRecord(null);
    setShowAddForm(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'blood-pressure', label: 'Blood Pressure', icon: FaHeart },
    { id: 'blood-sugar', label: 'Blood Sugar', icon: FaTint },
    { id: 'weight', label: 'Weight', icon: FaWeight },
    { id: 'medications', label: 'Medications', icon: FaPills }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaSpinner className="animate-spin w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading health data...</p>
        </motion.div>
      </div>
    );
  }

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
            <motion.button
              onClick={() => router.push("/dashboard")}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div className="w-10 h-10 bg-yellow-gradient rounded-xl shadow-yellow flex items-center justify-center">
              <FaChartLine className="text-lg text-brand-dark" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Health Dashboard</h1>
              <p className="text-xs text-gray-400">Track your health metrics</p>
            </div>
          </div>
          
          <motion.button
            onClick={() => {
              setFormType("blood-pressure");
              setFormData({});
              setEditingRecord(null);
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Data</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="w-full py-6">
        {/* Tabs */}
        <motion.div 
          className="glass-dark rounded-2xl p-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-yellow-gradient text-brand-dark shadow-yellow'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Blood Pressure",
                      value: bloodPressure[0] ? `${bloodPressure[0].systolic}/${bloodPressure[0].diastolic}` : "N/A",
                      status: bloodPressure[0] ? getBloodPressureStatus(bloodPressure[0].systolic, bloodPressure[0].diastolic).status : null,
                      icon: FaHeart,
                      color: "text-red-400",
                      bgColor: "bg-red-500/20",
                      borderColor: "border-red-500/30"
                    },
                    {
                      title: "Blood Sugar",
                      value: bloodSugar[0] ? `${bloodSugar[0].value} mg/dL` : "N/A",
                      status: bloodSugar[0] ? getBloodSugarStatus(bloodSugar[0].value, bloodSugar[0].type).status : null,
                      icon: FaTint,
                      color: "text-purple-400",
                      bgColor: "bg-purple-500/20",
                      borderColor: "border-purple-500/30"
                    },
                    {
                      title: "Weight",
                      value: weight[0] ? `${weight[0].value} lbs` : "N/A",
                      status: getWeightTrend().trend,
                      icon: FaWeight,
                      color: "text-green-400",
                      bgColor: "bg-green-500/20",
                      borderColor: "border-green-500/30"
                    },
                    {
                      title: "Medication Adherence",
                      value: `${getMedicationAdherence().percentage}%`,
                      status: getMedicationAdherence().status,
                      icon: FaPills,
                      color: "text-blue-400",
                      bgColor: "bg-blue-500/20",
                      borderColor: "border-blue-500/30"
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      className={`glass-dark rounded-2xl p-6 border ${stat.borderColor} hover-lift transition-all duration-300`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                          {stat.status && (
                            <div className={`text-sm ${stat.color}`}>{stat.status}</div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{stat.title}</h3>
                    </motion.div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bloodPressure.length > 0 && (
                    <motion.div 
                      className="glass-dark rounded-2xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">Blood Pressure Trend</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={bloodPressure.slice(0, 14).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => format(new Date(value), "MM/dd")}
                            stroke="#9CA3AF"
                          />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            labelFormatter={(value) => format(new Date(value), "MMM dd, yyyy")}
                            formatter={(value, name) => [
                              `${value} mmHg`,
                              name === "systolic" ? "Systolic" : "Diastolic",
                            ]}
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Line type="monotone" dataKey="systolic" stroke="#ffc300" strokeWidth={2} name="Systolic" />
                          <Line type="monotone" dataKey="diastolic" stroke="#ffd60a" strokeWidth={2} name="Diastolic" />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {bloodSugar.length > 0 && (
                    <motion.div 
                      className="glass-dark rounded-2xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">Blood Sugar Trend</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={bloodSugar.slice(0, 14).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => format(new Date(value), "MM/dd")}
                            stroke="#9CA3AF"
                          />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            labelFormatter={(value) => format(new Date(value), "MMM dd, yyyy")}
                            formatter={(value) => [`${value} mg/dL`, "Blood Sugar"]}
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'blood-pressure' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Blood Pressure Readings</h3>
                  <motion.button
                    onClick={() => {
                      setFormType("blood-pressure");
                      setFormData({});
                      setEditingRecord(null);
                      setShowAddForm(true);
                    }}
                    className="px-4 py-2 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Reading</span>
                  </motion.button>
                </div>

                {bloodPressure.length === 0 ? (
                  <motion.div 
                    className="glass-dark rounded-2xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Blood Pressure Readings</h3>
                    <p className="text-gray-400 mb-6">Start tracking your blood pressure to monitor your cardiovascular health.</p>
                    <motion.button
                      onClick={() => {
                        setFormType("blood-pressure");
                        setFormData({});
                        setEditingRecord(null);
                        setShowAddForm(true);
                      }}
                      className="px-6 py-3 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add First Reading
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bloodPressure.map((reading, index) => {
                      const status = getBloodPressureStatus(reading.systolic, reading.diastolic);
                      return (
                        <motion.div
                          key={reading._id}
                          className="glass-dark rounded-2xl p-6 hover-lift transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-3xl font-bold text-white mb-2">
                                {reading.systolic}/{reading.diastolic}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.color} ${status.border} border`}>
                                {status.status}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(reading, "blood-pressure")}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(reading._id, "blood-pressure")}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(reading.timestamp), "MMM dd, yyyy - h:mm a")}
                          </div>
                          {reading.notes && (
                            <div className="text-sm text-gray-300 mt-2">
                              {reading.notes}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Similar patterns for other tabs... */}
            {activeTab === 'blood-sugar' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Blood Sugar Readings</h3>
                  <motion.button
                    onClick={() => {
                      setFormType("blood-sugar");
                      setFormData({});
                      setEditingRecord(null);
                      setShowAddForm(true);
                    }}
                    className="px-4 py-2 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Reading</span>
                  </motion.button>
                </div>

                {bloodSugar.length === 0 ? (
                  <motion.div 
                    className="glass-dark rounded-2xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaTint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Blood Sugar Readings</h3>
                    <p className="text-gray-400 mb-6">Start tracking your blood sugar levels to monitor your glucose health.</p>
                    <motion.button
                      onClick={() => {
                        setFormType("blood-sugar");
                        setFormData({});
                        setEditingRecord(null);
                        setShowAddForm(true);
                      }}
                      className="px-6 py-3 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add First Reading
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bloodSugar.map((reading, index) => {
                      const status = getBloodSugarStatus(reading.value, reading.type);
                      return (
                        <motion.div
                          key={reading._id}
                          className="glass-dark rounded-2xl p-6 hover-lift transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-3xl font-bold text-white mb-2">
                                {reading.value} mg/dL
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.color} ${status.border} border`}>
                                {status.status}
                              </div>
                              <div className="text-sm text-gray-400 mt-1 capitalize">
                                {reading.type.replace("-", " ")}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(reading, "blood-sugar")}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(reading._id, "blood-sugar")}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(reading.timestamp), "MMM dd, yyyy - h:mm a")}
                          </div>
                          {reading.notes && (
                            <div className="text-sm text-gray-300 mt-2">
                              {reading.notes}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'weight' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Weight Records</h3>
                  <motion.button
                    onClick={() => {
                      setFormType("weight");
                      setFormData({});
                      setEditingRecord(null);
                      setShowAddForm(true);
                    }}
                    className="px-4 py-2 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Weight</span>
                  </motion.button>
                </div>

                {weight.length === 0 ? (
                  <motion.div 
                    className="glass-dark rounded-2xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaWeight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Weight Records</h3>
                    <p className="text-gray-400 mb-6">Start tracking your weight to monitor your health journey.</p>
                    <motion.button
                      onClick={() => {
                        setFormType("weight");
                        setFormData({});
                        setEditingRecord(null);
                        setShowAddForm(true);
                      }}
                      className="px-6 py-3 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add First Weight
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weight.map((record, index) => {
                      const trend = index < weight.length - 1
                        ? record.value > weight[index + 1].value ? "up" : "down"
                        : "stable";
                      return (
                        <motion.div
                          key={record._id}
                          className="glass-dark rounded-2xl p-6 hover-lift transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-3xl font-bold text-white mb-2">
                                {record.value} lbs
                              </div>
                              {trend !== "stable" && (
                                <div className="flex items-center text-sm">
                                  {trend === "up" ? (
                                    <FaArrowUp className="w-4 h-4 text-red-400 mr-1" />
                                  ) : (
                                    <FaArrowDown className="w-4 h-4 text-green-400 mr-1" />
                                  )}
                                  <span className={trend === "up" ? "text-red-400" : "text-green-400"}>
                                    {trend === "up" ? "Gained" : "Lost"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(record, "weight")}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record._id, "weight")}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(record.timestamp), "MMM dd, yyyy - h:mm a")}
                          </div>
                          {record.notes && (
                            <div className="text-sm text-gray-300 mt-2">
                              {record.notes}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Medications</h3>
                  <motion.button
                    onClick={() => {
                      setFormType("medication");
                      setFormData({});
                      setEditingRecord(null);
                      setShowAddForm(true);
                    }}
                    className="px-4 py-2 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Medication</span>
                  </motion.button>
                </div>

                {medications.length === 0 ? (
                  <motion.div 
                    className="glass-dark rounded-2xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaPills className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Medications Added</h3>
                    <p className="text-gray-400 mb-6">Start tracking your medications to manage your health better.</p>
                    <motion.button
                      onClick={() => {
                        setFormType("medication");
                        setFormData({});
                        setEditingRecord(null);
                        setShowAddForm(true);
                      }}
                      className="px-6 py-3 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add First Medication
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((medication, index) => (
                      <motion.div
                        key={medication._id}
                        className="glass-dark rounded-2xl p-6 hover-lift transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="text-2xl font-bold text-white">{medication.name}</div>
                              <div className="text-sm text-gray-400">{medication.dosage}</div>
                              <div className="text-sm text-gray-400">{medication.frequency}</div>
                            </div>
                            <div className="text-sm text-gray-400 mb-4">
                              Started: {format(new Date(medication.startDate), "MMM dd, yyyy")}
                              {medication.endDate && (
                                <span> - Ended: {format(new Date(medication.endDate), "MMM dd, yyyy")}</span>
                              )}
                            </div>
                            {medication.reminders.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-300 mb-2">Reminders:</p>
                                <div className="flex flex-wrap gap-2">
                                  {medication.reminders.map((reminder, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                                    >
                                      {reminder.time} ({reminder.days.join(", ")})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {medication.notes && (
                              <p className="text-sm text-gray-300">{medication.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(medication, "medication")}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(medication._id, "medication")}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="glass-dark rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingRecord ? "Edit" : "Add"} {formType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {formType === "blood-pressure" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Systolic (mmHg)
                        </label>
                        <input
                          type="number"
                          value={formData.systolic || ""}
                          onChange={(e) => setFormData({ ...formData, systolic: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                          placeholder="120"
                          min="50"
                          max="300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Diastolic (mmHg)
                        </label>
                        <input
                          type="number"
                          value={formData.diastolic || ""}
                          onChange={(e) => setFormData({ ...formData, diastolic: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                          placeholder="80"
                          min="30"
                          max="200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.timestamp ? new Date(formData.timestamp).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, timestamp: new Date(e.target.value).toISOString() })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 resize-none"
                        rows={3}
                        placeholder="Morning reading, after exercise, etc."
                      />
                    </div>
                  </>
                )}

                {formType === "blood-sugar" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Blood Sugar Value (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={formData.value || ""}
                        onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        placeholder="95"
                        min="20"
                        max="600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reading Type
                      </label>
                      <select
                        value={formData.type || "fasting"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="fasting">Fasting</option>
                        <option value="post-meal">Post-meal</option>
                        <option value="random">Random</option>
                        <option value="hba1c">HbA1c</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.timestamp ? new Date(formData.timestamp).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, timestamp: new Date(e.target.value).toISOString() })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 resize-none"
                        rows={3}
                        placeholder="Before breakfast, after exercise, etc."
                      />
                    </div>
                  </>
                )}

                {formType === "weight" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.value || ""}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        placeholder="150.0"
                        min="50"
                        max="500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.timestamp ? new Date(formData.timestamp).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, timestamp: new Date(e.target.value).toISOString() })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 resize-none"
                        rows={3}
                        placeholder="Morning weight, after workout, etc."
                      />
                    </div>
                  </>
                )}

                {formType === "medication" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., Metformin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={formData.dosage || ""}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={formData.frequency || ""}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., Twice daily"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 resize-none"
                        rows={3}
                        placeholder="Special instructions, side effects, etc."
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-yellow-gradient text-brand-dark font-medium rounded-xl shadow-yellow hover-lift hover-glow transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingRecord ? "Update" : "Save"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}