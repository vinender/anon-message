import React from 'react';

const WeighingScale = ({ positiveMessages, negativeMessages }) => {
  const totalMessages = positiveMessages + negativeMessages;
  const balance =
    totalMessages === 0
      ? 0
      : (positiveMessages - negativeMessages) / totalMessages;

  // Invert the rotation angle to correct the direction
  const maxRotation = 15;
  const rotationAngle = -balance * maxRotation;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80">
        {/* Scale Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-800 rounded-t-md"></div>

        {/* Scale Pillar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          {/* Scale Beam */}
          <div
            className="relative w-72 h-2 bg-gray-600 transition-transform duration-700 ease-in-out"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: 'center bottom',
            }}
          >
            {/* Left Chain and Pan */}
            <div
              className="absolute left-0 top-0 w-0.5 h-24 bg-gray-500 flex flex-col items-center"
              style={{
                transform: `translateX(50%)`,
              }}
            >
              {/* Left Pan */}
              <div
                className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg mt-2 transition-transform duration-700 ease-in-out"
              >
                {positiveMessages}
              </div>
            </div>

            {/* Right Chain and Pan */}
            <div
              className="absolute right-0 top-0 w-0.5 h-24 bg-gray-500 flex flex-col items-center"
              style={{
                transform: `translateX(-50%)`,
              }}
            >
              {/* Right Pan */}
              <div
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg mt-2 transition-transform duration-700 ease-in-out"
              >
                {negativeMessages}
              </div>
            </div>
          </div>

          {/* Pillar */}
          <div className="w-2 h-36 bg-gray-800"></div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          Positive Messages: {positiveMessages}
        </p>
        <p className="text-lg font-semibold">
          Negative Messages: {negativeMessages}
        </p>
      </div>
    </div>
  );
};

export default WeighingScale;
