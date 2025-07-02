import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  onClick, 
  type = 'button',
  fullWidth = false,
  icon,
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-orange-400 via-red-400 to-pink-400
      hover:from-orange-500 hover:via-red-500 hover:to-pink-500
      text-white shadow-lg hover:shadow-xl
      focus:ring-orange-300
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
    secondary: `
      bg-gradient-to-r from-blue-400 to-cyan-400
      hover:from-blue-500 hover:to-cyan-500
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-300
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
    success: `
      bg-gradient-to-r from-green-400 to-emerald-400
      hover:from-green-500 hover:to-emerald-500
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-300
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
    outline: `
      border-2 border-gradient-to-r from-orange-400 to-pink-400
      bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50
      text-gray-700 hover:text-orange-600
      shadow-md hover:shadow-lg
      focus:ring-orange-300
    `,
    ghost: `
      bg-transparent hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50
      text-gray-600 hover:text-orange-600
      shadow-none hover:shadow-md
      focus:ring-orange-300
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-500
      hover:from-red-600 hover:to-rose-600
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-300
      transform hover:scale-[1.02] active:scale-[0.98]
    `
  };
  
  const sizes = {
    xs: 'text-xs px-2 py-1 min-h-[24px]',
    sm: 'text-sm px-3 py-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 min-h-[40px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
    xl: 'text-lg px-8 py-4 min-h-[56px]'
  };
  
  const isLoading = loading || disabled;
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={isLoading}
      type={type}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      
      {/* Icon */}
      {icon && !loading && (
        React.cloneElement(icon, { className: "w-4 h-4" })
      )}
      
      {/* Button text */}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>
      
      {/* Shimmer effect for primary buttons */}
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      )}
    </button>
  );
};

// Button group component for related actions
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal' }) => {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };
  
  return (
    <div className={`inline-flex ${orientationClasses[orientation]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          let roundedClasses = '';
          if (orientation === 'horizontal') {
            if (isFirst) roundedClasses = 'rounded-r-none';
            else if (isLast) roundedClasses = 'rounded-l-none';
            else roundedClasses = 'rounded-none';
          } else {
            if (isFirst) roundedClasses = 'rounded-b-none';
            else if (isLast) roundedClasses = 'rounded-t-none';
            else roundedClasses = 'rounded-none';
          }
          
          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${roundedClasses} ${
              !isLast && orientation === 'horizontal' ? 'border-r-0' : ''
            } ${
              !isLast && orientation === 'vertical' ? 'border-b-0' : ''
            }`
          });
        }
        return child;
      })}
    </div>
  );
};

export default Button;