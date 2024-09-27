import React from "react";
import { GridBackground } from "../ui/grid-background";

export function Layout({ children }) {
  return (
    <GridBackground>
      {children}
    </GridBackground>
  );
}
