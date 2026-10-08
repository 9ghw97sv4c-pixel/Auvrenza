import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ valid: false, message: "Enter a code." }, { status: 400 });

  const supabase = createClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();

  if (!coupon) return NextResponse.json({ valid: false, message: "Invalid or expired code." });

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: "This code has expired." });
  }
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return NextResponse.json({ valid: false, message: "This code has reached its usage limit." });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    message: coupon.type === "percent" ? `${coupon.value}% off applied.` : `$${coupon.value} off applied.`,
  });
}
