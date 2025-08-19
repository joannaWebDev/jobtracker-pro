'use client';

import { useState } from 'react';
import { formatDistanceToNow } from "date-fns";
import StatusSelector from "@/components/StatusSelector";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  appliedAt: string;
  source: string;
  externalUrl: string;
}

interface DashboardClientProps {
  initialApplications: Application[];
}

export default function DashboardClient({ initialApplications }: DashboardClientProps) {
  const [applications, setApplications] = useState(initialApplications);

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    );
  };

  // Custom sorting by priority: INTERVIEW > REVIEWING > APPLIED > ACCEPTED > REJECTED
  const statusPriority = {
    'INTERVIEW': 1,
    'REVIEWING': 2,
    'APPLIED': 3,
    'ACCEPTED': 4,
    'REJECTED': 5,
  };

  const sortedApplications = [...applications].sort((a, b) => {
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999;
    
    // Sort by priority first
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort by date (newest first)
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  if (applications.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
        <p className="text-gray-600 mb-4">
          Start applying to jobs and track them here. Click &quot;Mark Applied&quot; on any job card to add it to your dashboard.
        </p>
        <a
          href="/jobs"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse Jobs
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedApplications.map((application) => (
        <div
          key={application.id}
          className={`p-6 rounded-lg shadow-sm transition-all ${
            application.status === 'REJECTED'
              ? 'bg-gray-50 opacity-75 hover:opacity-90'
              : application.status === 'INTERVIEW'
              ? 'bg-green-50 hover:bg-green-100 hover:shadow-md'
              : 'bg-white hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                {application.jobTitle}
                {application.status === 'REJECTED' && <span className="text-lg">💔</span>}
              </h2>
              <p className="text-gray-600 mb-2">
                {application.company}
              </p>
              <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2">
                <span>{application.location}</span>
                <span>•</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  via {application.source}
                </span>
              </div>
            </div>
            <div className="text-right">
              <StatusSelector
                currentStatus={application.status}
                applicationId={application.id}
                onStatusUpdate={(newStatus) => handleStatusUpdate(application.id, newStatus)}
              />
              <div className="text-sm text-gray-500 mt-1">
                Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 line-clamp-2">
              Applied to {application.jobTitle} position at {application.company}
            </p>
          </div>

          <div className="flex justify-end">
            <a
              href={application.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            > Go to job posting →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
