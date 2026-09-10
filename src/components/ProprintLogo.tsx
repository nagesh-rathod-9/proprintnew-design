import React from 'react';

interface ProprintLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}

export const ProprintLogo: React.FC<ProprintLogoProps> = ({
  size = 'md',
  variant = 'light',
  showTagline = true,
  className = '',
}) => {
  const sizeConfigs = {
    sm: {
      width: 'w-[85px]',
      height: 'h-auto',
    },
    md: {
      width: 'w-[120px]',
      height: 'h-auto',
    },
    lg: {
      width: 'w-[155px]',
      height: 'h-auto',
    },
    xl: {
      width: 'w-[190px]',
      height: 'h-auto',
    },
  };

  const config = sizeConfigs[size];

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      <img
        src="/logo.png"
        alt="Proprint - For All Printing Solutions"
        className={`${config.width} ${config.height} object-contain`}
        draggable={false}
      />
    </div>
  );
};