'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Job, ExternalJob } from '@/lib/types';

interface ApplyButtonProps {
  job: Job;
  applicationStatus?: { status: string; appliedAt: Date };
}

export default function ApplyButton({ job, applicationStatus }: ApplyButtonProps) {
  const { data: session } = useSession();
  const [currentStatus, setCurrentStatus] = useState(applicationStatus?.status);
  const [isLoading, setIsLoading] = useState(false);

  const isApplied = !!applicationStatus;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-800 cursor-not-allowed';
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800 cursor-not-allowed';
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800 cursor-not-allowed';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 cursor-not-allowed';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-800 cursor-not-allowed';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'INTERVIEW':
        return 'Interview 🎯';
      case 'REVIEWING':
        return 'Under Review 📝';
      case 'APPLIED':
        return 'Applied ✓';
      case 'ACCEPTED':
        return 'Accepted 🎉';
      case 'REJECTED':
        return 'Rejected 💔';
      default:
        return 'Applied ✓';
    }
  };

  const handleMarkAsApplied = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!session) {
      alert('Please sign in to track applications');
      return;
    }

    setIsLoading(true);
    
    try {
      const applicationData = {
        externalJobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        source: job.source || 'adzuna',
        externalUrl: job.source === 'adzuna' ? (job as ExternalJob).externalUrl : `#${job.id}`,
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStatus('APPLIED');
        // Don't auto-redirect - let user manually apply
      } else {
        if (response.status === 409) {
          setCurrentStatus('APPLIED'); // Already applied
        } else {
          alert(data.error || 'Failed to track application');
        }
      }
    } catch (error) {
      console.error('Error tracking application:', error);
      alert('Failed to track application');
    } finally {
      setIsLoading(false);
    }
  };

  // All jobs are from Adzuna now
  return (
    <div className="flex gap-2">
      <a
        href={(job as ExternalJob).externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 hover:text-indigo-700 font-medium"
      >
        {isApplied ? 'Go to job posting →' : 'Apply Now →'}
      </a>
      <button
        onClick={handleMarkAsApplied}
        disabled={isLoading || isApplied}
        className={`px-3 py-1 text-sm rounded-md font-medium ${
          isApplied
            ? getStatusStyle(currentStatus || 'APPLIED')
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {isLoading ? '...' : isApplied ? getStatusLabel(currentStatus || 'APPLIED') : 'Mark Applied'}
      </button>
    </div>
  );
}
