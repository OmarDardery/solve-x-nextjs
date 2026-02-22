import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { APPLICATION_STATUS } from '../types'
import { ArrowLeft, Calendar, Users, FileText, ExternalLink, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [resumeLink, setResumeLink] = useState('')

  useEffect(() => {
    fetchOpportunity()
    checkIfApplied()
  }, [id, currentUser])

  const fetchOpportunity = async () => {
    try {
      const opp = await apiService.getOpportunityById(id)
      setOpportunity(opp)
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      toast.error('Failed to load opportunity')
      navigate('/opportunities')
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    if (!currentUser || userRole !== 'student') return

    try {
      const applications = await apiService.getMyApplications()
      const applied = applications.some(app => app.opportunity_id === parseInt(id))
      setHasApplied(applied)
    } catch (error) {
      console.error('Error checking application:', error)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      await apiService.createApplication(parseInt(id), applicationMessage, resumeLink)
      toast.success('Application submitted successfully!')
      setShowApplyModal(false)
      setHasApplied(true)
      setApplicationMessage('')
      setResumeLink('')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      research: 'Research',
      project: 'Project',
      internship: 'Internship',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (!opportunity) {
    return null
  }

  const isStudent = userRole === 'student'
  const canApply = isStudent && !hasApplied

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => navigate('/opportunities')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Opportunities
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="primary">{getTypeLabel(opportunity.type)}</Badge>
                  </div>
                  <CardTitle className="text-3xl mb-2">{opportunity.name}</CardTitle>
                  {opportunity.professor && (
                    <p className="text-body mt-2">
                      By {opportunity.professor.first_name} {opportunity.professor.last_name}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3 text-heading">Details</h3>
                <p className="text-body whitespace-pre-wrap mb-6">{opportunity.details}</p>

                {opportunity.requirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-heading">Requirements</h3>
                    <p className="text-body whitespace-pre-wrap">{opportunity.requirements}</p>
                  </div>
                )}

                {opportunity.reward && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-heading">Reward</h3>
                    <p className="text-body whitespace-pre-wrap">{opportunity.reward}</p>
                  </div>
                )}

                {opportunity.requirement_tags && opportunity.requirement_tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-heading">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.requirement_tags.map((tag) => (
                        <Badge key={tag.ID} variant="default">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {opportunity.CreatedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 icon-muted" />
                    <div>
                      <p className="text-sm text-body">Posted</p>
                      <p className="text-lg font-semibold text-heading">
                        {new Date(opportunity.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {canApply && (
                <Button
                  className="w-full mt-6"
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply Now
                </Button>
              )}

              {hasApplied && (
                <div className="mt-6 alert-success">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You have applied to this opportunity</span>
                  </div>
                  <Link
                    to="/applications"
                    className="text-sm mt-2 inline-block"
                  >
                    View your application →
                  </Link>
                </div>
              )}

              {!isStudent && (
                <div className="mt-6 p-4 bg-tertiary border rounded-lg border-default">
                  <p className="text-sm text-body">
                    Students can apply to this opportunity. <Link to="/login" className="text-brand">Sign in</Link> as a student to apply.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply to Opportunity"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-heading">{opportunity.name}</h3>
            <p className="text-sm text-body mb-4">{opportunity.details?.substring(0, 200)}...</p>
          </div>

          <Textarea
            label="Message to Professor"
            placeholder="Introduce yourself and explain why you're interested in this opportunity..."
            value={applicationMessage}
            onChange={(e) => setApplicationMessage(e.target.value)}
            rows={5}
          />

          <Input
            label="Resume/CV Link"
            placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            type="url"
          />

          <p className="text-sm text-muted">
            Tip: You can link to your resume on Google Drive, Dropbox, or your LinkedIn profile.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleApply}
              disabled={applying}
              className="flex-1"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowApplyModal(false)}
              disabled={applying}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


