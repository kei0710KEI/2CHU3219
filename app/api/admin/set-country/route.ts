// /app/api/admin/set-country/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, country } = (await req.json()) as {
      userId: string;
      country: "JP" | "US" | "EU";
    };
    if (!userId || !country) throw new Error("userId and country are required");

    // user_metadata に country を入れる（JWTに載ります）
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { country } }
    );
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      user: { id: data.user?.id, user_metadata: data.user?.user_metadata },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
