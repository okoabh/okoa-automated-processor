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

  const getVariantClasses = () => {
    if (disabled) {
      return 'text-okoa-fg-muted dark:text-japanese-neutral-warm-gray border-okoa-fg-muted dark:border-japanese-neutral-warm-gray bg-okoa-bg-tertiary dark:bg-japanese-ink-sumi opacity-60';
    }

    const variants = {
      primary: isHovered 
        ? 'text-japanese-ink-light dark:text-japanese-paper-warm bg-okoa-interactive-primary dark:bg-japanese-earth-bamboo border-okoa-interactive-primary dark:border-japanese-earth-bamboo shadow-moderate transform -translate-y-0.5' 
        : 'text-okoa-interactive-primary dark:text-japanese-earth-bamboo border-okoa-interactive-primary dark:border-japanese-earth-bamboo hover:bg-okoa-interactive-primary dark:hover:bg-japanese-earth-bamboo hover:text-japanese-ink-light dark:hover:text-japanese-paper-warm bg-okoa-bg-secondary dark:bg-japanese-ink-sumi',
      secondary: isHovered 
        ? 'text-japanese-ink-light dark:text-japanese-paper-warm bg-okoa-interactive-secondary dark:bg-japanese-earth-tea border-okoa-interactive-secondary dark:border-japanese-earth-tea shadow-moderate transform -translate-y-0.5' 
        : 'text-okoa-interactive-secondary dark:text-japanese-earth-tea border-okoa-interactive-secondary dark:border-japanese-earth-tea hover:bg-okoa-interactive-secondary dark:hover:bg-japanese-earth-tea hover:text-japanese-ink-light dark:hover:text-japanese-paper-warm bg-okoa-bg-secondary dark:bg-japanese-ink-sumi',
      danger: isHovered 
        ? 'text-japanese-ink-light dark:text-japanese-paper-warm bg-okoa-fg-primary dark:bg-japanese-ink-charcoal border-okoa-fg-primary dark:border-japanese-ink-charcoal shadow-moderate transform -translate-y-0.5' 
        : 'text-okoa-fg-primary dark:text-japanese-paper-warm border-okoa-fg-primary dark:border-japanese-neutral-warm-gray hover:bg-okoa-fg-primary dark:hover:bg-japanese-ink-charcoal hover:text-japanese-ink-light dark:hover:text-japanese-paper-warm bg-okoa-bg-secondary dark:bg-japanese-ink-sumi',
      success: isHovered 
        ? 'text-japanese-ink-light dark:text-japanese-paper-warm bg-japanese-earth-sage dark:bg-japanese-earth-sage border-japanese-earth-sage dark:border-japanese-earth-sage shadow-moderate transform -translate-y-0.5' 
        : 'text-japanese-earth-sage dark:text-japanese-earth-sage border-japanese-earth-sage dark:border-japanese-earth-sage hover:bg-japanese-earth-sage dark:hover:bg-japanese-earth-sage hover:text-japanese-ink-light dark:hover:text-japanese-paper-warm bg-okoa-bg-secondary dark:bg-japanese-ink-sumi'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    return sizes[size];
  };

  const buttonClasses = `
    font-mono border-thin transition-all duration-normal ease-out cursor-pointer select-none
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${isPressed ? 'scale-95' : 'scale-100'}
    ${disabled ? 'cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const content = (
    <span className="flex items-center justify-center">
      {isHovered && !disabled && (
        <span className="mr-2 animate-pulse">{'>'}</span>
      )}
      {children}
      {isHovered && !disabled && (
        <span className="ml-2 animate-pulse">{'<'}</span>
      )}
    </span>
  );

  const commonProps = {
    className: buttonClasses,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onTouchStart: handleMouseDown,
    onTouchEnd: handleMouseUp,
    style: {
      textShadow: isHovered ? '0 0 10px currentColor' : undefined,
    }
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

// ASCII Menu Component with Interactive Options
export function ASCIIMenu({ 
  title, 
  options, 
  className = '' 
}: { 
  title: string; 
  options: Array<{ label: string; href?: string; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'success' }>;
  className?: string;
}) {
  return (
    <div className={`font-mono bg-okoa-bg-secondary border border-okoa-fg-primary p-4 shadow-subtle ${className}`}>
      <div className="text-center text-okoa-fg-primary font-bold mb-4 border-b border-okoa-fg-secondary border-opacity-30 pb-2">
        ═══ {title.toUpperCase()} ═══
      </div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <InteractiveButton
            key={index}
            href={option.href}
            onClick={option.onClick}
            variant={option.variant || 'primary'}
            className="w-full text-center"
          >
            [{String(index + 1).padStart(2, '0')}] {option.label}
          </InteractiveButton>
        ))}
      </div>
    </div>
  );
}

// Clickable ASCII Status Indicator
export function InteractiveStatus({ 
  status, 
  onClick, 
  className = '' 
}: { 
  status: 'online' | 'offline' | 'processing' | 'warning' | 'error';
  onClick?: () => void;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = () => {
    const configs = {
      online: { 
        icon: '●', 
        color: 'text-japanese-earth-sage', 
        hoverColor: 'text-okoa-interactive-primary',
        glow: 'shadow-subtle'
      },
      offline: { 
        icon: '○', 
        color: 'text-okoa-fg-muted', 
        hoverColor: 'text-okoa-fg-secondary',
        glow: 'shadow-subtle'
      },
      processing: { 
        icon: '◐', 
        color: 'text-japanese-earth-tea', 
        hoverColor: 'text-okoa-interactive-secondary',
        glow: 'shadow-subtle'
      },
      warning: { 
        icon: '⚠', 
        color: 'text-japanese-earth-beige', 
        hoverColor: 'text-okoa-interactive-tertiary',
        glow: 'shadow-subtle'
      },
      error: { 
        icon: '✗', 
        color: 'text-okoa-fg-primary', 
        hoverColor: 'text-okoa-fg-secondary',
        glow: 'shadow-subtle'
      }
    };
    return configs[status];
  };

  const config = getStatusConfig();

  return (
    <span
      className={`
        font-mono cursor-pointer transition-all duration-200 select-none inline-flex items-center
        ${isHovered ? config.hoverColor : config.color}
        ${isHovered ? `shadow-subtle scale-110` : 'scale-100'}
        ${status === 'processing' ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        textShadow: undefined,
      }}
    >
      <span className="text-base mr-2">{config.icon}</span>
      <span className="capitalize">{status}</span>
      {isHovered && <span className="ml-2 animate-bounce">{'→'}</span>}
    </span>
  );
}

// Interactive ASCII Progress Bar
export function InteractiveProgressBar({
  label,
  progress,
  onClick,
  className = ''
}: {
  label: string;
  progress: number;
  onClick?: () => void;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`
        font-mono cursor-pointer transition-all duration-200 p-2 border border-transparent rounded
        ${isHovered ? 'border-okoa-interactive-primary bg-okoa-bg-tertiary shadow-subtle' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-2">
        <span className={`text-okoa-fg-primary ${isHovered ? 'text-okoa-interactive-primary' : ''} font-mono`}>
          {isHovered ? '>' : ''} {label}:
        </span>
        <div className="flex-1">
          <span className="text-okoa-fg-secondary font-mono">[</span>
          <span className={`${isHovered ? 'text-okoa-interactive-primary animate-pulse' : 'text-okoa-fg-primary'} font-mono`}>
            {'█'.repeat(Math.floor(progress * 20 / 100))}
          </span>
          <span className="text-okoa-fg-muted font-mono">
            {'░'.repeat(20 - Math.floor(progress * 20 / 100))}
          </span>
          <span className="text-okoa-fg-secondary font-mono">]</span>
        </div>
        <span className={`${isHovered ? 'text-okoa-interactive-primary font-medium' : 'text-okoa-fg-primary'} font-mono`}>
          {Math.round(progress)}%
        </span>
        {isHovered && <span className="text-okoa-interactive-primary animate-pulse font-mono">{'←'}</span>}
      </div>
    </div>
  );
}