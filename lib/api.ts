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
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const studentApi = {
  getProfile: async () => {
    return fetchApi<Student>("/profile");
  },

  updateProfile: async (data: Partial<Student>) => {
    return fetchApi<Student>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<Student>(`/public/students/${id}`);
  },

  getAll: async () => {
    return fetchApi<Student[]>("/public/students");
  },
};

// ==================== PROFESSORS ====================

export interface Professor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const professorApi = {
  getProfile: async () => {
    return fetchApi<Professor>("/profile");
  },

  updateProfile: async (data: Partial<Professor>) => {
    return fetchApi<Professor>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<Professor>(`/public/professors/${id}`);
  },

  getAll: async () => {
    return fetchApi<Professor[]>("/public/professors");
  },
};

// ==================== ORGANIZATIONS ====================

export interface Organization {
  id: string;
  name: string;
  email: string;
  contact?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

export const organizationApi = {
  getProfile: async () => {
    return fetchApi<Organization>("/profile");
  },

  updateProfile: async (data: Partial<Organization>) => {
    return fetchApi<Organization>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<Organization>(`/public/organizations/${id}`);
  },

  getAll: async () => {
    return fetchApi<Organization[]>("/public/organizations");
  },
};

// ==================== OPPORTUNITIES ====================

export interface Opportunity {
  id: string;
  name: string;
  details?: string;
  requirements?: string;
  reward?: string;
  type: string;
  link?: string;
  sign_up_link?: string;
  professor_id?: string;
  professor?: Professor;
  student_id?: string;
  student?: Student;
  requirement_tags?: Tag[];
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

  create: async (data: { name: string; details?: string; requirements?: string; reward?: string; type: string; tag_ids?: number[] }) => {
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
    return fetchApi<Opportunity[]>("/opportunities/me");
  },
};

// ==================== APPLICATIONS ====================

export interface Application {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  resume_link?: string;
  student?: Student;
  opportunity?: Opportunity;
  created_at: string;
  updated_at: string;
}

export const applicationApi = {
  apply: async (opportunityId: string, data: { cover_letter?: string; message?: string; resume_link?: string }) => {
    return fetchApi<Application>(`/applications`, {
      method: "POST",
      body: JSON.stringify({ opportunity_id: opportunityId, ...data }),
    });
  },

  getMyApplications: async () => {
    const res = await fetchApi<any>("/applications/me");
    // Return the raw shaped response so callers can render Submitted vs Received
    if (Array.isArray(res)) {
      // Legacy backend: return as submitted with empty received
      return { submitted: res as Application[], received: [] };
    }
    return {
      submitted: Array.isArray(res.submitted) ? (res.submitted as Application[]) : [],
      received: Array.isArray(res.received) ? (res.received as Application[]) : [],
    } as { submitted: Application[]; received: Application[] };
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
  date?: string;
  link?: string;
  sign_up_link?: string;
  organization_id?: string;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}

export const eventApi = {
  getAll: async () => {
    return fetchApi<Event[]>("/public/events");
  },

  getById: async (id: string) => {
    return fetchApi<Event>(`/public/events/${id}`);
  },

  create: async (data: { title: string; description?: string; date?: string; link?: string; sign_up_link?: string }) => {
    return fetchApi<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { title?: string; description?: string; date?: string; link?: string; sign_up_link?: string }) => {
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

  getMyEvents: async () => {
    return fetchApi<Event[]>("/events/me");
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
  recipient_id: string;
  drive_link: string;
  student?: Student;
  recipient?: Professor;
  created_at: string;
  updated_at: string;
}

export const reportApi = {
  getMyReports: async () => {
    return fetchApi<WeeklyReport[]>("/reports/me");
  },

  getReportsForStudent: async (studentId: string) => {
    return fetchApi<WeeklyReport[]>(`/reports/student/${studentId}`);
  },

  create: async (data: { recipient_id: string; drive_link: string }) => {
    return fetchApi<WeeklyReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/reports/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== COINS ====================

export interface Coins {
  id: string;
  student_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export const coinApi = {
  getMyCoins: async () => {
    return fetchApi<Coins>("/coins/me");
  },

  increment: async (amount: number) => {
    return fetchApi<Coins>("/coins/increment", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },
};

// ==================== TAGS ====================

export interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const tagApi = {
  getAll: async () => {
    return fetchApi<Tag[]>("/public/tags");
  },

  create: async (data: { name: string; description?: string }) => {
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
