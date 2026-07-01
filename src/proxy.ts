import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Enforce disabled users can't access the app
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, disabled')
      .eq('id', user.id)
      .single()

    if (profile?.disabled) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth/login?reason=disabled', request.url))
    }

    // Server-side admin gate
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Server-side shop owner gate — admins can also access /shop
    if (request.nextUrl.pathname.startsWith('/shop')) {
      if (profile?.role !== 'shop_owner' && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } else {
    // Unauthenticated users cannot access admin, watchlist, or shop portal
    const protectedPaths = ['/admin', '/watchlist', '/shop']
    if (protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
