"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Building2,
  Calendar,
  Plus,
  ExternalLink,
  Mail,
  Globe,
  Edit,
  Trash2,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { organizationApi, eventApi, type Organization, type Event } from "@/lib/api";

interface EventForm {
  title: string;
  description: string;
  start_time: string;
  meeting_url: string;
  location: string;
}

export default function OrganizationDashboard() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Organization | null>(null);

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventForm>({
    title: "",
    description: "",
    start_time: "",
    meeting_url: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, eventsRes] = await Promise.all([
        organizationApi.getProfile().catch(() => null),
        eventApi.getMyEvents().catch(() => []),
      ]);

      setProfile(profileRes);
      setEvents(Array.isArray(eventsRes) ? eventsRes : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      start_time: "",
      meeting_url: "",
      location: "",
    });
    setShowEventModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      start_time: event.start_time || "",
      meeting_url: event.meeting_url || "",
      location: event.location || "",
    });
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      start_time: "",
      meeting_url: "",
      location: "",
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventForm.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingEvent) {
        await eventApi.update(editingEvent.id, eventForm);
        toast.success("Event updated successfully");
      } else {
        await eventApi.create(eventForm);
        toast.success("Event created successfully");
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await eventApi.delete(eventId);
      toast.success("Event deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">
            Welcome, {profile?.name || session?.user?.name || "Organization"}!
          </h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
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
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Organization Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-muted text-sm sm:text-base min-w-0">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{profile?.email || session?.user?.email}</span>
            </div>
            {profile?.website_url && (
              <div className="flex items-center gap-2 text-muted text-sm sm:text-base min-w-0">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">Website</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
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
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-heading">
                {events.length}
              </p>
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
              <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-heading mb-2">
                No events yet
              </h3>
              <p className="text-muted mb-6">
                Create your first event to reach students
              </p>
              <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-heading">
                        {event.title}
                      </h3>
                      {event.start_time && (
                        <p className="text-xs sm:text-sm text-primary mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(event.start_time).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                      {event.description && (
                        <p className="text-muted mt-2 line-clamp-2 text-sm">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                        {event.meeting_url && (
                          <a
                            href={event.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Meeting Link
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-start">
                      <Button
                        variant="secondary"
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
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        title={editingEvent ? "Edit Event" : "Create New Event"}
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
            label="Date & Time"
            name="start_time"
            type="datetime-local"
            value={eventForm.start_time}
            onChange={handleFormChange}
          />

          <Input
            label="Location"
            name="location"
            value={eventForm.location}
            onChange={handleFormChange}
            placeholder="e.g., Main Campus Auditorium"
          />

          <Input
            label="Meeting URL (optional)"
            name="meeting_url"
            value={eventForm.meeting_url}
            onChange={handleFormChange}
            placeholder="https://zoom.us/j/meeting-id"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingEvent ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
