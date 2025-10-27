'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/authContext'
import Navbar from '@/components/Navbar'
import { useEffect } from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) return <div className="text-center py-20">Đang tải...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <Navbar currentPath={pathname} />
      <main className="p-6">{children}</main>
    </div>
  )
}
