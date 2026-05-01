export default function Button({ children, variant = 'primary', size = 'md', fullWidth = false, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-acid to-violet text-white hover:shadow-lg hover:shadow-acid/20',
    secondary: 'bg-white border border-border text-text hover:bg-surface hover:border-acid/30',
    ghost: 'text-dim hover:text-acid hover:bg-acid/10 transition-colors',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20 transition-colors',
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <button
      className={`font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} active:scale-95 flex items-center justify-center gap-2`}
      {...props}
    >
      {children}
    </button>
  )
}
