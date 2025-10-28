'use client';

import React from 'react';

interface TimelineConnectorProps {
  totalVisits: number;
}

/**
 * Visual timeline connector line
 * Displays vertical line connecting visits in an episode
 */
export const TimelineConnector: React.FC<TimelineConnectorProps> = ({ totalVisits }) => {
  if (totalVisits <= 1) return null;

  return (
    <div
      className="absolute left-3 top-8 bottom-8 w-0.5 bg-gray-300 z-0"
      style={{ left: '12px' }}
    />
  );
};
