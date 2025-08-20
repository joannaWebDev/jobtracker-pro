'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SearchState {
  q?: string;
  company?: string;
  type?: string;
  workMode?: string;
  region?: string;
  country?: string;
  city?: string;
  datePosted?: string;
  page?: string;
  perPage?: string;
}

export function useSearchState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Save the current search state to sessionStorage
  const saveSearchState = () => {
    const currentState: SearchState = {
      q: searchParams.get('q') || undefined,
      company: searchParams.get('company') || undefined,
      type: searchParams.get('type') || undefined,
      workMode: searchParams.get('workMode') || undefined,
      region: searchParams.get('region') || undefined,
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      datePosted: searchParams.get('datePosted') || undefined,
      page: searchParams.get('page') || undefined,
      perPage: searchParams.get('perPage') || undefined,
    };

    // Only save if there are actual search parameters
    const hasParams = Object.values(currentState).some(value => value);
    if (hasParams) {
      sessionStorage.setItem('jobSearchState', JSON.stringify(currentState));
    }
  };

  // Restore search state from sessionStorage
  const restoreSearchState = () => {
    try {
      const savedState = sessionStorage.getItem('jobSearchState');
      if (savedState) {
        const state: SearchState = JSON.parse(savedState);
        const params = new URLSearchParams();
        
        Object.entries(state).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });

        if (params.toString()) {
          router.replace(`/jobs?${params.toString()}`);
        }
      }
    } catch (error) {
      console.error('Error restoring search state:', error);
    }
  };

  // Navigate to jobs with preserved state
  const navigateToJobs = () => {
    const savedState = sessionStorage.getItem('jobSearchState');
    if (savedState) {
      try {
        const state: SearchState = JSON.parse(savedState);
        const params = new URLSearchParams();
        
        Object.entries(state).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });

        router.push(`/jobs?${params.toString()}`);
      } catch {
        router.push('/jobs');
      }
    } else {
      router.push('/jobs');
    }
  };

  const clearSearchState = () => {
    sessionStorage.removeItem('jobSearchState');
  };

  return {
    saveSearchState,
    restoreSearchState,
    navigateToJobs,
    clearSearchState
  };
}
