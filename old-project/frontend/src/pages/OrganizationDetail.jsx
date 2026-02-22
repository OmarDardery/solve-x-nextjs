import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink,
  ArrowLeft,
  Link as LinkIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export function OrganizationDetail() {
  const { id } = useParams()
  const [organization, setOrganization] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchOrganizationData()
    }
  }, [id])

  const fetchOrganizationData = async () => {
    try {
      setLoading(true)
      const [orgData, eventsData] = await Promise.all([
        apiService.getOrganizationById(id),
        apiService.getEventsByOrganizationId(id),
      ])
      setOrganization(orgData)
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error) {
      console.error('Error fetching organization:', error)
      toast.error('Failed to load organization details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 icon-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-heading mb-2">Organization Not Found</h2>
        <p className="text-muted mb-6">The organization you're looking for doesn't exist.</p>
        <Link to="/events">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center text-body hover:text-heading">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>

      {/* Organization Header */}
      <div className="bg-gradient-brand rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm self-start">
            <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{organization.name}</h1>
            <p className="text-brand-100 mt-1 sm:mt-2 text-sm sm:text-base">Organization</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {organization.email && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-tertiary rounded-lg">
                <div className="p-2 bg-brand-light rounded-lg flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 icon-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted">Email</p>
                  <a 
                    href={`mailto:${organization.email}`}
                    className="text-brand font-medium text-sm sm:text-base truncate block"
                  >
                    {organization.email}
                  </a>
                </div>
              </div>
            )}
            
            {organization.contact && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-tertiary rounded-lg">
                <div className="p-2 bg-brand-light rounded-lg flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 icon-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted">Contact</p>
                  <p className="font-medium text-heading text-sm sm:text-base truncate">{organization.contact}</p>
                </div>
              </div>
            )}
            
            {organization.link && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-tertiary rounded-lg">
                <div className="p-2 bg-brand-light rounded-lg flex-shrink-0">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 icon-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted">Website</p>
                  <a 
                    href={organization.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand font-medium flex items-center gap-1 text-sm sm:text-base"
                  >
                    <span className="truncate">Visit Website</span> <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {!organization.email && !organization.contact && !organization.link && (
            <p className="text-muted text-center py-4">No contact information available</p>
          )}
        </CardContent>
      </Card>

      {/* Events by Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 icon-primary" />
            Events by {organization.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 icon-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-heading mb-2">No Events Yet</h3>
              <p className="text-muted">This organization hasn't posted any events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.ID}
                  className="p-4 border rounded-lg border-default hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-heading text-lg">{event.title}</h3>
                  {event.date && (
                    <p className="text-sm text-brand flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-body text-sm mt-2 line-clamp-2">{event.description}</p>
                  )}
                  
                  {/* Event Links */}
                  <div className="flex flex-col xs:flex-row gap-2 mt-4">
                    {event.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => window.open(event.link, '_blank')}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Learn More
                      </Button>
                    )}
                    {event.sign_up_link && (
                      <Button
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => window.open(event.sign_up_link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Sign Up
                      </Button>
                    )}
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
