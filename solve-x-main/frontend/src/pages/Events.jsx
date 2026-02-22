import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { 
  Calendar, 
  Building2, 
  ExternalLink, 
  Search,
  Link as LinkIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export function Events() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title?.toLowerCase().includes(query) ||
            event.description?.toLowerCase().includes(query) ||
            event.organization?.name?.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, events])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllEvents()
      const eventsData = Array.isArray(response) ? response : []
      setEvents(eventsData)
      setFilteredEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const openDetailModal = (event) => {
    setSelectedEvent(event)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedEvent(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Events</h1>
        <p className="text-sm sm:text-base text-body mt-1">
          Discover events from organizations and companies
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 icon-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-heading mb-2">
                {searchQuery ? 'No events found' : 'No events available'}
              </h3>
              <p className="text-body">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Check back later for upcoming events'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card 
              key={event.ID} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openDetailModal(event)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                {event.date && (
                  <p className="text-sm text-brand flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-body text-sm line-clamp-3 mb-4">
                    {event.description}
                  </p>
                )}
                
                {/* Organization Info */}
                {event.organization && (
                  <Link
                    to={`/organizations/${event.organization.ID}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center gap-2 p-2 bg-tertiary rounded-lg hover:bg-brand-light transition-colors text-left"
                  >
                    <div className="p-2 bg-brand-light rounded-full">
                      <Building2 className="w-4 h-4 icon-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand truncate hover:underline">
                        {event.organization.name}
                      </p>
                      <p className="text-xs text-muted">Click to view details</p>
                    </div>
                  </Link>
                )}

                {/* Quick Links */}
                <div className="flex flex-col xs:flex-row gap-2 mt-4">
                  {event.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(event.link, '_blank')
                      }}
                    >
                      <LinkIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Learn More</span>
                    </Button>
                  )}
                  {event.sign_up_link && (
                    <Button
                      size="sm"
                      className="flex-1 text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(event.sign_up_link, '_blank')
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Sign Up</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        title={selectedEvent?.title || 'Event Details'}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Date */}
            {selectedEvent.date && (
              <div className="flex items-center gap-2 text-brand">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{selectedEvent.date}</span>
              </div>
            )}

            {/* Description */}
            {selectedEvent.description && (
              <div>
                <h4 className="font-medium text-heading mb-2">About This Event</h4>
                <p className="text-body whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            )}

            {/* Organization Details */}
            {selectedEvent.organization && (
              <div className="border-t border-default pt-6">
                <h4 className="font-medium text-heading mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 icon-primary" />
                  Hosted by
                </h4>
                <Link
                  to={`/organizations/${selectedEvent.organization.ID}`}
                  onClick={closeDetailModal}
                  className="block"
                >
                  <Card className="bg-tertiary hover:bg-brand-light transition-colors cursor-pointer">
                    <CardContent className="pt-4">
                      <h5 className="text-lg font-semibold text-brand mb-1 hover:underline">
                        {selectedEvent.organization.name}
                      </h5>
                      <p className="text-sm text-muted">Click to view organization details and all events</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-default">
              {selectedEvent.link && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(selectedEvent.link, '_blank')}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              )}
              {selectedEvent.sign_up_link && (
                <Button
                  className="flex-1"
                  onClick={() => window.open(selectedEvent.sign_up_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Sign Up Now
                </Button>
              )}
              {!selectedEvent.link && !selectedEvent.sign_up_link && (
                <Button variant="outline" onClick={closeDetailModal} className="w-full">
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
