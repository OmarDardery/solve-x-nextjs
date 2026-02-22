import { cn } from '../../utils/cn'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  as: Component = 'button',
  ...props
}) {
  const baseStyles = 'btn font-medium rounded-lg transition-all duration-200 active:scale-[0.98]'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    outline: 'btn-secondary',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const classes = cn(baseStyles, variants[variant], sizes[size], className)

  if (Component === 'button') {
    return (
      <button
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <Component
      className={classes}
      {...props}
    >
      {children}
    </Component>
  )
}

