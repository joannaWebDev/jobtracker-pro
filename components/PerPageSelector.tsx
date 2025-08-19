'use client';

import React from "react";

interface PerPageSelectorProps {
  currentPerPage: number;
}

export default function PerPageSelector({ currentPerPage }: PerPageSelectorProps) {
  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set('perPage', newPerPage);
    url.searchParams.set('page', '1'); // Reset to page 1 when changing per-page
    
    // Preserve all other search parameters
    window.location.href = url.toString();
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <label htmlFor="perPage">Jobs per page:</label>
      <select
        id="perPage"
        name="perPage"
        value={currentPerPage}
        onChange={handlePerPageChange}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  );
}
