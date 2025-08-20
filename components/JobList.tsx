import { Job } from "@/lib/types";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: Job[];
  searchWorkMode?: string;
  applicationStatuses?: Map<string, { status: string; appliedAt: Date }>;
  searchRegion?: string;
  searchCountry?: string;
  searchCity?: string;
  query?: string;
  correctionApplied?: boolean;
}

export default function JobList({ jobs, searchWorkMode, applicationStatuses, searchRegion, searchCountry, searchCity, correctionApplied }: JobListProps) {
  // Analyze job results to detect region mismatches
  const getCityMismatchWarning = () => {
    // Don't show warning if search was auto-corrected
    if (correctionApplied) return null;
    if (!searchCity || jobs.length === 0 || (!searchCountry && !searchRegion)) return null;
    
    // Analyze job locations and company names from actual results
    const locationAnalysis = analyzeJobLocations(jobs);
    
    // Handle region-level mismatches based on job analysis
    if (!searchCountry && searchRegion && locationAnalysis.nonMatchingRegion > 0) {
      const total = locationAnalysis.matchingRegion + locationAnalysis.nonMatchingRegion;
      const mismatchPercentage = Math.round((locationAnalysis.nonMatchingRegion / total) * 100);
      
      if (mismatchPercentage > 30) { // Only show warning if significant mismatch
        const oppositeRegion = searchRegion === 'europe' ? 'North America' : 'Europe';
        return `"${searchCity}" appears to be located in ${oppositeRegion} based on job location formats. Showing results anyway - these may be remote positions or international companies.`;
      }
    }
    
    // Handle country-level mismatches
    if (searchCountry && locationAnalysis.nonMatchingRegion > 0) {
      const total = locationAnalysis.matchingRegion + locationAnalysis.nonMatchingRegion;
      const mismatchPercentage = Math.round((locationAnalysis.nonMatchingRegion / total) * 100);
      
      if (mismatchPercentage > 30) {
        const expectedCountry = getCountryFromCode(searchCountry);
        return `"${searchCity}" doesn't appear to match ${expectedCountry} based on job location formats. Showing results anyway.`;
      }
    }
    
    return null;
  };
  
  // Analyze job results to detect if they match the expected region
  const analyzeJobLocations = (jobs: Job[]) => {
    // Count jobs that likely come from the regions we're searching vs other regions
    let matchingRegionJobs = 0;
    let nonMatchingRegionJobs = 0;
    
    jobs.forEach(job => {
      // Check if job source matches expected countries
      if (job.source === 'adzuna') {
        // Since we know which countries we searched, we can infer region mismatch
        // If we searched Europe but get jobs that seem to be from other regions based on content
        const jobText = (job.location + ' ' + job.company + ' ' + job.description).toLowerCase();
        
        // Simple heuristic: if searching Europe but job mentions the searched city + typical non-European patterns
        // or if searching US but job mentions European patterns with the searched city
        const cityInText = jobText.includes(searchCity?.toLowerCase() || '');
        
        if (cityInText) {
          // This job explicitly mentions our searched city
          // Check if job location/company suggests different region than what we're searching
          const jobLocation = job.location.toLowerCase();
          
          // If we're searching Europe but job location suggests US format (City, State)
          if (searchRegion === 'europe' && jobLocation.includes(',') && jobLocation.length < 50) {
            nonMatchingRegionJobs++;
          }
          // If we're searching US but job location suggests European format
          else if (searchRegion === 'us' && !jobLocation.includes(',') && jobLocation.includes(searchCity?.toLowerCase() || '')) {
            nonMatchingRegionJobs++;
          }
          else {
            matchingRegionJobs++;
          }
        } else {
          matchingRegionJobs++; // Default to matching if no clear indicators
        }
      }
    });
    
    return { 
      matchingRegion: matchingRegionJobs,
      nonMatchingRegion: nonMatchingRegionJobs 
    };
  };
  
  
  // Convert country code to readable name
  const getCountryFromCode = (code: string) => {
    const countryNames: { [key: string]: string } = {
      'us': 'United States',
      'gb': 'United Kingdom', 
      'de': 'Germany',
      'fr': 'France',
      'it': 'Italy',
      'es': 'Spain',
      'nl': 'Netherlands',
      'at': 'Austria',
      'be': 'Belgium',
      'ch': 'Switzerland'
    };
    return countryNames[code] || code;
  };

  const mismatchWarning = getCityMismatchWarning();
  
  if (jobs.length === 0) {
    // Check if no region/country is selected
    if (!searchRegion && !searchCountry) {
      return (
        <div className="text-center py-8 text-gray-500">
          Please select a country or a city to start searching for jobs
        </div>
      );
    }
    
    // Smart suggestions based on search parameters
    const getSmartSuggestion = () => {
      const countryNames = {
        'us': 'United States',
        'gb': 'United Kingdom', 
        'de': 'Germany',
        'fr': 'France',
        'it': 'Italy',
        'es': 'Spain',
        'nl': 'Netherlands',
        'at': 'Austria',
        'be': 'Belgium',
        'ch': 'Switzerland'
      };
      
      const selectedCountryName = searchCountry ? countryNames[searchCountry as keyof typeof countryNames] : '';
      
      // Check for common city/country mismatches
      if (searchCity && (searchCountry || searchRegion)) {
        const city = searchCity.toLowerCase();
        const suggestions = [];
        
        // Known cities and their countries
        if (city === 'paris' && searchCountry !== 'fr') {
          suggestions.push('Try searching in France for Paris');
        }
        if (city === 'london' && searchCountry !== 'gb') {
          suggestions.push('Try searching in United Kingdom for London');  
        }
        if (city === 'berlin' && searchCountry !== 'de') {
          suggestions.push('Try searching in Germany for Berlin');
        }
        if (city === 'madrid' && searchCountry !== 'es') {
          suggestions.push('Try searching in Spain for Madrid');
        }
        if (city === 'rome' && searchCountry !== 'it') {
          suggestions.push('Try searching in Italy for Rome');
        }
        if (city === 'amsterdam' && searchCountry !== 'nl') {
          suggestions.push('Try searching in Netherlands for Amsterdam');
        }
        if (city === 'vienna' && searchCountry !== 'at') {
          suggestions.push('Try searching in Austria for Vienna');
        }
        if (city === 'zurich' && searchCountry !== 'ch') {
          suggestions.push('Try searching in Switzerland for Zurich');
        }
        
        // Handle region-level mismatches (when no specific country selected)
        if (!searchCountry && searchRegion) {
          if (city === 'new york' && searchRegion !== 'us') {
            suggestions.push('Try searching in North America for New York');
          }
          if (city === 'chicago' && searchRegion !== 'us') {
            suggestions.push('Try searching in North America for Chicago');
          }
          if (city === 'los angeles' && searchRegion !== 'us') {
            suggestions.push('Try searching in North America for Los Angeles');
          }
        }
        
        if (suggestions.length > 0) {
          const locationContext = selectedCountryName || (searchRegion === 'us' ? 'North America' : 'Europe');
          return (
            <div>
              <p>No results found for &quot;{searchCity}&quot; in {locationContext}.</p>
              <p className="mt-2 text-indigo-600">{suggestions[0]}</p>
            </div>
          );
        }
      }
      
      return `No jobs found${searchCity ? ` for "${searchCity}"` : ''}${selectedCountryName ? ` in ${selectedCountryName}` : ''}. Try adjusting your search criteria.`;
    };
    
    return (
      <div className="text-center py-8 text-gray-500">
        {getSmartSuggestion()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mismatchWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-amber-400 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                {mismatchWarning}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-6">
        {jobs.map((job) => {
          const applicationStatus = applicationStatuses?.get(job.id);
          return (
            <JobCard 
              key={job.id} 
              job={job} 
              searchWorkMode={searchWorkMode}
              applicationStatus={applicationStatus}
            />
          );
        })}
      </div>
    </div>
  );
}
