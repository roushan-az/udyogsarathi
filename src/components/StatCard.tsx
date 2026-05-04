// src/components/StatCard.tsx
import type { ReactNode } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subLabel,
  icon,
  trend,
  accentColor = '#f97316',
  delay = 0,
}) => {
  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      style={{
        background: `linear-gradient(135deg, rgba(21,34,64,0.9) 0%, rgba(11,18,34,0.95) 100%)`,
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Accent glow top-right */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
          }}
        >
          {icon}
        </div>

        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 6,
              background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              fontSize: 11,
              fontWeight: 600,
              color: isPositive ? '#22c55e' : '#ef4444',
            }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#f0f4ff',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>

      {/* Label */}
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
        {label}
      </div>

      {/* Sub label */}
      {subLabel && (
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            marginTop: 4,
          }}
        >
          {subLabel}
        </div>
      )}

      {/* Bottom accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}60, transparent)`,
        }}
      />
    </motion.div>
  );
};