import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader = ({ text = "Please wait..." }: LoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-xl bg-card/80 shadow-xl ring-1 ring-border backdrop-blur-md">
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Pulsing outer circle */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000"></div>
          
          {/* Spinning outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          
          {/* Inner static dot */}
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"></div>
        </div>
        
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-medium text-foreground tracking-wide uppercase">Loading</p>
          <p className="text-xs text-muted-foreground animate-pulse">{text}</p>
        </div>
      </div>
    </div>
  );
};
