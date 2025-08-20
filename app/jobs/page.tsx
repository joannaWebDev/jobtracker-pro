import { searchJobs } from "@/lib/jobService";
import { Job } from "@/lib/types";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScrollToTop from "@/components/ScrollToTop";
import PerPageSelector from "@/components/PerPageSelector";
import JobSearchForm from "@/components/JobSearchForm";
import JobList from "@/components/JobList";
import JobPagination from "@/components/JobPagination";
import JobsPageClient from "@/components/JobsPageClient";

// Check if there's a geographical mismatch based on job location formats
function checkGeographicalMismatch(jobs: Job[], searchCity?: string, searchRegion?: string, searchCountry?: string): boolean {
  if (!searchCity || jobs.length === 0 || (!searchCountry && !searchRegion)) return false;
  
  let matchingRegionJobs = 0;
  let nonMatchingRegionJobs = 0;
  
  
  let jobsWithCityMentioned = 0;
  
  jobs.forEach((job, index) => {
    const jobLocation = job.location.toLowerCase();
    const jobText = (job.location + ' ' + job.company + ' ' + job.description).toLowerCase();
    
    // Check if this job is actually relevant to our city search
    const cityMentioned = jobText.includes(searchCity.toLowerCase());
    if (cityMentioned) jobsWithCityMentioned++;
    
    
    // Simple analysis: Check if we're getting jobs from unexpected regions
    if (searchRegion === 'us') {
      // Searching US but getting European jobs
      const hasEuropeanIndicators = jobText.match(/\b(london|paris|madrid|berlin|rome|amsterdam|barcelona|milan|vienna|prague|budapest|stockholm|copenhagen|oslo|helsinki|dublin|uk|england|france|spain|germany|italy|netherlands|belgium|austria|switzerland|portugal|europe|european|ltd|gmbh|sa|bv|ag)\b/);
      if (hasEuropeanIndicators) {
        nonMatchingRegionJobs++;
      } else {
        matchingRegionJobs++;
      }
    } else if (searchRegion === 'europe') {
      // Searching Europe but getting US jobs  
      const hasUSIndicators = jobText.match(/\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|boston|seattle|denver|miami|atlanta|washington dc|usa|united states|america|california|texas|florida|illinois|new york|ny|ca|tx|fl|il|ma|wa|llc|inc\.?|corp\.?)\b/) || jobLocation.includes(',');
      if (hasUSIndicators) {
        nonMatchingRegionJobs++;
      } else {
        matchingRegionJobs++;
      }
    } else {
      matchingRegionJobs++;
    }
  });
  
  // Calculate city mention percentage
  const cityMentionPercentage = (jobsWithCityMentioned / jobs.length) * 100;
  
  const total = matchingRegionJobs + nonMatchingRegionJobs;
  const mismatchPercentage = total > 0 ? (nonMatchingRegionJobs / total) * 100 : 0;
  
  
  // Show mismatch if:
  // 1. High mismatch percentage (>30%), OR  
  // 2. Very low city mention percentage (<10%) indicating city filter is being ignored
  return mismatchPercentage > 30 || cityMentionPercentage < 10;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, company, type, workMode, region, country, city, datePosted, page, perPage } = await searchParams;

  const query = q as string | undefined;
  const searchCompany = company as string | undefined;
  const searchType = type as string | undefined;
  const searchWorkMode = workMode as string | undefined;
  const searchRegion = (region as string | undefined) || 'europe'; // Default to Europe
  const searchCountry = country as string | undefined;
  const searchCity = city as string | undefined;
  const searchDatePosted = datePosted as string | undefined;
  const currentPage = parseInt((page as string) || '1', 10);
  const jobsPerPage = parseInt((perPage as string) || '25', 10);

  const JOBS_PER_PAGE = [10, 25, 50, 100].includes(jobsPerPage) ? jobsPerPage : 25;

  const result = await searchJobs({
    query,
    searchCompany,
    searchType,
    searchWorkMode,
    searchRegion,
    searchCountry,
    searchCity,
    searchDatePosted,
    currentPage,
    jobsPerPage: JOBS_PER_PAGE,
  });

  // Get user's applied jobs with status if logged in
  const session = await auth();
  let applicationStatuses = new Map<string, { status: string; appliedAt: Date }>();
  
  if (session?.user?.email) {
    // Find user by email (consistent with our API)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      const applications = await prisma.application.findMany({
        where: { userId: user.id },
        select: { externalJobId: true, status: true, appliedAt: true }
      });
      
      applicationStatuses = new Map(
        applications.map(app => [
          app.externalJobId, 
          { status: app.status, appliedAt: app.appliedAt }
        ]).filter(([id]) => id) as [string, { status: string; appliedAt: Date }][]
      );
    }
  }

  return (
    <JobsPageClient>
      <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Search Jobs</h1>
          <div className="text-sm text-gray-500">
            {result.totalJobs.toLocaleString()} total jobs
            {(() => {
              // Show corrected region if auto-correction was applied
              if (result.correctionApplied) {
                const originalRegionName = result.correctionApplied.originalRegion === 'us' ? 'North America' : 'Europe';
                const correctedRegionName = result.correctionApplied.correctedRegion === 'us' ? 'North America' : 'Europe';
                
                return (
                  <> from <span className="line-through text-gray-400">{originalRegionName}</span> {correctedRegionName}</>
                );
              }
              
              // Check if there's a geographical mismatch for visual indication (when no auto-correction)
              const hasMismatch = checkGeographicalMismatch(result.jobs, searchCity, searchRegion, searchCountry);
              
              if (searchCountry) {
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
                const countryName = countryNames[searchCountry as keyof typeof countryNames] || searchCountry;
                return hasMismatch 
                  ? <> from <span className="line-through text-gray-400">{countryName}</span> <span className="text-amber-600">(location mismatch)</span></>
                  : ` from ${countryName}`;
              }
              if (searchRegion === 'us') {
                return hasMismatch 
                  ? <> from <span className="line-through text-gray-400">North America</span> <span className="text-amber-600">(location mismatch)</span></>
                  : ' from North America';
              }
              if (searchRegion === 'europe') {
                return hasMismatch 
                  ? <> from <span className="line-through text-gray-400">Europe</span> <span className="text-amber-600">(location mismatch)</span></>
                  : ' from Europe';
              }
              return '';
            })()}
            {searchCity ? ` in ${searchCity}` : ''}
            <br />
            <span className="text-xs">
              Showing {result.jobs.length} jobs on page {currentPage}
            </span>
            {result.apiError && (
              <div className="text-red-500 text-xs mt-1">
                External jobs unavailable: {result.apiError}
              </div>
            )}
          </div>
        </div>

        {result.correctionApplied && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-lg">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Search auto-corrected:</strong> {result.correctionApplied.city} is located in{' '}
                  {result.correctionApplied.correctedRegion === 'us' ? 'North America' : 'Europe'}, not{' '}
                  {result.correctionApplied.originalRegion === 'us' ? 'North America' : 'Europe'}.{' '}
                  Showing {result.correctionApplied.city} jobs from the correct region.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <PerPageSelector currentPerPage={JOBS_PER_PAGE} />
        </div>

        <JobSearchForm
          query={query}
          searchCompany={searchCompany}
          searchType={searchType}
          searchWorkMode={searchWorkMode}
          searchRegion={result.correctionApplied?.correctedRegion || searchRegion}
          searchCountry={result.correctionApplied?.correctedCountry || searchCountry}
          searchCity={searchCity}
          searchDatePosted={searchDatePosted}
        />
      </div>

      <JobList 
        jobs={result.jobs} 
        searchWorkMode={searchWorkMode} 
        applicationStatuses={applicationStatuses}
        searchRegion={searchRegion}
        searchCountry={searchCountry}
        searchCity={searchCity}
        query={query}
        correctionApplied={!!result.correctionApplied}
      />

      <JobPagination
        currentPage={currentPage}
        totalPages={result.totalPages}
        totalJobs={result.totalJobs}
        jobsPerPage={JOBS_PER_PAGE}
        query={query}
        searchCompany={searchCompany}
        searchType={searchType}
        searchWorkMode={searchWorkMode}
        searchRegion={searchRegion}
        searchCountry={searchCountry}
        searchCity={searchCity}
        searchDatePosted={searchDatePosted}
      />

      <ScrollToTop />
      </div>
    </JobsPageClient>
  );
}
