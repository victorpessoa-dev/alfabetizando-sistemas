import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ["/auth/login", "/auth/error"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Se não há usuário, redireciona para login
  if (!user && !publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Se está logado e tenta acessar login, redireciona para dashboard
  if (user && pathname === "/auth/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png).*)"],
}
