import React from 'react';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ size = 'md', className, text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'spinner',
          sizeClasses[size],
          'animate-spin'
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
