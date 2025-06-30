import React from 'react';

const Badge = ({ 
  className = '', 
  variant = 'default', 
  children, 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
    secondary: "border-transparent bg-gray-700 text-gray-200 hover:bg-gray-600",
    destructive: "border-transparent bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
    outline: "text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-gray-900"
  };
  
  const variantClasses = variants[variant] || variants.default;
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge };