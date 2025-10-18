"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaHeartbeat, 
  FaStethoscope, 
  FaChartLine, 
  FaComments,
  FaArrowRight,
  FaShieldAlt,
  FaBrain,
  FaMobileAlt
} from "react-icons/fa";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-white text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading your health dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-gradient">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-gradient rounded-2xl shadow-yellow mb-4">
                  <FaHeartbeat className="text-3xl text-brand-dark" />
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                AI Medical
                <span className="block bg-yellow-gradient bg-clip-text text-transparent">
                  Assistant
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your intelligent healthcare companion powered by AI. 
                Get instant health insights, track your metrics, and chat with our medical AI.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="group inline-flex items-center px-8 py-4 bg-yellow-gradient text-brand-dark font-bold text-lg rounded-2xl shadow-yellow hover-lift hover-glow transition-all duration-300"
                >
                  Get Started
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative py-20 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Everything you need for comprehensive health management
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: FaComments,
                  title: "AI Chat",
                  description: "Chat with our intelligent medical AI for instant health guidance",
                  color: "text-blue-400"
                },
                {
                  icon: FaStethoscope,
                  title: "Symptom Checker",
                  description: "AI-powered symptom analysis with probable conditions",
                  color: "text-green-400"
                },
                {
                  icon: FaChartLine,
                  title: "Health Tracking",
                  description: "Monitor vital signs with interactive charts",
                  color: "text-purple-400"
                },
                {
                  icon: FaShieldAlt,
                  title: "Secure & Private",
                  description: "Your health data is encrypted and completely private",
                  color: "text-yellow-400"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="glass-dark rounded-3xl p-8 h-full hover-lift hover-glow">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6 ${feature.color}`}>
                      <feature.icon className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Powered by Advanced AI
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Built with cutting-edge technology for accurate health insights
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: FaBrain,
                  title: "Gemini AI",
                  description: "Google's most advanced AI model for medical insights"
                },
                {
                  icon: FaMobileAlt,
                  title: "Responsive Design",
                  description: "Access your health data anywhere, anytime"
                },
                {
                  icon: FaShieldAlt,
                  title: "NextAuth Security",
                  description: "Enterprise-grade authentication and data protection"
                }
              ].map((tech, index) => (
                <motion.div
                  key={tech.title}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-gradient rounded-2xl shadow-yellow mb-6">
                    <tech.icon className="text-3xl text-brand-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{tech.title}</h3>
                  <p className="text-gray-300">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-12 border-t border-white/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-gradient rounded-xl shadow-yellow mb-4">
                <FaHeartbeat className="text-xl text-brand-dark" />
              </div>
              <p className="text-gray-400 mb-2">
                AI Medical Assistant - Your Health, Our Priority
              </p>
              <p className="text-sm text-gray-500">
                This tool is for informational purposes only and should not replace professional medical advice.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
