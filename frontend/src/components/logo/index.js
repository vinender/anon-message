import React from 'react';

const Logo = ({
  width = 100,
  height = 100,
  primaryColor = '#2C3E50',
  secondaryColor = '#34495E',
  accentColor = '#ECF0F1',
  accentHighlight = '#1ABC9C',
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background Circle */}
    <circle
      cx="100"
      cy="100"
      r="95"
      stroke={primaryColor}
      strokeWidth="10"
      fill={secondaryColor}
    />

    {/* Speech Bubble */}
    <path
      d="M60,70 
         h80 
         a15,15 0 0,1 15,15 
         v50 
         a15,15 0 0,1 -15,15 
         h-40 
         l-20,20 
         v-20 
         h-20 
         a15,15 0 0,1 -15,-15 
         v-50 
         a15,15 0 0,1 15,-15 
         z"
      fill={accentColor}
    />

    {/* Anonymous Mask */}
    <path
      d="M90,90 
         a10,10 0 1,0 20,0 
         a10,10 0 1,0 -20,0 
         M100,100 
         l5,5 
         M105,95 
         l-10,10"
      stroke={primaryColor}
      strokeWidth="2"
      fill="none"
    />

    {/* Text: anonmessage */}
    <text
      x="100"
      y="180"
      fontFamily="'Montserrat', sans-serif"
      fontSize="24"
      fill={accentColor}
      textAnchor="middle"
    >
      <tspan x="100" dy="0">anon</tspan>
      <tspan x="100" dy="24" fontWeight="bold">message</tspan>
    </text>
  </svg>
);

export default Logo;
