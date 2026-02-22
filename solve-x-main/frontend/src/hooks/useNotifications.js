import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// Dummy notifications for demo
const dummyNotifications = [
  {
    id: 'notif_1',
    userId: 'student1',
    title: 'Application Accepted',
    message: 'Your application for "Machine Learning for Climate Prediction" has been accepted!',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'notif_2',
    userId: 'professor1',
    title: 'New Application Received',
    message: 'Sarah Johnson applied to your project "Machine Learning for Climate Prediction"',
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

export function useNotifications() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // For demo: show some sample notifications
    // In a real app, this would fetch from a service
    const userNotifs = dummyNotifications
      .filter(n => n.userId === currentUser.uid || !currentUser.uid)
      .map(n => ({ ...n }))
      .sort((a, b) => b.createdAt - a.createdAt)
    
    setNotifications(userNotifs)
    setUnreadCount(userNotifs.filter((n) => !n.read).length)
  }, [currentUser])

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}


