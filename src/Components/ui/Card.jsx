import React from 'react';

// Base Card Component
const Card = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  ...props 
}) => {
  return (
    <div 
      className={`
        rounded-2xl border border-gray-100 shadow-lg backdrop-blur-sm
        ${gradient 
          ? 'bg-gradient-to-br from-white/90 to-orange-50/80' 
          : 'bg-white/80'
        }
        ${hover 
          ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1' 
          : ''
        }
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ 
  children, 
  className = '', 
  gradient = false,
  ...props 
}) => {
  return (
    <div 
      className={`
        px-6 py-4 border-b border-gray-100/50
        ${gradient ? 'bg-gradient-to-r from-orange-50 to-pink-50' : ''}
        rounded-t-2xl
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title Component
const CardTitle = ({ 
  children, 
  className = '', 
  gradient = false,
  size = 'lg',
  ...props 
}) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  return (
    <h3 
      className={`
        ${sizes[size]} font-bold leading-tight
        ${gradient 
          ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent' 
          : 'text-gray-900'
        }
        ${className}
      `} 
      {...props}
    >
      {children}
    </h3>
  );
};

// Card Description Component
const CardDescription = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <p 
      className={`text-sm text-gray-600 mt-1 ${className}`} 
      {...props}
    >
      {children}
    </p>
  );
};

// Card Content Component
const CardContent = ({ 
  children, 
  className = '', 
  padding = 'default',
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <div 
      className={`${paddings[padding]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card Footer Component
const CardFooter = ({ 
  children, 
  className = '', 
  border = true,
  ...props 
}) => {
  return (
    <div 
      className={`
        px-6 py-4 rounded-b-2xl
        ${border ? 'border-t border-gray-100/50' : ''}
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

// Feature Card Component (special variant)
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  action,
  className = '',
  ...props 
}) => {
  return (
    <Card hover gradient className={`text-center ${className}`} {...props}>
      <CardContent className="flex flex-col items-center space-y-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
            {React.cloneElement(icon, { className: "w-6 h-6 text-white" })}
          </div>
        )}
        
        <div>
          <CardTitle gradient size="lg" className="mb-2">
            {title}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  trend,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <Card gradient className={className} {...props}>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend > 0 ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
            {React.cloneElement(icon, { className: "w-5 h-5 text-white" })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Product Card Component
const ProductCard = ({ 
  image, 
  title, 
  price, 
  description,
  badges = [],
  actions,
  className = '',
  ...props 
}) => {
  return (
    <Card hover className={className} {...props}>
      {image && (
        <div className="aspect-video bg-gradient-to-br from-orange-50 to-pink-50 rounded-t-2xl overflow-hidden relative">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {badges.map((badge, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-lg"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      
      <CardContent>
        <CardTitle size="md" className="mb-2">
          {title}
        </CardTitle>
        
        {price && (
          <p className="text-lg font-bold text-orange-600 mb-2">{price}</p>
        )}
        
        {description && (
          <CardDescription className="mb-4">
            {description}
          </CardDescription>
        )}
        
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  FeatureCard,
  StatsCard,
  ProductCard
};

export default Card;