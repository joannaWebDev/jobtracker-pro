'use client';

import { useState, useEffect } from 'react';
import { useSearchState } from '@/hooks/useSearchState';

interface JobSearchFormProps {
  query?: string;
  searchType?: string;
  searchWorkMode?: string;
  searchRegion?: string;
  searchCountry?: string;
  searchCity?: string;
  searchCompany?: string;
  searchDatePosted?: string;
}

export default function JobSearchForm({
  query,
  searchType,
  searchWorkMode,
  searchRegion,
  searchCountry,
  searchCity,
  searchCompany,
  searchDatePosted,
}: JobSearchFormProps) {
  const { clearSearchState } = useSearchState();
  const [selectedRegion, setSelectedRegion] = useState(searchRegion || 'europe');

  const handleClearAll = () => {
    clearSearchState();
    window.location.href = '/jobs';
  };

  const getCountriesForRegion = (region: string) => {
    if (region === 'us') {
      return [
        { value: 'us', label: 'United States' }
      ];
    }
    if (region === 'europe') {
      return [
        { value: 'gb', label: 'United Kingdom' },
        { value: 'de', label: 'Germany' },
        { value: 'fr', label: 'France' },
        { value: 'it', label: 'Italy' },
        { value: 'es', label: 'Spain' },
        { value: 'nl', label: 'Netherlands' },
        { value: 'at', label: 'Austria' },
        { value: 'be', label: 'Belgium' },
        { value: 'ch', label: 'Switzerland' }
      ];
    }
    return [];
  };

  const availableCountries = getCountriesForRegion(selectedRegion);


  return (
    <form className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <input
        type="text"
        name="q"
        placeholder="Search jobs (e.g., developer)"
        defaultValue={query || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      />
      <input
        type="text"
        name="company"
        placeholder="Company (e.g., Google)"
        defaultValue={searchCompany || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      />
      <select
        name="type"
        defaultValue={searchType || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      >
        <option value="">Contract Type</option>
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Contract">Contract</option>
        <option value="Internship">Internship</option>
      </select>
      <select
        name="workMode"
        defaultValue={searchWorkMode || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      >
        <option value="">Work Mode</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="onsite">On-site</option>
      </select>
      <select
        name="region"
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      >
        <option value="">Continent</option>
        <option value="us">North America</option>
        <option value="europe">Europe</option>
      </select>
      <select
        name="country"
        defaultValue={searchCountry || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      >
        <option value="">Country</option>
        {availableCountries.map(country => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="city"
        placeholder="City (e.g., London)"
        defaultValue={searchCity || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      />
      <select
        name="datePosted"
        defaultValue={searchDatePosted || ''}
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      >
        <option value="">Date Posted</option>
        <option value="1">Past 24 hours</option>
        <option value="7">Past week</option>
        <option value="14">Past two weeks</option>
        <option value="30">Past month</option>
      </select>
      <div className="col-span-1 md:col-span-2 lg:col-span-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Search Jobs
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>
    </form>
  );
}