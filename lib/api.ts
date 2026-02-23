/**
 * API service for communicating with Next.js API routes
 * This replaces the old external API calls to the Go backend
 */

// Base fetch wrapper with authentication
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  const url = `${baseUrl}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

// ==================== AUTH ====================

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  login: async (email: string, password: string, role: string) => {
    return fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  },

  signup: async (data: {
    email: string;
    password: string;
    role: string;
    name?: string;
    student_id?: string;
  }) => {
    return fetchApi<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  sendVerificationCode: async (email: string) => {
    return fetchApi<{ message: string }>("/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyCode: async (email: string, code: string) => {
    return fetchApi<{ valid: boolean }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },
};

// ==================== STUDENTS ====================

export interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  gpa?: number;
  major?: string;
  skills?: string[];
  bio?: string;
  avatar_url?: string;
  cv_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  total_coins: number;
  created_at: string;
  updated_at: string;
}

export const studentApi = {
  getProfile: async () => {
    return fetchApi<Student>("/students/profile");
  },

  updateProfile: async (data: Partial<Student>) => {
    return fetchApi<Student>("/students/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<Student>(`/students/${id}`);
  },

  getAll: async () => {
    return fetchApi<Student[]>("/students");
  },
};

// ==================== PROFESSORS ====================

export interface Professor {
  id: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  research_areas?: string[];
  office_location?: string;
  office_hours?: string;
  created_at: string;
  updated_at: string;
}

export const professorApi = {
  getProfile: async () => {
    return fetchApi<Professor>("/professors/profile");
  },

  updateProfile: async (data: Partial<Professor>) => {
    return fetchApi<Professor>("/professors/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<Professor>(`/professors/${id}`);
  },

  getAll: async () => {
    return fetchApi<Professor[]>("/professors");
  },
};

// ==================== ORGANIZATIONS ====================

export interface Organization {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  location?: string;
  size?: string;
  founded_year?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export const organizationApi = {
  getProfile: async () => {
    return fetchApi<Organization>("/organizations/profile");
  },

  updateProfile: async (data: Partial<Organization>) => {
    return fetchApi<Organization>("/organizations/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<Organization>(`/organizations/${id}`);
  },

  getAll: async () => {
    return fetchApi<Organization[]>("/organizations");
  },
};

// ==================== OPPORTUNITIES ====================

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: "research" | "project" | "internship";
  requirements?: string;
  skills_needed?: string[];
  location?: string;
  is_remote?: boolean;
  compensation?: string;
  duration?: string;
  deadline?: string;
  max_applicants?: number;
  status: "open" | "closed" | "archived";
  professor_id?: string;
  organization_id?: string;
  professor?: Professor;
  organization?: Organization;
  tags?: Tag[];
  drive_link?: string;
  created_at: string;
  updated_at: string;
}

export const opportunityApi = {
  getAll: async (filters?: {
    type?: string;
    status?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetchApi<Opportunity[]>(`/opportunities${query}`);
  },

  getById: async (id: string) => {
    return fetchApi<Opportunity>(`/opportunities/${id}`);
  },

  create: async (data: Partial<Opportunity>) => {
    return fetchApi<Opportunity>("/opportunities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Opportunity>) => {
    return fetchApi<Opportunity>(`/opportunities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/opportunities/${id}`, {
      method: "DELETE",
    });
  },

  getMyOpportunities: async () => {
    return fetchApi<Opportunity[]>("/opportunities/mine");
  },
};

// ==================== APPLICATIONS ====================

export interface Application {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: "pending" | "accepted" | "rejected";
  cover_letter?: string;
  resume_url?: string;
  student?: Student;
  opportunity?: Opportunity;
  created_at: string;
  updated_at: string;
}

export const applicationApi = {
  apply: async (opportunityId: string, data: { cover_letter?: string }) => {
    return fetchApi<Application>(`/opportunities/${opportunityId}/apply`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyApplications: async () => {
    return fetchApi<Application[]>("/applications/mine");
  },

  getForOpportunity: async (opportunityId: string) => {
    return fetchApi<Application[]>(`/opportunities/${opportunityId}/applications`);
  },

  updateStatus: async (id: string, status: "accepted" | "rejected") => {
    return fetchApi<Application>(`/applications/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== EVENTS ====================

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location?: string;
  is_virtual?: boolean;
  meeting_url?: string;
  start_time: string;
  end_time: string;
  max_attendees?: number;
  registration_deadline?: string;
  professor_id?: string;
  organization_id?: string;
  professor?: Professor;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}

