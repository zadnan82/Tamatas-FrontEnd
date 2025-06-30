import React from 'react';

const Textarea = React.forwardRef(({ 
  className = '', 
  ...props 
}, ref) => {
  const baseClasses = "flex min-h-[80px] w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";
  
  return (
    <textarea
      className={`${baseClasses} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };