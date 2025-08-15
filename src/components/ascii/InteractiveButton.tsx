"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface InteractiveButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function InteractiveButton({
  children,
  href,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false
}: InteractiveButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: 'var(--figma-cream)',
        color: 'var(--figma-gray)',
        border: '1px solid var(--figma-beige)',
        opacity: 0.6,
        cursor: 'not-allowed'
      };
    }

    const baseStyle = {
      fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", Menlo, "Courier New", monospace',
      border: '1px solid',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
      padding: size === 'sm' ? '4px 8px' : size === 'lg' ? '12px 24px' : '8px 16px',
      transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      width: '100%',
      display: 'block',
      textAlign: 'center' as const,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: isHovered ? 'var(--figma-brown-accent)' : 'var(--figma-cream-light)',
        color: isHovered ? 'var(--figma-cream-lightest)' : 'var(--figma-brown-accent)',
        borderColor: 'var(--figma-brown-accent)',
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: isHovered ? 'var(--figma-beige)' : 'var(--figma-cream-lightest)',
        color: isHovered ? 'var(--figma-text-dark)' : 'var(--figma-gray-medium)',
        borderColor: 'var(--figma-beige)',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: isHovered ? 'var(--figma-brown-accent)' : 'var(--figma-cream-light)',
      color: isHovered ? 'var(--figma-cream-lightest)' : 'var(--figma-brown-accent)',
      borderColor: 'var(--figma-brown-accent)',
    };
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const content = (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </span>
  );

  const commonProps = {
    style: getButtonStyle(),
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onTouchStart: handleMouseDown,
    onTouchEnd: handleMouseUp,
  };

  if (disabled) {
    return <div {...commonProps}>{content}</div>;
  }

  if (href) {
    return (
      <Link href={href} {...commonProps}>
        {content}
      </Link>
    );
  }

  return (
    <button {...commonProps} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}