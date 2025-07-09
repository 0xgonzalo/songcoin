import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
      <p className="text-red-200">{error}</p>
    </div>
  );
} 