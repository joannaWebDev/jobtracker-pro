// Database job type (from Prisma)
export interface LocalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  salary: string | null;
  source: string;
  externalUrl: string | null;
  externalId: string | null;
  postedAt: Date;
  postedById: string | null;
  postedBy: {
    name: string | null;
  } | null;
}

// External job type (from API, transformed)
export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  salary: string | null;
  postedAt: Date;
  source: 'adzuna';
  externalUrl: string;
  postedBy: {
    name: string;
  };
}

// Union type for all jobs displayed in the UI
export type Job = LocalJob | ExternalJob;

// Search parameters interface
export interface JobSearchParams {
  query?: string;
  location?: string;
  type?: string;
}