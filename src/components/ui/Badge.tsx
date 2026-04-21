import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export default function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        {
          'bg-gray-500/20 text-gray-400 border-gray-500/30': variant === 'default',
          'bg-green-500/20 text-green-400 border-green-500/30': variant === 'success',
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': variant === 'warning',
          'bg-red-500/20 text-red-400 border-red-500/30': variant === 'danger',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
