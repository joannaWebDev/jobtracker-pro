'use client';

import { useEffect } from 'react';
import { useSearchState } from '@/hooks/useSearchState';
import { useSearchParams } from 'next/navigation';

interface JobsPageClientProps {
  children: React.ReactNode;
}

export default function JobsPageClient({ children }: JobsPageClientProps) {
  const { saveSearchState } = useSearchState();
  const searchParams = useSearchParams();

  // Save search state whenever search parameters change
  useEffect(() => {
    saveSearchState();
  }, [searchParams, saveSearchState]);

  // Save search state when the component is about to unmount (user navigating away)
  useEffect(() => {
    return () => {
      saveSearchState();
    };
  }, [saveSearchState]);

  return <>{children}</>;
}