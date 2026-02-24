"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar, Link as LinkIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { eventApi, type Event } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventApi.getAll();
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Events</h1>
        <p className="text-muted mt-1 text-sm sm:text-base">
          Discover workshops, seminars, and networking events
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">No events available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              hover
              className="cursor-pointer"
              onClick={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">Event</Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-heading">
                  {event.title}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-muted">
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                  )}
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Learn More</span>
                    </a>
                  )}
                  {event.sign_up_link && (
                    <a
                      href={event.sign_up_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Sign Up</span>
                    </a>
                  )}
                </div>

                {event.organization && (
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--card-border)" }}>
                    <p className="text-xs text-muted">
                      Hosted by{" "}
                      <span className="font-medium text-heading">
                        {event.organization.name}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event detail modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent?.title}
        size="lg"
        className="p-6 sm:p-8"
      >
        <div className="space-y-6">
            <p className="text-sm text-muted">{selectedEvent?.description}</p>

            {selectedEvent?.date && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar className="w-4 h-4" />
                <span>{selectedEvent.date}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              {selectedEvent?.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn More
                </a>
              )}

              {selectedEvent?.sign_up_link && (
                <a
                  href={selectedEvent.sign_up_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  Sign Up
                </a>
              )}
            </div>

            {selectedEvent?.organization && (
              <div className="pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                <p className="text-xs text-muted">
                  Hosted by <span className="font-medium text-heading">{selectedEvent.organization.name}</span>
                </p>
              </div>
            )}
          </div>
      </Modal>
    </div>
  );
}
