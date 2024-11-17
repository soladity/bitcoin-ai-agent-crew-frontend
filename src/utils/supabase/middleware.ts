import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If trying to access admin route
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (userError || !user) {
        // If no user, redirect to login
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Check user role in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.role !== "Admin") {
        // If not admin, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Regular route protection
    if (request.nextUrl.pathname.startsWith("/dashboard") && userError) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Add chat to protected route
    if (request.nextUrl.pathname.startsWith("/chat") && (userError || !user)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/public-crew") && (userError || !user)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (request.nextUrl.pathname === "/" && !userError) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
