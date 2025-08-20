import {Job} from './types';

export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  description: string;
  category: {
    label: string;
  };
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created: string;
  redirect_url: string;
}

export interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export interface AdzunaSearchParams {
  query?: string;
  location?: string;
  category?: string;
  page?: number;
  resultsPerPage?: number;
  country?: string;
  contractType?: string;
  workMode?: string;
}

class AdzunaAPI {
  private baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  private appId = process.env.ADZUNA_APP_ID;
  private appKey = process.env.ADZUNA_APP_KEY;

  constructor() {
    if (!this.appId || !this.appKey) {
      console.warn('Adzuna API credentials not found. External job fetching will be disabled.');
    }
  }

  private buildUrlForCountry(country: string, endpoint: string, params: Record<string, string | number> = {}): string {
    const url = new URL(`${this.baseUrl}/${country}/${endpoint}`);
    
    // Add authentication
    url.searchParams.append('app_id', this.appId || '');
    url.searchParams.append('app_key', this.appKey || '');
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    return url.toString();
  }

  async searchJobs(params: AdzunaSearchParams = {}): Promise<AdzunaResponse | null> {
    if (!this.appId || !this.appKey) {
      return null;
    }
/*
The Adzuna API doesn't have dedicated remote work fields,
so we're using their location (where) and keyword (what) parameters to
filter for remote jobs, which should give much better results than text parsing alone
*/
    try {
      const searchParams: Record<string, string | number> = {};
      
      // Handle work mode by modifying search terms
      if (params.workMode === 'remote') {
        if (params.query) {
          // Try searching for the job title/query and let our client-side filtering handle the remote aspect
          searchParams.what = params.query;
          // Add remote-related keywords to improve matching
          searchParams.what_exclude = 'on-site,office-based';
        } else {
          searchParams.what = 'remote';
        }
        // Don't set where for remote jobs - let them be from any location
      } else {
        if (params.query) {
          searchParams.what = params.query;
        }
        if (params.location) {
          searchParams.where = params.location;
        }
      }
      
      if (params.category) {
        searchParams.category = params.category;
      }
      
      // Contract type filtering (Note: Adzuna only supports full_time and permanent filters)
      if (params.contractType) {
        switch (params.contractType.toLowerCase()) {
          case 'full-time':
          case 'full time':
            searchParams.full_time = 1;
            break;
          case 'permanent':
            searchParams.permanent = 1;
            break;
          // Note: part-time and contract filtering not directly supported by Adzuna API
          // We'll filter these client-side after fetching results
        }
      }
      
      // Pagination
      const page = params.page || 1;
      searchParams.results_per_page = Math.min(params.resultsPerPage || 20, 50); // Adzuna max is 50
      
      // Country is required
      if (!params.country) {
        console.error('Country parameter is required');
        return null;
      }
      const url = this.buildUrlForCountry(params.country, `search/${page}`, searchParams);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'JobPostingApp/1.0',
        },
        // Cache for 5 minutes to avoid hitting rate limits
        next: { revalidate: 300 }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Adzuna API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: url.replace(this.appKey!, '[REDACTED]'),
          body: errorText
        });
        return null;
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error fetching jobs from Adzuna:', error);
      return null;
    }
  }

  transformJob(adzunaJob: AdzunaJob, country?: string): Job {
    const getCurrency = (countryCode?: string): string => {
      switch (countryCode) {
        case 'gb': return '£';
        case 'de':
        case 'fr':
        case 'it':
        case 'es':
        case 'nl':
        case 'at':
        case 'be': return '€';
        case 'ch': return 'CHF ';
        case 'au':
        case 'ca': return 'CAD $';
        case 'nz': return 'NZD $';
        case 'in': return '₹';
        case 'sg': return 'SGD $';
        case 'za': return 'R';
        case 'br': return 'R$';
        case 'mx': return 'MX$';
        case 'pl': return 'zł';
        case 'us':
        default: return '$';
      }
    };

    const currency = getCurrency(country);
    const salary = adzunaJob.salary_min && adzunaJob.salary_max 
      ? `${currency}${adzunaJob.salary_min.toLocaleString()} - ${currency}${adzunaJob.salary_max.toLocaleString()}`
      : adzunaJob.salary_min 
      ? `${currency}${adzunaJob.salary_min.toLocaleString()}+`
      : null;

    return {
      id: `adzuna_${adzunaJob.id}`,
      title: adzunaJob.title,
      company: adzunaJob.company.display_name,
      location: adzunaJob.location.display_name,
      type: adzunaJob.contract_type || 'Full-time',
      description: adzunaJob.description.substring(0, 500) + (adzunaJob.description.length > 500 ? '...' : ''),
      salary,
      postedAt: new Date(adzunaJob.created),
      source: 'adzuna' as const,
      externalUrl: adzunaJob.redirect_url,
      postedBy: {
        name: adzunaJob.company.display_name,
      },
    };
  }
}

export const adzunaAPI = new AdzunaAPI();
