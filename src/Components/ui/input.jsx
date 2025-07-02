import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Base Input Component
const Input = React.forwardRef(({ 
  className = '', 
  type = 'text', 
  error = '',
  label = '',
  required = false,
  icon,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {React.cloneElement(icon, { className: "w-4 h-4" })}
          </div>
        )}
        
        <input
          type={inputType}
          className={`
            w-full px-3 py-2 rounded-xl border-2 transition-all duration-200
            bg-white/80 backdrop-blur-sm
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
            }
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${className}
          `}
          ref={ref}
          {...props}
        />
        
        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

// Textarea Component
const Textarea = React.forwardRef(({ 
  className = '', 
  error = '',
  label = '',
  required = false,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2 rounded-xl border-2 transition-all duration-200
          bg-white/80 backdrop-blur-sm resize-none
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
          }
          focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder:text-gray-400
          ${className}
        `}
        ref={ref}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

// Select Component
const Select = React.forwardRef(({ 
  className = '', 
  error = '',
  label = '',
  required = false,
  children,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        className={`
          w-full px-3 py-2 rounded-xl border-2 transition-all duration-200
          bg-white/80 backdrop-blur-sm
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
          }
          focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

// Checkbox Component
const Checkbox = React.forwardRef(({ 
  className = '', 
  label = '',
  error = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={`
            w-4 h-4 rounded border-2 border-gray-300
            text-orange-500 focus:ring-orange-200 focus:ring-2
            transition-all duration-200
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 select-none">
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

// Radio Component
const Radio = React.forwardRef(({ 
  className = '', 
  label = '',
  error = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          className={`
            w-4 h-4 border-2 border-gray-300
            text-orange-500 focus:ring-orange-200 focus:ring-2
            transition-all duration-200
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 select-none">
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

// Form Group Component
const FormGroup = ({ children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

Input.displayName = "Input";
Textarea.displayName = "Textarea";
Select.displayName = "Select";
Checkbox.displayName = "Checkbox";
Radio.displayName = "Radio";

export { Input, Textarea, Select, Checkbox, Radio, FormGroup };
export default Input;