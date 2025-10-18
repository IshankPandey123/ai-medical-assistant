"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SymptomChecker from "@/components/SymptomChecker";

export default function SymptomCheckerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-dark border-b border-white/10">
        <div className="w-full px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => router.push("/chat")}
                className="bg-yellow-gradient text-brand-dark px-4 py-2 rounded-lg hover-lift hover-glow transition-all duration-300 font-medium"
              >
                AI Chat
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full">
        <SymptomChecker />
      </div>
    </div>
  );
}
