export const SidebarProvider = ({ children, ...props }) => (
  <div className="flex" {...props}>
    {children}
  </div>
);

export const Sidebar = ({ className = '', children, ...props }) => (
  <div className={`flex h-screen w-64 flex-col border-r bg-background ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarHeader = ({ className = '', children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarContent = ({ className = '', children, ...props }) => (
  <div className={`flex-1 overflow-auto ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarFooter = ({ className = '', children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroup = ({ className = '', children, ...props }) => (
  <div className={`space-y-2 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroupLabel = ({ className = '', children, ...props }) => (
  <div className={`text-sm font-semibold text-muted-foreground ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroupContent = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const SidebarMenu = ({ className = '', children, ...props }) => (
  <nav className={`space-y-1 ${className}`} {...props}>
    {children}
  </nav>
);

export const SidebarMenuItem = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const SidebarMenuButton = ({ className = '', children, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${className}`,
      ...props
    });
  }
  
  return (
    <button
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarTrigger = ({ className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10 ${className}`}
    {...props}
  >
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
    </svg>
  </button>
);