export default function FormInput({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-text">{label}</label>}
      <input
        {...props}
        className={`w-full px-4 py-3 bg-surface/50 border rounded-lg text-text placeholder:text-muted/50 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-acid/50 focus:border-acid/50 backdrop-blur-sm
          ${error ? 'border-danger' : 'border-border/50 hover:border-border/80'}`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
