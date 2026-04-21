import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white/5 border border-white/10 rounded-2xl p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