export const eventApi = {
  getAll: async () => {
    return fetchApi<Event[]>("/events");
  },

  getById: async (id: string) => {
    return fetchApi<Event>(`/events/${id}`);
  },

  create: async (data: Partial<Event>) => {
    return fetchApi<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Event>) => {
    return fetchApi<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/events/${id}`, {
      method: "DELETE",
    });
  },

  register: async (eventId: string) => {
    return fetchApi<{ message: string }>(`/events/${eventId}/register`, {
      method: "POST",
    });
  },

  getMyEvents: async () => {
    return fetchApi<Event[]>("/events/mine");
  },
};

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export const notificationApi = {
  getAll: async () => {
    return fetchApi<Notification[]>("/notifications/me");
  },

  markAsRead: async (id: string) => {
    return fetchApi<Notification>(`/notifications/${id}/read`, {
      method: "PUT",
    });
  },

  markAllAsRead: async () => {
    return fetchApi<{ message: string }>("/notifications/read-all", {
      method: "PUT",
    });
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== REPORTS ====================

export interface WeeklyReport {
  id: string;
  student_id: string;
  opportunity_id: string;
  week_number: number;
  year: number;
  hours_worked: number;
  tasks_completed?: string;
  challenges?: string;
  next_week_goals?: string;
  supervisor_feedback?: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  student?: Student;
  opportunity?: Opportunity;
  created_at: string;
  updated_at: string;
}

export const reportApi = {
  getMyReports: async () => {
    return fetchApi<WeeklyReport[]>("/reports/mine");
  },

  getForOpportunity: async (opportunityId: string) => {
    return fetchApi<WeeklyReport[]>(`/opportunities/${opportunityId}/reports`);
  },

  create: async (data: Partial<WeeklyReport>) => {
    return fetchApi<WeeklyReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<WeeklyReport>) => {
    return fetchApi<WeeklyReport>(`/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  submit: async (id: string) => {
    return fetchApi<WeeklyReport>(`/reports/${id}/submit`, {
      method: "PUT",
    });
  },

  review: async (
    id: string,
    data: { status: "approved" | "rejected"; feedback?: string }
  ) => {
    return fetchApi<WeeklyReport>(`/reports/${id}/review`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ==================== COINS ====================

export interface CoinTransaction {
  id: string;
  student_id: string;
  amount: number;
  type: "earn" | "spend";
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export const coinApi = {
  getBalance: async () => {
    return fetchApi<{ balance: number }>("/coins/balance");
  },

  getTransactions: async () => {
    return fetchApi<CoinTransaction[]>("/coins/transactions");
  },

  award: async (studentId: string, amount: number, description: string) => {
    return fetchApi<CoinTransaction>("/coins/award", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, amount, description }),
    });
  },
};

// ==================== TAGS ====================

export interface Tag {
  id: string;
  name: string;
  category?: string;
  created_at: string;
}

export const tagApi = {
  getAll: async () => {
    return fetchApi<Tag[]>("/tags");
  },

  create: async (data: { name: string; category?: string }) => {
    return fetchApi<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ==================== PUBLIC ====================

export const publicApi = {
  getStats: async () => {
    return fetchApi<{
      total_students: number;
      total_professors: number;
      total_organizations: number;
      total_opportunities: number;
      active_opportunities: number;
    }>("/public/stats");
  },

  getOpportunities: async () => {
    return fetchApi<Opportunity[]>("/public/opportunities");
  },
};
