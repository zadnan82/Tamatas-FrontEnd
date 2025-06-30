export const Checkbox = ({ checked, onCheckedChange, className = '', ...props }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${checked ? 'bg-blue-600 text-white' : 'bg-white border-gray-300'} ${className}`}
    {...props}
  >
    {checked && <Check className="h-3 w-3" />}
  </button>
);