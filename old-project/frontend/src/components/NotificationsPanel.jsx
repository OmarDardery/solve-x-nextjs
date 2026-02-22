import { useState } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../hooks/useNotifications'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { formatDistanceToNow } from 'date-fns'

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-body hover:text-heading transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 card z-50 max-h-96 overflow-hidden flex flex-col p-0"
            >
              <div className="p-4 border-b border-default flex items-center justify-between">
                <h3 className="font-semibold text-heading">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-tertiary rounded-lg"
                  >
                    <X className="w-4 h-4 icon-muted" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-default">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover\:bg-tertiary transition-colors cursor-pointer ${
                          !notification.read ? 'bg-brand-light' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-heading">
                              {notification.title}
                            </p>
                            <p className="text-xs text-body mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted mt-2">
                              {notification.createdAt?.toDate
                                ? formatDistanceToNow(notification.createdAt.toDate(), {
                                    addSuffix: true,
                                  })
                                : 'Recently'}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}


