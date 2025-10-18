"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaHeartbeat, 
  FaComments, 
  FaStethoscope, 
  FaChartLine, 
  FaSignOutAlt,
  FaBell,
  FaUser,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  const handleSignOut = async () => {
    const { signOut } = await import("next-auth/react");
    signOut({ callbackUrl: "/" });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const features = [
    {
      icon: FaComments,
      title: "AI Chat",
      description: "Chat with our AI health assistant for instant guidance and support.",
      href: "/chat",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: FaStethoscope,
      title: "Symptom Checker",
      description: "Get AI-powered analysis of your symptoms with probable conditions.",
      href: "/symptoms",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: FaChartLine,
      title: "Health Tracking",
      description: "Monitor your vital signs with interactive charts and insights.",
      href: "/health",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-gradient">
      {/* Navigation */}
      <nav className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-gradient rounded-xl shadow-yellow flex items-center justify-center">
                  <FaHeartbeat className="text-lg text-brand-dark" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Medical Assistant</h1>
                  <p className="text-xs text-gray-400">Health Dashboard</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-gradient rounded-lg flex items-center justify-center">
                  <FaUser className="text-sm text-brand-dark" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{session.user?.name}</p>
                  <p className="text-xs text-gray-400">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                title="Sign Out"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome back,{" "}
            <span className="text-yellow-400">
              {session.user?.name?.split(' ')[0] || 'User'}
            </span>!
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your personalized AI healthcare dashboard is ready. 
            Access all your health tools and insights in one place.
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.a
              key={feature.title}
              href={feature.href}
              className="group block"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`glass-dark rounded-3xl p-8 h-full hover-lift hover-glow border ${feature.borderColor} transition-all duration-300`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`text-2xl ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center text-yellow-400 text-sm font-medium group-hover:text-yellow-300 transition-colors duration-300">
                  Get Started
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Status Section */}
        <motion.div 
          className="glass-dark rounded-3xl p-8 border border-green-500/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                All Features Ready! 🎉
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Your AI Medical Assistant is fully operational! Chat with our AI health assistant, 
                analyze your symptoms, and track your health metrics with interactive charts. 
                Everything is ready for your comprehensive health management journey.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { label: "AI Features", value: "3", icon: FaHeartbeat },
            { label: "Health Tools", value: "Complete", icon: FaChartLine },
            { label: "Security", value: "Enterprise", icon: FaBell }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-dark rounded-2xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
            >
              <div className="w-12 h-12 bg-yellow-gradient rounded-xl shadow-yellow flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-lg text-brand-dark" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}