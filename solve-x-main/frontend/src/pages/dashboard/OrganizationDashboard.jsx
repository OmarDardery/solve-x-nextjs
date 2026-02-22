import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiService } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { 
  Building2, 
  Calendar, 
  Plus, 
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Edit,
  Trash2,
  Link as LinkIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export function OrganizationDashboard() {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  
  // Modal states
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    link: '',
    sign_up_link: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [profileRes, eventsRes] = await Promise.all([
        apiService.getProfile(),
        apiService.getMyEvents().catch(() => []),
      ])
      
      setProfile(profileRes.user || profileRes)
      setEvents(Array.isArray(eventsRes) ? eventsRes : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      date: '',
      link: '',
      sign_up_link: '',
    })
    setShowEventModal(true)
  }

  const openEditModal = (event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      link: event.link || '',
      sign_up_link: event.sign_up_link || '',
    })
    setShowEventModal(true)
  }

  const closeModal = () => {
    setShowEventModal(false)
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      date: '',
      link: '',
      sign_up_link: '',
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEventForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitEvent = async (e) => {
    e.preventDefault()
    
    if (!eventForm.title.trim()) {
      toast.error('Event title is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingEvent) {
        // Update existing event
        await apiService.updateEvent(editingEvent.ID, eventForm)
        toast.success('Event updated successfully')
      } else {
        // Create new event
        await apiService.createEvent(eventForm)
        toast.success('Event created successfully')
      }
      closeModal()
      fetchData()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(error.message || 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await apiService.deleteEvent(eventId)
      toast.success('Event deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error.message || 'Failed to delete event')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">
            Welcome, {profile?.name || currentUser?.name || 'Organization'}!
          </h1>
          <p className="text-body mt-1 text-sm sm:text-base">
            Manage your events and reach students
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Organization Info Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 icon-primary" />
            Organization Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-body text-sm sm:text-base min-w-0">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{profile?.email || currentUser?.email}</span>
            </div>
            {profile?.contact && (
              <div className="flex items-center gap-2 text-body text-sm sm:text-base min-w-0">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{profile.contact}</span>
              </div>
            )}
            {profile?.link && (
              <div className="flex items-center gap-2 text-body text-sm sm:text-base min-w-0">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <a 
                  href={profile.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">Website</span> <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="p-4 sm:pt-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-brand-light rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 icon-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-heading">{events.length}</p>
              <p className="text-muted text-xs sm:text-sm">Total Events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>Create and manage events for students</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 icon-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-heading mb-2">No events yet</h3>
              <p className="text-muted mb-6">Create your first event to reach students</p>
              <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div 
                  key={event.ID} 
                  className="p-3 sm:p-4 border rounded-lg border-default hover:bg-tertiary transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-heading">{event.title}</h3>
                      {event.date && (
                        <p className="text-xs sm:text-sm text-brand mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{event.date}</span>
                        </p>
                      )}
                      {event.description && (
                        <p className="text-body mt-2 line-clamp-2 text-sm">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                        {event.link && (
                          <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Learn More
                          </a>
                        )}
                        {event.sign_up_link && (
                          <a 
                            href={event.sign_up_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Sign Up
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-start">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(event)}
                        className="flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteEvent(event.ID)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={closeModal}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
      >
        <form onSubmit={handleSubmitEvent} className="space-y-4">
          <Input
            label="Event Title"
            name="title"
            value={eventForm.title}
            onChange={handleFormChange}
            placeholder="e.g., Tech Career Fair 2026"
            required
          />
          
          <Textarea
            label="Description"
            name="description"
            value={eventForm.description}
            onChange={handleFormChange}
            placeholder="Describe your event..."
            rows={4}
          />
          
          <Input
            label="Date / Duration"
            name="date"
            value={eventForm.date}
            onChange={handleFormChange}
            placeholder="e.g., March 15, 2026 or March 15-17, 2026"
          />
          
          <Input
            label="Learn More Link (optional)"
            name="link"
            value={eventForm.link}
            onChange={handleFormChange}
            placeholder="https://your-event-page.com"
          />
          
          <Input
            label="Sign Up / Registration Link (optional)"
            name="sign_up_link"
            value={eventForm.sign_up_link}
            onChange={handleFormChange}
            placeholder="https://forms.google.com/your-form"
          />
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
