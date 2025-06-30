export const Accordion = ({ type = 'single', defaultValue, className = '', children, ...props }) => {
  const [openItems, setOpenItems] = useState(
    type === 'multiple' 
      ? (Array.isArray(defaultValue) ? defaultValue : []) 
      : (defaultValue ? [defaultValue] : [])
  );

  const toggleItem = (value) => {
    if (type === 'multiple') {
      setOpenItems(prev => 
        prev.includes(value) 
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    } else {
      setOpenItems(prev => 
        prev.includes(value) ? [] : [value]
      );
    }
  };

  return (
    <div className={className} {...props}>
      {React.Children.map(children, child => {
        if (child.type === AccordionItem) {
          return React.cloneElement(child, {
            isOpen: openItems.includes(child.props.value),
            onToggle: () => toggleItem(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
};

export const AccordionItem = ({ value, className = '', children, isOpen, onToggle, ...props }) => (
  <div className={`border-b ${className}`} {...props}>
    {React.Children.map(children, child => {
      if (child.type === AccordionTrigger) {
        return React.cloneElement(child, { isOpen, onToggle });
      }
      if (child.type === AccordionContent) {
        return React.cloneElement(child, { isOpen });
      }
      return child;
    })}
  </div>
);

export const AccordionTrigger = ({ className = '', children, isOpen, onToggle, ...props }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline ${className}`}
    {...props}
  >
    {children}
    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
  </button>
);

export const AccordionContent = ({ className = '', children, isOpen, ...props }) => (
  <div
    className={`overflow-hidden text-sm transition-all ${isOpen ? 'pb-4' : 'h-0'} ${className}`}
    {...props}
  >
    {children}
  </div>
);