import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

const ADMIN_PATHS = [
  '/dashboard', '/staff', '/attendance', '/rooms', '/guests',
  '/bookings', '/billing', '/expenses', '/analytics', '/notifications', '/settings',
]

const PUBLIC_PATHS = [
  '/login', '/forgot-password', '/reset-password',
  '/api/auth/callback', '/api/webhooks/razorpay',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return supabaseResponse
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  const role = profile.role

  if (isAdminPath(pathname)) {
    const allowedRoles = ['admin', 'manager', 'receptionist']
    if (!allowedRoles.includes(role)) {
      const portalUrl = request.nextUrl.clone()
      portalUrl.pathname = '/portal'
      return NextResponse.redirect(portalUrl)
    }
  }

  if (pathname === '/') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = ['admin', 'manager', 'receptionist'].includes(role)
      ? '/dashboard'
      : '/portal'
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
