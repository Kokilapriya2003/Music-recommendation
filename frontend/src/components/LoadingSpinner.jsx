import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
      <p className="text-gray-400 animate-pulse font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
