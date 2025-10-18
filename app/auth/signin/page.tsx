"use client";

import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeartbeat, FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

export default function SignIn() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-yellow-gradient rounded-2xl shadow-yellow mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FaHeartbeat className="text-2xl text-brand-dark" />
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            AI Medical Assistant
          </motion.h2>
          <motion.p 
            className="text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your intelligent healthcare companion
          </motion.p>
        </motion.div>

        <motion.div 
          className="glass-dark rounded-3xl p-8 shadow-brand"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Mode Toggle */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-8">
            <motion.button
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                isLoginMode 
                  ? 'bg-yellow-gradient text-brand-dark shadow-yellow' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => !isLoginMode && toggleMode()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
            <motion.button
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                !isLoginMode 
                  ? 'bg-yellow-gradient text-brand-dark shadow-yellow' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => isLoginMode && toggleMode()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoginMode ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isLoginMode ? "Welcome Back" : "Create Account"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isLoginMode
                    ? "Sign in to access your health dashboard"
                    : "Join us to start your health journey"
                  }
                </p>
              </div>

              {isLoginMode ? (
                <LoginForm onToggleMode={toggleMode} />
              ) : (
                <RegisterForm onToggleMode={toggleMode} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-gray-400 text-sm">
            Secure authentication powered by NextAuth.js
          </p>
        </motion.div>
      </div>
    </div>
  );
}
