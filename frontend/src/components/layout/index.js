// src/components/layout.jsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Boxes } from "../ui/background-boxes";

export function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Boxes Background */}
      <Boxes className="z-0" />

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
