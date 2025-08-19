interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  jobsPerPage: number;
  query?: string;
  searchCompany?: string;
  searchType?: string;
  searchWorkMode?: string;
  searchRegion?: string;
  searchCountry?: string;
  searchCity?: string;
  searchDatePosted?: string;
}

export default function JobPagination({
  currentPage,
  totalPages,
  totalJobs,
  jobsPerPage,
  query,
  searchCompany,
  searchType,
  searchWorkMode,
  searchRegion,
  searchCountry,
  searchCity,
  searchDatePosted,
}: JobPaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({
      ...(query && { q: query }),
      ...(searchCompany && { company: searchCompany }),
      ...(searchType && { type: searchType }),
      ...(searchWorkMode && { workMode: searchWorkMode }),
      ...(searchRegion && { region: searchRegion }),
      ...(searchCountry && { country: searchCountry }),
      ...(searchCity && { city: searchCity }),
      ...(searchDatePosted && { datePosted: searchDatePosted }),
      page: page.toString(),
      perPage: jobsPerPage.toString(),
    });
    return `/jobs?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        {currentPage > 1 ? (
          <a
            href={buildUrl(currentPage - 1)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
          >
            Previous
          </a>
        ) : (
          <span className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-l-md cursor-not-allowed">
            Previous
          </span>
        )}

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
          if (pageNum > totalPages) return null;
          
          return (
            <a
              key={pageNum}
              href={buildUrl(pageNum)}
              className={`px-3 py-2 text-sm font-medium border ${
                pageNum === currentPage
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </a>
          );
        })}

        {/* Next button */}
        {currentPage < totalPages ? (
          <a
            href={buildUrl(currentPage + 1)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
          >
            Next
          </a>
        ) : (
          <span className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-r-md cursor-not-allowed">
            Next
          </span>
        )}
      </div>

      <span className="text-sm text-gray-700 ml-4">
        Page {currentPage} of {totalPages} ({totalJobs.toLocaleString()} jobs)
      </span>
    </div>
  );
}