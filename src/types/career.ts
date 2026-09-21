export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobLocation = "On-site" | "Remote" | "Hybrid";
export type ApplicationStatus = "Pending" | "Reviewed" | "Shortlisted" | "Rejected";

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  locationType: JobLocation;
  locationName: string;
  type: JobType;
  experienceLevel: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  experienceYears: number;
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
}