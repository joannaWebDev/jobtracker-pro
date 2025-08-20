export interface Job {
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
