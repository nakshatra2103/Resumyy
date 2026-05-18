import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({ className, children, animate = true, delay = 0 }) => {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay }
  } : {};

  return (
    <Component 
      className={cn(
        'bg-[#121218] border border-white/5 rounded-2xl relative overflow-hidden',
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
};
