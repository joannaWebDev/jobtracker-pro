'use client';

import { Job, ExternalJob } from "@/lib/types";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  searchWorkMode?: string;
  applicationStatus?: { status: string; appliedAt: Date };
}

export default function JobCard({ job, searchWorkMode, applicationStatus }: JobCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(!!applicationStatus);

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
        setIsApplied(true);
      } else {
        if (response.status === 409) {
          setIsApplied(true); // Already applied
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
  const getWorkModeFromDescription = (description: string, title: string): string | null => {
    const text = (description + ' ' + title).toLowerCase();
    
    // Lenient remote work detection - matching our filter logic
    if (text.includes('remote') || 
        text.includes('work from home') || 
        text.includes('wfh') ||
        text.includes('telecommute') ||
        text.includes('distributed') ||
        text.includes('from anywhere') ||
        text.includes('location independent') ||
        text.includes('flexible location') ||
        text.includes('anywhere')) {
      return 'remote';
    }
    
    // Hybrid work indicators
    if (text.includes('hybrid') || 
        text.includes('flexible work') ||
        text.includes('home/office') ||
        (text.includes('remote') && text.includes('office'))) {
      return 'hybrid';
    }
    
    // On-site indicators
    if (text.includes('on-site') || 
        text.includes('onsite') ||
        text.includes('office-based') ||
        (text.includes('office') && (text.includes('based') || text.includes('located')))) {
      return 'onsite';
    }
    
    return null;
  };

  const workMode = getWorkModeFromDescription(job.description, job.title);
  const isWorkModeMatch = searchWorkMode && workMode === searchWorkMode;

  const getCardStyle = () => {
    if (!applicationStatus) {
      return 'bg-white hover:shadow-md transition-shadow';
    }
    
    switch (applicationStatus.status) {
      case 'REJECTED':
        return 'bg-gray-50 opacity-75 hover:opacity-90 hover:shadow-md transition-all';
      case 'INTERVIEW':
        return 'bg-green-50 hover:bg-green-100 hover:shadow-md transition-all';
      default:
        return 'bg-white hover:shadow-md transition-all';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className={`p-6 rounded-lg shadow-sm ${getCardStyle()}`}>
      <div>
        {/* Header with title and status */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {job.title}
            {applicationStatus?.status === 'REJECTED' && <span className="text-lg">💔</span>}
          </h2>
          {applicationStatus && (
            <span className={`px-3 py-1 text-sm rounded-md font-medium ${getStatusStyle(applicationStatus.status)}`}>
              {getStatusLabel(applicationStatus.status)}
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-2">{job.company}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4 flex-wrap gap-2">
          <span className="mr-2">{job.location}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
            job.type === 'Full-time' ? 'bg-green-100 text-green-800' :
            job.type === 'Part-time' ? 'bg-blue-100 text-blue-800' :
            job.type === 'Contract' ? 'bg-orange-100 text-orange-800' :
            job.type === 'Internship' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {job.type}
          </span>
          {workMode && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
              isWorkModeMatch 
                ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300' 
                : workMode === 'remote' ? 'bg-green-100 text-green-800' :
                  workMode === 'hybrid' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
            }`}>
              {workMode}
            </span>
          )}
          {job.salary && (
            <span className="font-semibold text-gray-900">
              {job.salary}
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {job.description}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {job.source === 'adzuna' 
                ? `Via Adzuna • ${(job as ExternalJob).postedBy.name}`
                : `Posted by ${job.postedBy?.name || 'Unknown'}`
              }
            </span>
            {job.source !== 'local' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                External
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={(job as ExternalJob).externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isApplied ? 'Go to job posting →' : 'Apply Now →'}
          </a>
          {!isApplied && (
            <button
              onClick={handleMarkAsApplied}
              disabled={isLoading}
              className="px-3 py-1 text-sm rounded-md font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {isLoading ? '...' : 'Mark Applied'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}