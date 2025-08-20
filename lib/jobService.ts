import {adzunaAPI} from "@/lib/adzuna";
import {Job} from "@/lib/types";

// Rate limiter using a simple queue system
class RateLimiter {
  private lastRequestTime = 0;
  private minInterval = 300; // 300ms between requests
  
  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter();

const SUPPORTED_COUNTRIES = {
  europe: ['gb', 'de', 'fr', 'it', 'es', 'nl', 'at', 'be', 'ch'],
  us: ['us'],
};

function getCountriesToSearch(searchRegion?: string, searchCountry?: string): string[] {
  if (searchCountry) {
    return [searchCountry];
  }
  
  if (searchRegion === 'us') {
    return [...SUPPORTED_COUNTRIES.us];
  }
  
  if (searchRegion === 'europe') {
    return [...SUPPORTED_COUNTRIES.europe];
  }
  
  return [];
}

async function getCityRegionCorrection(city: string, currentRegion?: string): Promise<{ region: string; country?: string } | null> {
  if (!city || !currentRegion) return null;

  try {
    const oppositeRegion = currentRegion === 'us' ? 'europe' : 'us';
    const oppositeCountries = getCountriesToSearch(oppositeRegion);

    // Test a representative sample of countries from the opposite region
    const countriesToTest = oppositeRegion === 'europe' 
      ? oppositeCountries.slice(0, 5) // Test major EU countries: GB, DE, FR, IT, ES
      : oppositeCountries; // Test US (only one country)
    
    for (const country of countriesToTest) {
      await rateLimiter.waitForNextRequest();
      
      const response = await adzunaAPI.searchJobs({
        location: city,
        country,
        page: 1,
        resultsPerPage: 5, // Small sample
      });
      
      if (response && response.count && response.count > 0) {
        // Found jobs in opposite region, check if they actually mention the city
        const cityMentioned = response.results?.some(job => 
          (job.location.display_name + ' ' + job.description).toLowerCase().includes(city.toLowerCase())
        );

        if (cityMentioned) {
          return {
            region: oppositeRegion,
            country: oppositeCountries.length === 1 ? country : undefined
          };
        }
      }
    }
    
  } catch (error) {
    console.error('Error in city region correction:', error);
  }
  
  return null;
}

export interface JobSearchParams {
  query?: string;
  searchCompany?: string;
  searchType?: string;
  searchWorkMode?: string;
  searchRegion?: string;
  searchCountry?: string;
  searchCity?: string;
  searchDatePosted?: string;
  currentPage: number;
  jobsPerPage: number;
}

export interface JobSearchResult {
  jobs: Job[];
  totalJobs: number;
  totalPages: number;
  apiError?: string;
  correctionApplied?: {
    originalRegion: string;
    correctedRegion: string;
    correctedCountry?: string;
    city: string;
  };
}

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const { query, searchCompany, searchType, searchWorkMode, searchRegion, searchCountry, searchCity, searchDatePosted, currentPage, jobsPerPage } = params;
  
  // Autocorrect geographical mismatches using API
  let correctedRegion = searchRegion;
  let correctedCountry = searchCountry;
  let correctionInfo: JobSearchResult['correctionApplied'] = undefined;
  
  if (searchCity && !searchCountry) {
    const cityCorrection = await getCityRegionCorrection(searchCity, searchRegion);
    if (cityCorrection) {
      correctionInfo = {
        originalRegion: searchRegion || '',
        correctedRegion: cityCorrection.region,
        correctedCountry: cityCorrection.country,
        city: searchCity,
      };
      correctedRegion = cityCorrection.region;
      correctedCountry = cityCorrection.country;
    }
  }

  const externalJobsToShow = jobsPerPage;

  const countriesToSearch = getCountriesToSearch(correctedRegion, correctedCountry);

  const externalJobs: Job[] = [];
  let apiError: string | null = null;
  let externalJobsTotal = 0;

  const requiresClientFiltering = (searchType && ['Part-time', 'Contract', 'Internship'].includes(searchType)) || searchCompany || searchDatePosted;
  
