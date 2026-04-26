import { HiStar } from 'react-icons/hi';

export default function StarRating({ rating = 0, onRate, size = 'md', readonly = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'} transition-all duration-200`}
        >
          <HiStar
            className={`${sizes[size]} transition-all duration-200 ${
              star <= rating ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]' : 'text-text-muted/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
