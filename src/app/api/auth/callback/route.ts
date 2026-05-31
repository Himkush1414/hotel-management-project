import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error("Unexpected auth callback error:", error);
    return NextResponse.redirect(`${origin}/login?error=unexpected`);
  }
}
