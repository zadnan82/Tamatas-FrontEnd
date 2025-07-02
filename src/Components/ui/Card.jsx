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
        rounded-lg border border-gray-100 shadow-sm backdrop-blur-sm
        ${gradient 
          ? 'bg-gradient-to-br from-white/90 to-orange-50/80' 
          : 'bg-white/80'
        }
        ${hover 
          ? 'transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5' 
          : ''
        }
        sm:rounded-xl sm:shadow-md
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
        px-3 py-2.5 border-b border-gray-100/50
        ${gradient ? 'bg-gradient-to-r from-orange-50 to-pink-50' : ''}
        rounded-t-lg sm:px-4 sm:py-3 sm:rounded-t-xl
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
  size = 'md',
  ...props 
}) => {
  const sizes = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-xl sm:text-2xl lg:text-3xl'
  };

  return (
    <h3 
      className={`
        ${sizes[size]} font-semibold leading-tight
        ${gradient 
          ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent' 
          : 'text-gray-900'
        }
        sm:font-bold
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
      className={`text-xs text-gray-600 mt-1 sm:text-sm ${className}`} 
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
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    default: 'p-3 sm:p-4 lg:p-6',
    lg: 'p-4 sm:p-6 lg:p-8',
    xl: 'p-6 sm:p-8 lg:p-10'
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
        px-3 py-2.5 rounded-b-lg sm:px-4 sm:py-3 sm:rounded-b-xl
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
      <CardContent className="flex flex-col items-center space-y-2 sm:space-y-3">
        {icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
            {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-white" })}
          </div>
        )}
        
        <div>
          <CardTitle gradient size="sm" className="mb-1 sm:mb-2">
            {title}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        
        {action && (
          <div className="pt-1 sm:pt-2">
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
      <CardContent className="flex items-center justify-between" padding="sm">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">{title}</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5 sm:text-xl lg:text-2xl">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend > 0 ? '↗' : '↘'}</span>
              <span className="ml-0.5">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center ml-2">
            {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-white" })}
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
  compact = false,
  ...props 
}) => {
  return (
    <Card hover className={className} {...props}>
      {image && (
        <div className={`${compact ? 'aspect-[4/3]' : 'aspect-video'} bg-gradient-to-br from-orange-50 to-pink-50 rounded-t-lg sm:rounded-t-xl overflow-hidden relative`}>
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge, index) => (
                <span 
                  key={index}
                  className="px-1.5 py-0.5 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-md"
                >
                  {badge}
                </span>
              ))}
              {badges.length > 2 && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-md">
                  +{badges.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      <CardContent padding={compact ? 'sm' : 'default'}>
        <CardTitle size={compact ? 'xs' : 'sm'} className="mb-1">
          {title}
        </CardTitle>
        
        {price && (
          <p className={`font-bold text-orange-600 mb-1 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>{price}</p>
        )}
        
        {description && (
          <CardDescription className={`mb-2 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {description}
          </CardDescription>
        )}
        
        {actions && (
          <div className={`flex gap-1.5 ${compact ? 'flex-col sm:flex-row' : 'flex-row'}`}>
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// List Card Component for mobile lists
const ListCard = ({ 
  image, 
  title, 
  subtitle,
  description,
  badges = [],
  actions,
  className = '',
  ...props 
}) => {
  return (
    <Card className={`overflow-hidden ${className}`} {...props}>
      <CardContent className="flex items-center gap-3" padding="sm">
        {image && (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <CardTitle size="xs" className="line-clamp-1">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-gray-500 line-clamp-1">{subtitle}</p>
          )}
          {description && (
            <CardDescription className="line-clamp-1 mt-0.5">
              {description}
            </CardDescription>
          )}
          
          {badges.length > 0 && (
            <div className="flex gap-1 mt-1">
              {badges.slice(0, 2).map((badge, index) => (
                <span 
                  key={index}
                  className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 rounded-md"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {actions && (
          <div className="flex-shrink-0 flex flex-col gap-1 sm:flex-row">
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
  ProductCard,
  ListCard
};

export default Card;