import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'

export function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl xl:max-w-5xl',
    xl: 'max-w-5xl xl:max-w-6xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop fixed inset-0 z-40 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                'modal-content w-full my-4 sm:my-8',
                'max-h-[95vh] sm:max-h-[90vh] flex flex-col',
                sizes[size],
                className
              )}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-4 sm:p-6 divider border-b flex-shrink-0">
                  <h2 className="text-xl sm:text-2xl font-semibold text-heading pr-4">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="btn-ghost p-2 rounded-lg flex-shrink-0"
                  >
                    <X className="w-5 h-5 icon-muted" />
                  </button>
                </div>
              )}
              
              {/* Content - Scrollable */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}


