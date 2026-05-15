// src/components/ProtectedRoute.tsx
/**
 * Wraps any route that requires authentication.
 * If no token is present → redirect to /login, preserving the attempted URL
 * so the user lands back here after signing in.
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'

interface Props { children: React.ReactNode }

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation()

  if (!authService.isAuthenticated()) {
    // Pass the attempted path so LoginPage can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}