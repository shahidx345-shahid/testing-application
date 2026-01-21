/**
 * Authentication Guard HOC
 * Protects pages from unauthenticated access
 * Redirects to login if no auth token found
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { API } from '@/lib/constants'

// Lazy load chat widget to reduce initial bundle size
const SupportChatWidget = dynamic(
  () => import('@/components/support-chat-widget').then(mod => mod.SupportChatWidget),
  { ssr: false }
)

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
        const token = localStorage.getItem('token');

        if (!token) {
          console.log('No token found in localStorage');
          router.push('/auth/login');
          return;
        }

        // Verify token is valid with backend
        try {
          const response = await fetch(`${API.BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            console.log('Token verification failed:', response.status);
            localStorage.removeItem('token');
            router.push('/auth/login')
            return
          }

          // Token valid, allow access
          setIsAuthenticated(true)
        } catch (err) {
          console.error('Token verification error:', err);
          // If verification fails due to connection error, redirect to login is safer
          localStorage.removeItem('token');
          router.push('/auth/login');
        }

      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show fallback while loading
  if (isLoading) {
    return fallback || null
  }

  // Only show content if authenticated
  return isAuthenticated ? (
    <>
      {children}
      <SupportChatWidget />
    </>
  ) : null
}

export default ProtectedPage
