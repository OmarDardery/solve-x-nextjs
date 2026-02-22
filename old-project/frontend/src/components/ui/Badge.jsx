import { cn } from '../../utils/cn'

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'badge-default',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }

  return (
    <span
      className={cn(
        'badge',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}


