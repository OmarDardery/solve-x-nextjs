/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiService {
  constructor() {
    this.baseURL = API_URL
  }

  /**
   * Get stored JWT token
   */
  getToken() {
    return localStorage.getItem('jwt_token')
  }

  /**
   * Store JWT token
   */
  setToken(token) {
    localStorage.setItem('jwt_token', token)
  }

  /**
   * Remove JWT token
   */
  removeToken() {
    localStorage.removeItem('jwt_token')
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    // Add authorization header if token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      // Get response text first to debug
      const text = await response.text()
      
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', text)
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Send verification code to email
   */
  async sendVerificationCode(email, role = '') {
    return this.post('/auth/send-code', { email, role })
  }

  /**
   * Sign up with verification code
   */
  async signup(role, data) {
    return this.post(`/auth/sign-up/${role}`, data)
  }

  /**
   * Sign in
   */
  async signin(role, email, password) {
    return this.post(`/auth/sign-in/${role}`, { email, password })
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.get('/api/profile')
  }

  // ==================== OPPORTUNITIES ENDPOINTS ====================

  /**
   * Get all opportunities (public)
   */
  async getAllOpportunities() {
    return this.get('/public/opportunities')
  }

  /**
   * Get opportunity by ID (public)
   */
  async getOpportunityById(id) {
    return this.get(`/public/opportunities/${id}`)
  }

  /**
   * Get professor's opportunities (protected)
   */
  async getMyOpportunities() {
    return this.get('/api/opportunities/me')
  }

  /**
   * Create new opportunity (professor only)
   */
  async createOpportunity(data) {
    return this.post('/api/opportunities', data)
  }

  /**
   * Update opportunity (professor only)
   */
  async updateOpportunity(id, data) {
    return this.put(`/api/opportunities/${id}`, data)
  }

  /**
   * Delete opportunity (professor only)
   */
  async deleteOpportunity(id) {
    return this.delete(`/api/opportunities/${id}`)
  }

  // ==================== APPLICATIONS ENDPOINTS ====================

  /**
   * Submit application (student only)
   * @param {number} opportunityId - The ID of the opportunity
   * @param {string} message - Optional message to the professor
   * @param {string} resumeLink - Optional link to resume
   */
  async createApplication(opportunityId, message = '', resumeLink = '') {
    return this.post('/api/applications', { 
      opportunity_id: opportunityId,
      message: message,
      resume_link: resumeLink
    })
  }

  /**
   * Get my applications
   * For students: returns their applications
   * For professors: returns applications for their opportunities
   */
  async getMyApplications() {
    return this.get('/api/applications/me')
  }

  /**
   * Update application status (professor only)
   */
  async updateApplicationStatus(applicationId, status) {
    return this.put(`/api/applications/${applicationId}/status`, { status })
  }

  /**
   * Delete application (student only)
   */
  async deleteApplication(opportunityId) {
    return this.delete('/api/applications', { opportunity_id: opportunityId })
  }

  // ==================== TAGS ENDPOINTS ====================

  /**
   * Get all tags (public)
   */
  async getAllTags() {
    return this.get('/public/tags')
  }

  /**
   * Get tag by ID (public)
   */
  async getTagById(id) {
    return this.get(`/public/tags/${id}`)
  }

  /**
   * Create new tag (professor only)
   */
  async createTag(data) {
    return this.post('/api/tags', data)
  }

  // ==================== WEEKLY REPORTS ENDPOINTS ====================

  /**
   * Submit weekly report (student only)
   */
  async createReport(data) {
    return this.post('/api/reports', data)
  }

  /**
   * Get my reports
   * For students: returns their reports
   * For professors: returns reports sent to them
   */
  async getMyReports() {
    return this.get('/api/reports/me')
  }

  /**
   * Get reports by student ID (professor only)
   */
  async getReportsByStudentId(studentId) {
    return this.get(`/api/reports/student/${studentId}`)
  }

  /**
   * Delete report (student only)
   */
  async deleteReport(reportId) {
    return this.delete(`/api/reports/${reportId}`)
  }

  // ==================== NOTIFICATIONS ENDPOINTS ====================

  /**
   * Get my notifications
   * @param {boolean} unreadOnly - If true, only returns unread notifications
   */
  async getMyNotifications(unreadOnly = false) {
    const query = unreadOnly ? '?unread_only=true' : ''
    return this.get(`/api/notifications/me${query}`)
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount() {
    return this.get('/api/notifications/me/count')
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    return this.put(`/api/notifications/${notificationId}/read`)
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead() {
    return this.put('/api/notifications/read-all')
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    return this.delete(`/api/notifications/${notificationId}`)
  }

  // ==================== COINS ENDPOINTS ====================

  /**
   * Get my coins (student only)
   */
  async getMyCoins() {
    return this.get('/api/coins/me')
  }

  /**
   * Increment coins (student only)
   */
  async incrementCoins(amount) {
    return this.post('/api/coins/increment', { amount })
  }

  // ==================== EVENTS ENDPOINTS ====================

  /**
   * Get all events (public)
   */
  async getAllEvents() {
    return this.get('/public/events')
  }

  /**
   * Get event by ID (public)
   */
  async getEventById(id) {
    return this.get(`/public/events/${id}`)
  }

  /**
   * Get organization's events (protected, organization only)
   */
  async getMyEvents() {
    return this.get('/api/events/me')
  }

  /**
   * Create new event (organization only)
   */
  async createEvent(data) {
    return this.post('/api/events', data)
  }

  /**
   * Update event (organization only)
   */
  async updateEvent(id, data) {
    return this.put(`/api/events/${id}`, data)
  }

  /**
   * Delete event (organization only)
   */
  async deleteEvent(id) {
    return this.delete(`/api/events/${id}`)
  }

  // ==================== ORGANIZATIONS ENDPOINTS ====================

  /**
   * Get organization by ID (public)
   */
  async getOrganizationById(id) {
    return this.get(`/public/organizations/${id}`)
  }

  /**
   * Get events by organization ID (public)
   */
  async getEventsByOrganizationId(id) {
    return this.get(`/public/organizations/${id}/events`)
  }
}

export const apiService = new ApiService()
export default apiService
