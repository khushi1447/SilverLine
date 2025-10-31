"use client";

import { useState, useEffect } from "react";

const GUEST_SESSION_KEY = "guest_session_id";
const GUEST_SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

interface GuestSession {
  id: string;
  createdAt: number;
  expiresAt: number;
}

export function useGuestSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeGuestSession = () => {
      try {
        const stored = localStorage.getItem(GUEST_SESSION_KEY);
        
        if (stored) {
          const session: GuestSession = JSON.parse(stored);
          
          // Check if session is expired
          if (Date.now() > session.expiresAt) {
            localStorage.removeItem(GUEST_SESSION_KEY);
            createNewSession();
          } else {
            setSessionId(session.id);
          }
        } else {
          createNewSession();
        }
      } catch (error) {
        console.error("Error initializing guest session:", error);
        createNewSession();
      } finally {
        setIsLoading(false);
      }
    };

    const createNewSession = () => {
      const newSession: GuestSession = {
        id: generateSessionId(),
        createdAt: Date.now(),
        expiresAt: Date.now() + GUEST_SESSION_EXPIRY,
      };
      
      try {
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
        setSessionId(newSession.id);
      } catch (error) {
        console.error("Error creating guest session:", error);
        // Fallback to sessionStorage if localStorage is not available
        try {
          sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
          setSessionId(newSession.id);
        } catch (fallbackError) {
          console.error("Error creating guest session in sessionStorage:", fallbackError);
        }
      }
    };

    initializeGuestSession();
  }, []);

  const generateSessionId = (): string => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const clearGuestSession = () => {
    try {
      localStorage.removeItem(GUEST_SESSION_KEY);
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      setSessionId(null);
    } catch (error) {
      console.error("Error clearing guest session:", error);
    }
  };

  const refreshSession = () => {
    const newSession: GuestSession = {
      id: generateSessionId(),
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_SESSION_EXPIRY,
    };
    
    try {
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
      setSessionId(newSession.id);
    } catch (error) {
      console.error("Error refreshing guest session:", error);
    }
  };

  return {
    sessionId,
    isLoading,
    clearGuestSession,
    refreshSession,
  };
} 