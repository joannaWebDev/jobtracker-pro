import { Job } from "@/lib/types";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: Job[];
  searchWorkMode?: string;
  applicationStatuses?: Map<string, { status: string; appliedAt: Date }>;
}

export default function JobList({ jobs, searchWorkMode, applicationStatuses }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No jobs found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
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
  );
}