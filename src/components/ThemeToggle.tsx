"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';
import { InteractiveButton } from './ascii/InteractiveButton';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <InteractiveButton
      onClick={toggleTheme}
      variant="secondary"
      size="sm"
      className="!px-3"
    >
      {isDark ? '☀️ LIGHT' : '🌙 DARK'}
    </InteractiveButton>
  );
}