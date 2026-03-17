import { NextResponse } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/shipments',
  '/wallet',
  '/settings',
  '/notifications',
]

const authRoutes = ['/login']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('vio_biz_token')?.value

  if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }

  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
