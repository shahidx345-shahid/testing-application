/**
 * Authentication Guard HOC
 * Protects pages from unauthenticated access
 * Redirects to login if no auth token found
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedPageProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedPage({ children, fallback }: ProtectedPageProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify token is valid with backend - checks httpOnly cookie automatically
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies in request
        })

        if (!response.ok) {
          // Token invalid, redirect to login
          router.push('/auth/login')
          return
        }

        // Token valid, allow access
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show fallback while loading - keep it minimal for speed
  if (isLoading) {
    return fallback || null
  }

  // Only show content if authenticated
  return isAuthenticated ? <>{children}</> : null
}

export default ProtectedPage
