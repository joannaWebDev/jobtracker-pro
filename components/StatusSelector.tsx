'use client';

import { useState } from 'react';

interface StatusSelectorProps {
  currentStatus: string;
  applicationId: string;
  onStatusUpdate: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'APPLIED', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'REVIEWING', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'INTERVIEW', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

export default function StatusSelector({ currentStatus, applicationId, onStatusUpdate }: StatusSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onStatusUpdate(newStatus);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${
          currentOption?.color || 'bg-gray-100 text-gray-800'
        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}