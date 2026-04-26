import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApiClient } from '@/middleware/apiClient';
import { useSession } from '@clerk/expo';

export type VerificationContext = {
  groupId: string;
  rideId: string;
  childId: string;
  childName: string;
};

type DemoContextType = {
  verificationContext: VerificationContext | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [verificationContext, setVerificationContext] = useState<VerificationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useSession();
  const api = useApiClient("live-messaging");

  const fetchDemoData = React.useCallback(async () => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<VerificationContext[]>("/demo/verification-contexts");
      if (data && data.length > 0) {
        setVerificationContext(data[0]);
      } else {
        setVerificationContext(null);
      }
    } catch (err: any) {
      console.error("Error fetching demo context:", err);
      setError(err.message || "Failed to load demo data");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, api]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        fetchDemoData();
      } else {
        setVerificationContext(null);
        setError(null);
        setIsLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, fetchDemoData]);

  return (
    <DemoContext.Provider value={{ verificationContext, isLoading, error, refresh: fetchDemoData }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
