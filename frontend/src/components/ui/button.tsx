'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-6 py-3',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, type = 'button', ...props }, ref) => {
    const showIcon = !!icon && !isLoading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading || undefined}
        aria-disabled={disabled ?? isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          showIcon && children ? 'gap-2' : '',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : showIcon ? (
          <span aria-hidden="true">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
