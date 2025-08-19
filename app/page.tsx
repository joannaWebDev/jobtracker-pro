import Link from "next/link";

export default async function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-white rounded-lg shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Dream Job
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover thousands of job opportunities with top companies
        </p>
        <Link
          href="/jobs"
          className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
        >
          Browse Jobs
        </Link>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Job Board?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-indigo-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Search
            </h3>
            <p className="text-gray-600">
              Find jobs with advanced filters including remote work, contract types, and location preferences.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-indigo-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Track Applications
            </h3>
            <p className="text-gray-600">
              Keep track of your job applications with dates and links to original postings.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-indigo-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Global Opportunities
            </h3>
            <p className="text-gray-600">
              Access jobs from multiple sources across Europe and North America.
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/jobs"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
          >
            Start Searching →
          </Link>
        </div>
      </section>
    </div>
  );
}
