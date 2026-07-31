import React from 'react';
import { Check } from 'lucide-react';

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  size = 'md',
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="inline-flex items-center gap-1" title="Verified Starforge Developer">
      <span
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white font-bold shadow-xs ${sizeClasses[size]}`}
      >
        <Check className={`${iconSizes[size]} stroke-[3]`} />
      </span>
      {showLabel && (
        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
          Verified Developer
        </span>
      )}
    </div>
  );
};
