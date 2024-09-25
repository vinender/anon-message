import React from 'react';

const WeighingScale = ({ positiveMessages, negativeMessages }) => {
  const totalMessages = positiveMessages + negativeMessages;
  const balance =
    totalMessages === 0
      ? 0
      : (positiveMessages - negativeMessages) / totalMessages;

  // The rotation angle will be between -15deg to 15deg
  const maxRotation = 15;
  const rotationAngle = balance * maxRotation;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80">
        {/* Scale Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-800 rounded-t-md"></div>

        {/* Scale Pillar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-36 bg-gray-800"></div>

        {/* Scale Beam */}
        <div
          className="absolute bottom-40 left-1/2 transform origin-bottom-center w-72 h-2 bg-gray-600 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-50%) rotate(${rotationAngle}deg)`,
          }}
        >
          {/* Left Chain */}
          <div
            className="absolute left-1/4 top-0 w-0.5 h-16 bg-gray-500 transform origin-top transition-transform duration-700 ease-in-out"
            style={{
              transform: `rotate(${-rotationAngle}deg)`,
            }}
          ></div>

          {/* Right Chain */}
          <div
            className="absolute right-1/4 top-0 w-0.5 h-16 bg-gray-500 transform origin-top transition-transform duration-700 ease-in-out"
            style={{
              transform: `rotate(${-rotationAngle}deg)`,
            }}
          ></div>

          {/* Left Pan */}
          <div
            className="absolute left-1/4 top-16 transform -translate-x-1/2 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateY(${rotationAngle}px)`,
            }}
          >
            {positiveMessages}
          </div>

          {/* Right Pan */}
          <div
            className="absolute right-1/4 top-16 transform translate-x-1/2 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateY(${-rotationAngle}px)`,
            }}
          >
            {negativeMessages}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">Positive Messages: {positiveMessages}</p>
        <p className="text-lg font-semibold">Negative Messages: {negativeMessages}</p>
      </div>
    </div>
  );
};

export default WeighingScale;
