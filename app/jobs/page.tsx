import { searchJobs } from "@/lib/jobService";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScrollToTop from "@/components/ScrollToTop";
import PerPageSelector from "@/components/PerPageSelector";
import JobSearchForm from "@/components/JobSearchForm";
import JobList from "@/components/JobList";
import JobPagination from "@/components/JobPagination";
import JobsPageClient from "@/components/JobsPageClient";

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
  const searchRegion = region as string | undefined;
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
            {searchRegion === 'us' ? ' from US' : ' from Europe'}
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

        <div className="flex justify-between items-center mb-4">
          <PerPageSelector currentPerPage={JOBS_PER_PAGE} />
        </div>

        <JobSearchForm
          query={query}
          searchCompany={searchCompany}
          searchType={searchType}
          searchWorkMode={searchWorkMode}
          searchRegion={searchRegion}
          searchCountry={searchCountry}
          searchCity={searchCity}
          searchDatePosted={searchDatePosted}
        />
      </div>

      <JobList jobs={result.jobs} searchWorkMode={searchWorkMode} applicationStatuses={applicationStatuses} />

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
