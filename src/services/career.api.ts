import type { JobOpening, JobApplication, ApplicationStatus } from "../types/career";

const JOBS_STORAGE_KEY = "sunraj_admin_career_jobs";
const APPLICATIONS_STORAGE_KEY = "sunraj_admin_career_applications";

const INITIAL_JOBS: JobOpening[] = [
  {
    id: "job-1",
    title: "Senior Packaging Engineer",
    department: "Engineering",
    locationType: "On-site",
    locationName: "Kalyan, Maharashtra",
    type: "Full-time",
    experienceLevel: "5+ Years",
    description: "Lead structural packaging design for high-load corrugated boxes.",
    requirements: [
      "Degree in Packaging Technology or Mechanical Engineering",
      "Proficiency in CAD/Packaging Design software",
      "Knowledge of paper grading and burst strength testing"
    ],
    responsibilities: [
      "Develop custom packaging solutions for industrial clients",
      "Optimize board combinations for cost efficiency",
      "Conduct quality testing on production samples"
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "job-2",
    title: "Production Supervisor",
    department: "Manufacturing",
    locationType: "On-site",
    locationName: "Kalyan, Maharashtra",
    type: "Full-time",
    experienceLevel: "3-5 Years",
    description: "Oversee daily corrugation line operations and team shift scheduling.",
    requirements: [
      "Diploma/Degree in Production Engineering or equivalent",
      "Hands-on experience with automatic 5-ply plants",
      "Strong leadership and safety protocol management"
    ],
    responsibilities: [
      "Manage floor shift operators and machine output targets",
      "Ensure adherence to ISO & safety standards",
      "Minimize paper wastage during machine setups"
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Senior Packaging Engineer",
    applicantName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    experienceYears: 6,
    resumeUrl: "#",
    coverLetter: "I have 6 years of experience in corrugated box manufacturing and structural design.",
    status: "Pending",
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Helper initialization
const initializeStorage = () => {
  if (!localStorage.getItem(JOBS_STORAGE_KEY)) {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
  }
  if (!localStorage.getItem(APPLICATIONS_STORAGE_KEY)) {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
  }
};

initializeStorage();

/* JOBS CRUD */
export function getJobOpenings(): JobOpening[] {
  try {
    const data = localStorage.getItem(JOBS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_JOBS;
  } catch {
    return INITIAL_JOBS;
  }
}

export function saveJobOpening(jobData: Omit<JobOpening, "id" | "createdAt" | "updatedAt"> & { id?: string }): JobOpening {
  const jobs = getJobOpenings();
  const now = new Date().toISOString();

  if (jobData.id) {
    const index = jobs.findIndex((j) => j.id === jobData.id);
    if (index !== -1) {
      const updated: JobOpening = {
        ...jobs[index],
        ...jobData,
        updatedAt: now,
      };
      jobs[index] = updated;
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      return updated;
    }
  }

  const newJob: JobOpening = {
    ...jobData,
    id: `job-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  jobs.unshift(newJob);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  return newJob;
}

export function deleteJobOpening(id: string): void {
  const jobs = getJobOpenings().filter((j) => j.id !== id);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

export function toggleJobStatus(id: string): JobOpening | null {
  const jobs = getJobOpenings();
  const index = jobs.findIndex((j) => j.id === id);
  if (index !== -1) {
    jobs[index].enabled = !jobs[index].enabled;
    jobs[index].updatedAt = new Date().toISOString();
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    return jobs[index];
  }
  return null;
}

/* APPLICATIONS API */
export function getJobApplications(): JobApplication[] {
  try {
    const data = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_APPLICATIONS;
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function updateApplicationStatus(id: string, status: ApplicationStatus): void {
  const apps = getJobApplications();
  const index = apps.findIndex((a) => a.id === id);
  if (index !== -1) {
    apps[index].status = status;
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
  }
}

export function deleteJobApplication(id: string): void {
  const apps = getJobApplications().filter((a) => a.id !== id);
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
}