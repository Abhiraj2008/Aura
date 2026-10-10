import React from 'react';

interface FluidPlayingIndicatorProps {
  className?: string;
  barColor1?: string;
  barColor2?: string;
  barColor3?: string;
  barColor4?: string;
}

export const FluidPlayingIndicator: React.FC<FluidPlayingIndicatorProps> = ({
  className = '',
  barColor1 = 'bg-[#e76f51]',
  barColor2 = 'bg-[#e9c46a]',
  barColor3 = 'bg-[#2a9d8f]',
  barColor4 = 'bg-[#f4a261]'
}) => {
  return (
    <div className={`flex items-end space-x-0.5 h-4 select-none ${className}`}>
      <span className={`w-1 rounded-full ${barColor1} fluid-eq-bar-1`}></span>
      <span className={`w-1 rounded-full ${barColor2} fluid-eq-bar-2`}></span>
      <span className={`w-1 rounded-full ${barColor3} fluid-eq-bar-3`}></span>
      <span className={`w-1 rounded-full ${barColor4} fluid-eq-bar-4`}></span>
    </div>
  );
};

