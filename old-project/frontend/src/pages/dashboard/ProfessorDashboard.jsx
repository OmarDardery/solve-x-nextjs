import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiService } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { OpportunityForm } from '../../components/forms/OpportunityForm'
import { Plus, BookOpen, Users, FileText, TrendingUp, Briefcase, ExternalLink, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { APPLICATION_STATUS } from '../../types'

export function ProfessorDashboard() {
  const { currentUser } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentUser])

  const fetchData = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      // Fetch professor's opportunities
      const oppsData = await apiService.getMyOpportunities()

      // Fetch applications for professor's opportunities
      const appsData = await apiService.getMyApplications()

      setOpportunities(oppsData)
      setApplications(appsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const publishedOpportunities = opportunities
  const pendingApplications = applications.filter((a) => a.status === 'pending')

  const stats = [
    {
      label: 'Published Opportunities',
      value: publishedOpportunities.length,
      icon: Briefcase,
      color: 'text-blue-500',
    },
    {
      label: 'Total Opportunities',
      value: opportunities.length,
      icon: BookOpen,
      color: 'text-green-500',
    },
    {
      label: 'Pending Applications',
      value: pendingApplications.length,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      label: 'Total Applications',
      value: applications.length,
      icon: FileText,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="page-bg space-y-6 sm:space-y-8 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="card flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-heading">
            Professor Dashboard
          </h1>
          <p className="text-body mt-1 text-sm sm:text-base">Manage your research projects and applications</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)} className="text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-body mb-1 line-clamp-1">{stat.label}</p>
                    <p className="text-xl sm:text-3xl font-bold text-heading">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.color} hidden sm:block`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Published Opportunities */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Published Opportunities</CardTitle>
            <Button variant="ghost" size="sm" as={Link} to="/opportunities">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
            </div>
          ) : publishedOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 icon-muted mx-auto mb-4" />
              <p className="text-body mb-4">No published opportunities yet. Create and publish your first opportunity!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedOpportunities.slice(0, 5).map((opportunity) => {
                const oppApplications = applications.filter(a => a.opportunity_id === opportunity.ID)
                return (
                  <div
                    key={opportunity.ID}
                    className="p-4 border rounded-lg border-default hover:border-brand transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-heading">{opportunity.name}</h3>
                          <Badge variant="success">Active</Badge>
                          {applications.filter(a => a.opportunity_id === opportunity.ID).length > 0 && (
                            <Badge variant="default">{applications.filter(a => a.opportunity_id === opportunity.ID).length} applications</Badge>
                          )}
                        </div>
                        <p className="text-body mb-3 line-clamp-2">{opportunity.details}</p>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span>{opportunity.type}</span>
                          <span>•</span>
                          <span>{opportunity.requirement_tags?.length || 0} tags</span>
                          <span>•</span>
                          <span>{applications.filter(a => a.opportunity_id === opportunity.ID && a.status === 'pending').length} pending</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" as={Link} to={`/opportunities/${opportunity.ID}`}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" as={Link} to="/applications">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 icon-muted mx-auto mb-4" />
              <p className="text-body">No applications yet. Applications will appear here when students apply to your opportunities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => {
                const getStatusBadge = (status) => {
                  const variants = {
                    pending: 'default',
                    accepted: 'success',
                    rejected: 'danger',
                  }
                  return variants[status] || 'default'
                }
                return (
                  <div
                    key={application.ID}
                    className="p-4 border rounded-lg border-default hover:border-brand transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-heading">{application.opportunity?.name || 'Opportunity'}</h3>
                          <Badge variant={getStatusBadge(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted">
                          {application.student?.first_name} {application.student?.last_name} • Applied on {application.CreatedAt ? new Date(application.CreatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" as={Link} to="/applications">
                        View
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Opportunity"
        size="xl"
      >
        <OpportunityForm
          onSuccess={() => {
            setShowCreateModal(false)
            fetchData()
            toast.success('Opportunity created successfully!')
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}

