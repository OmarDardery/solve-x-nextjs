import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'
import { APPLICATION_STATUS } from '../types'
import { FileText, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export function Applications() {
  const { currentUser, userRole } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchApplications()
  }, [userRole, currentUser])

  const fetchApplications = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      // GET /api/applications/me returns applications based on role
      const appsData = await apiService.getMyApplications()
      setApplications(appsData)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await apiService.updateApplicationStatus(applicationId, newStatus)
      toast.success('Application status updated')
      fetchApplications()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      [APPLICATION_STATUS.PENDING]: Clock,
      [APPLICATION_STATUS.ACCEPTED]: CheckCircle,
      [APPLICATION_STATUS.WAITLISTED]: AlertCircle,
      [APPLICATION_STATUS.REJECTED]: XCircle,
    }
    return icons[status] || FileText
  }

  const getStatusBadge = (status) => {
    const variants = {
      [APPLICATION_STATUS.PENDING]: 'default',
      [APPLICATION_STATUS.ACCEPTED]: 'success',
      [APPLICATION_STATUS.WAITLISTED]: 'warning',
      [APPLICATION_STATUS.REJECTED]: 'danger',
    }
    return variants[status] || 'default'
  }

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter)

  const canManageStatus = ['professor', 'ta', 'organization_representative'].includes(userRole)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-heading">Applications</h1>
          <p className="text-body mt-1 text-sm sm:text-base">
            {userRole === 'student' ? 'Track your applications' : 'Manage applications'}
          </p>
        </div>
        {canManageStatus && (
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value={APPLICATION_STATUS.PENDING}>Pending</option>
            <option value={APPLICATION_STATUS.ACCEPTED}>Accepted</option>
            <option value={APPLICATION_STATUS.WAITLISTED}>Waitlisted</option>
            <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 icon-muted mx-auto mb-4" />
            <p className="text-body">No applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const StatusIcon = getStatusIcon(application.status)
            return (
              <Card key={application.ID}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <StatusIcon className="w-5 h-5 icon-muted flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold truncate text-heading">
                          {application.opportunity?.name || 'Opportunity'}
                        </h3>
                        <Badge variant={getStatusBadge(application.status)} className="text-xs">
                          {application.status}
                        </Badge>
                      </div>
                      {application.opportunity?.details && (
                        <p className="text-body mb-3 text-sm line-clamp-2">{application.opportunity.details.substring(0, 150)}...</p>
                      )}
                      
                      {/* Application Message */}
                      {application.message && (
                        <div className="bg-tertiary border rounded-lg border-default p-3 mb-3">
                          <p className="text-xs sm:text-sm font-medium text-heading mb-1">Message:</p>
                          <p className="text-body text-xs sm:text-sm whitespace-pre-wrap line-clamp-3 sm:line-clamp-none">{application.message}</p>
                        </div>
                      )}
                      
                      {/* Resume Link */}
                      {application.resume_link && (
                        <div className="mb-3">
                          <a 
                            href={application.resume_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs sm:text-sm text-brand"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Resume/CV
                          </a>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted">
                        <span>
                          Applied: {application.CreatedAt ? new Date(application.CreatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {application.student && (
                          <span className="truncate">Student: {application.student.first_name} {application.student.last_name}</span>
                        )}
                      </div>
                    </div>
                    {canManageStatus && (
                      <div className="flex flex-col gap-2 w-full sm:w-auto sm:ml-4">
                        <Select
                          value={application.status}
                          onChange={(e) => updateStatus(application.ID, e.target.value)}
                          className="w-full sm:w-40 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