  if (!requiresClientFiltering) {
    try {
      for (const country of countriesToSearch) {
        const response = await adzunaAPI.searchJobs({
          query: query || undefined,
          location: searchCity || undefined,
          country,
          contractType: searchType || undefined,
          workMode: searchWorkMode || undefined,
          page: 1,
          resultsPerPage: 1,
        });
        if (response) {
          externalJobsTotal += response.count || 0;
        }
        if (countriesToSearch.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  try {
    if (externalJobsToShow > 0) {
      // Fetch more results than needed since client-side filtering will reduce them
      let multiplier = 1;
      if (searchWorkMode) multiplier *= 2;
      if (searchCompany) multiplier *= 2;
      if (searchDatePosted) multiplier *= 2;
      if (searchType && ['Part-time', 'Contract', 'Internship'].includes(searchType)) multiplier *= 2;
      const jobsToFetch = Math.min(jobsPerPage * Math.max(multiplier, 2), 50); // API max is 50 per request
      
      for (const country of countriesToSearch) {
        try {
          if (externalJobs.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          const response = await adzunaAPI.searchJobs({
            query: query || undefined,
            location: searchCity || undefined,
            country,
            contractType: searchType || undefined,
            workMode: searchWorkMode || undefined,
            page: currentPage,
            resultsPerPage: jobsToFetch,
          });

          if (response?.results) {
            let jobs = response.results.map(job => adzunaAPI.transformJob(job, country));
            
            // Client-side filtering for unsupported contract types
            if (searchType && ['Part-time', 'Contract', 'Internship'].includes(searchType)) {
              jobs = jobs.filter(job => {
                const jobType = job.type.toLowerCase();
                const searchTypeLC = searchType.toLowerCase();
                
                return jobType.includes(searchTypeLC.replace('-', ' ')) ||
                       jobType.includes(searchTypeLC) ||
                       (searchType === 'Part-time' && (jobType.includes('part') || jobType.includes('temporary'))) ||
                       (searchType === 'Contract' && (jobType.includes('contract') || jobType.includes('freelance'))) ||
                       (searchType === 'Internship' && jobType.includes('intern'));
              });
            }
            
            // Client-side filtering for company name
            if (searchCompany) {
              jobs = jobs.filter(job => {
                const companyName = job.company.toLowerCase();
                const searchCompanyLC = searchCompany.toLowerCase();
                
                return companyName.includes(searchCompanyLC) ||
                       companyName.replace(/\s+/g, '').includes(searchCompanyLC.replace(/\s+/g, ''));
              });
            }
            
            // Client-side filtering for date posted
            if (searchDatePosted) {
              const daysAgo = parseInt(searchDatePosted);
              const cutoffDate = new Date();
              cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
              
              jobs = jobs.filter(job => {
                const postedDate = new Date(job.postedAt);
                return postedDate >= cutoffDate;
              });
            }
            
            const remainingSlots = externalJobsToShow - externalJobs.length;
            if (remainingSlots > 0) {
              externalJobs.push(...jobs.slice(0, remainingSlots));
            }
          }
        } catch (countryError) {
          console.error(`Error fetching from ${country}:`, countryError);
        }
        
        if (externalJobs.length >= externalJobsToShow) {
          break;
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch external jobs:', error);
    apiError = error instanceof Error ? error.message : 'Failed to fetch external jobs';
  }

  let allJobs = applyRegionFilter([...externalJobs]);
  
  if (searchWorkMode) {
    allJobs = applyWorkModeFilter(allJobs, searchWorkMode);
  }
  
  // Sort by posted date (newest first)
  allJobs = allJobs
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  // Calculate totals before pagination
  // When we have client-side filtering (work mode, region), use actual filtered results
  const hasClientFiltering = searchWorkMode || requiresClientFiltering;
  const totalJobs = hasClientFiltering ? allJobs.length : externalJobsTotal;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  // Apply pagination to the sorted jobs
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = allJobs.slice(startIndex, startIndex + jobsPerPage);

  return {
    jobs: paginatedJobs,
    totalJobs,
    totalPages,
    ...(apiError && { apiError }),
    ...(correctionInfo && { correctionApplied: correctionInfo }),
  };
}


function applyRegionFilter(jobs: Job[]): Job[] {
  // Region filtering is handled at API level during job fetching
  return jobs;
}

function applyWorkModeFilter(jobs: Job[], searchWorkMode: string): Job[] {
  return jobs.filter(job => {
    const text = (job.description + ' ' + job.title).toLowerCase();
    
    if (searchWorkMode === 'remote') {
      // Very lenient remote work detection - since we're already using what_exclude for on-site jobs
      // Accept any job that mentions remote work OR doesn't explicitly mention office/on-site/hybrid
      return text.includes('remote') || 
             text.includes('work from home') || 
             text.includes('wfh') ||
             text.includes('telecommute') ||
             text.includes('distributed') ||
             text.includes('from anywhere') ||
             text.includes('location independent') ||
             text.includes('flexible location') ||
             text.includes('anywhere') ||
             // If it doesn't explicitly mention office/on-site requirements, include it
             (!text.includes('office required') && !text.includes('on-site required') && !text.includes('must be based in') && !text.includes('hybrid'));
    }
    
    if (searchWorkMode === 'hybrid') {
      return text.includes('hybrid') || 
             text.includes('flexible work') ||
             text.includes('home/office') ||
             text.includes('flexible location') ||
             (text.includes('remote') && text.includes('office'));
    }
    
    if (searchWorkMode === 'onsite') {
      return text.includes('on-site') || 
             text.includes('onsite') ||
             text.includes('office-based') ||
             (text.includes('office') && (text.includes('based') || text.includes('located'))) ||
             // If no work mode indicators found, assume on-site
             (!text.includes('remote') && !text.includes('hybrid') && !text.includes('wfh'));
    }
    
    return true;
  });
}
