"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaPaperPlane, 
  FaSpinner, 
  FaTrash, 
  FaComments, 
  FaPlus,
  FaHistory,
  FaTimes,
  FaRobot,
  FaUser,
  FaHeartbeat
} from "react-icons/fa";
import { ChatMessage } from "@/lib/gemini";

interface ChatSession {
  sessionId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  firstMessage: string;
}

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className = "" }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Set mounted state
    setIsMounted(true);
    
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    loadChatSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatSessions = async () => {
    try {
      const response = await fetch("/api/chat/sessions");
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowSessions(false);
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCurrentSessionId(sessionId);
        setShowSessions(false);
      }
    } catch (error) {
      console.error("Error loading chat session:", error);
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadChatSessions();
        if (currentSessionId === sessionId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  const clearAllChats = async () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      try {
        const response = await fetch("/api/chat", {
          method: "DELETE",
        });
        if (response.ok) {
          loadChatSessions();
          startNewChat();
        }
      } catch (error) {
        console.error("Error clearing all chats:", error);
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: currentSessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: data.message,
          timestamp: data.timestamp,
        };

        setMessages((prev) => [...prev, aiMessage]);
        
        // Update session ID if this is a new chat
        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
        
        // Reload sessions to get updated list
        loadChatSessions();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
              <FaHeartbeat className="text-lg text-brand-dark" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Health Assistant</h1>
              <p className="text-xs text-gray-400">Powered by Gemini AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowSessions(!showSessions)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHistory className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={startNewChat}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="w-full flex h-[calc(100vh-80px)]">
        {/* Chat Sessions Sidebar */}
        <AnimatePresence>
          {showSessions && (
            <motion.div
              className="w-80 glass-dark border-r border-white/10 flex flex-col"
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Chat History</h3>
                  <button
                    onClick={() => setShowSessions(false)}
                    className="p-1 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {chatSessions.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <FaComments className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <motion.div
                        key={session.sessionId}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          currentSessionId === session.sessionId
                            ? 'bg-yellow-gradient text-brand-dark'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        onClick={() => loadChatSession(session.sessionId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{session.title}</h4>
                            <p className="text-xs opacity-75 truncate mt-1">
                              {session.messageCount} messages
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChatSession(session.sessionId);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors duration-300"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-white/10">
                <motion.button
                  onClick={clearAllChats}
                  className="w-full py-2 px-4 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear All Chats
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-20 h-20 bg-yellow-gradient rounded-2xl shadow-yellow flex items-center justify-center mx-auto mb-6">
                  <FaRobot className="text-3xl text-brand-dark" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Welcome to AI Health Assistant</h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  I'm here to help with your health questions. Ask me about symptoms, 
                  medications, or any health concerns you might have.
                </p>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" 
                        ? "bg-blue-gradient" 
                        : "bg-yellow-gradient"
                    }`}>
                      {message.role === "user" ? (
                        <FaUser className="w-4 h-4 text-white" />
                      ) : (
                        <FaRobot className="w-4 h-4 text-brand-dark" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-gradient text-white"
                        : "glass-dark text-white"
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 ${
                        message.role === "user" ? "text-blue-100" : "text-gray-400"
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-gradient rounded-full flex items-center justify-center">
                    <FaRobot className="w-4 h-4 text-brand-dark" />
                  </div>
                  <div className="glass-dark rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <FaSpinner className="w-4 h-4 animate-spin text-yellow-400" />
                      <span className="text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.div 
            className="glass-dark border-t border-white/10 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your health..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 resize-none"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                {isMounted && isSupported && (
                  <motion.button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isListening 
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                        : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isListening ? (
                      <FaMicrophoneSlash className="w-5 h-5" />
                    ) : (
                      <FaMicrophone className="w-5 h-5" />
                    )}
                  </motion.button>
                )}
                
                <motion.button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-yellow-gradient text-brand-dark rounded-xl shadow-yellow hover-lift hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPaperPlane className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}