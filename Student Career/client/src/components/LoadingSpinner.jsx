export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-primary-500/10 border-t-primary-500 animate-spin`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-b-accent-500/40 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      {text && <p className="text-sm text-text-secondary animate-pulse font-medium">{text}</p>}
    </div>
  );
}
