import React from 'react';

const Badge = ({ className = '', children, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-green-100 text-green-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-200'
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Badge;