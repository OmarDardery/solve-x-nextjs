import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { validateDriveLink, formatDriveLink } from '../utils/validateDriveLink'
import { Calendar, FileText, Plus, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export function WeeklyReports() {
  const { currentUser, userRole } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [driveLink, setDriveLink] = useState('')

  useEffect(() => {
    fetchReports()
  }, [userRole, currentUser])

  const fetchReports = async () => {
    try {
      setLoading(true)
      if (!currentUser) {
        setLoading(false)
        return
      }
      
      const reportsData = await apiService.getMyReports()
      setReports(reportsData || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    if (!recipientId) {
      toast.error('Please enter a recipient professor ID')
      return
    }

    if (!driveLink) {
      toast.error('Please provide a Google Drive link to your report')
      return
    }

    // Validate Drive link
    const formattedLink = formatDriveLink(driveLink.trim())
    if (!validateDriveLink(formattedLink)) {
      toast.error('Please provide a valid Google Drive link')
      return
    }

    try {
      const reportData = {
        recipient_id: parseInt(recipientId),
        drive_link: formattedLink,
      }

      await apiService.createReport(reportData)
      toast.success('Report submitted successfully!')
      setShowSubmitModal(false)
      setRecipientId('')
      setDriveLink('')
      fetchReports()
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error(error.message || 'Failed to submit report')
    }
  }

  if (userRole === 'student') {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-heading">Weekly Reports</h1>
            <p className="text-body mt-1">Submit your weekly progress reports</p>
          </div>
          <Button onClick={() => setShowSubmitModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Submit Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 icon-muted mx-auto mb-4" />
                <p className="text-body">No reports submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.ID} className="p-4 border rounded-lg border-default">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 icon-muted" />
                        <span className="font-semibold text-heading">
                          {new Date(report.CreatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <Badge variant="success">Submitted</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-heading">Report Document:</span>
                        <div className="mt-1">
                          <a
                            href={report.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand text-sm flex items-center gap-1"
                          >
                            View Document
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Report Modal */}
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Weekly Report"
          size="lg"
        >
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <Input
              label="Professor ID"
              type="number"
              placeholder="Enter professor's user ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              required
            />
            <Input
              label="Report Document (Google Drive Link)"
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              required
            />
            <p className="text-sm text-body">
              Upload your weekly report as a Word document to Google Drive and paste the link here
            </p>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Report
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }

  // Professor view
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading">Weekly Reports</h1>
          <p className="text-body mt-1">Review student progress reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 icon-muted mx-auto mb-4" />
              <p className="text-body">No reports received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.ID} className="p-4 border rounded-lg border-default">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 icon-muted" />
                      <span className="font-semibold text-heading">
                        {new Date(report.CreatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {report.Student && (
                      <Badge variant="default">
                        {report.Student.first_name} {report.Student.last_name}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {report.Student && (
                      <div>
                        <span className="font-medium text-heading">Student:</span>
                        <p className="text-body">
                          {report.Student.first_name} {report.Student.last_name} ({report.Student.email})
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-heading">Report Document:</span>
                      <div className="mt-1">
                        <a
                          href={report.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand text-sm flex items-center gap-1"
                        >
                          View Document
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
