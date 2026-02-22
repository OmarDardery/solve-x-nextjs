import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

export const Input = forwardRef(({ label, error, helperText, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'input-field',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-muted">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export const Textarea = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'input-field resize-none',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export const Select = forwardRef(({ label, error, children, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'input-field',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'


