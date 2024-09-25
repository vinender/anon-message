// components/ui/GridBackground.jsx

import React from "react";

export function GridBackground({ children }) {

  return (

    <div className="bg-grid-white min-h-screen">
      {children}
    </div>
    
  );
}
