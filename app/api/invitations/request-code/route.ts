import { NextResponse } from "next/server";
import { getEmailFrom, getMailer } from "@/lib/mailer";
import { createVerificationCode, isValidEmail, normalizeEmail, sha256 } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    const language = body.language === "en" ? "en" : "zh";
    if (!isValidEmail(email)) return NextResponse.json({ error: language === "zh" ? "请输入正确的邮箱。" : "Enter a valid email." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: latest } = await supabase.from("email_verifications").select("created_at").eq("email", email).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latest && Date.now() - new Date(latest.created_at).getTime() < 60_000) {
      return NextResponse.json({ error: language === "zh" ? "请等一分钟再重新发送。" : "Please wait one minute before trying again." }, { status: 429 });
    }

    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
    const { data: verification, error } = await supabase.from("email_verifications").insert({ email, code_hash: sha256(code), expires_at: expiresAt }).select("id").single();
    if (error) throw error;

    const subject = language === "zh" ? `${code} 是你的约会邀请验证码` : `${code} is your date invitation code`;
    const html = language === "zh"
      ? `<div style="font-family:Arial,sans-serif;color:#54172a"><h1>你的验证码是 ${code}</h1><p>它将在 10 分钟后失效。只有你本人可以使用这个验证码创建邀请。</p></div>`
      : `<div style="font-family:Arial,sans-serif;color:#54172a"><h1>Your code is ${code}</h1><p>It expires in 10 minutes. Only use it to create your own invitation.</p></div>`;
    const { error: mailError } = await getMailer().emails.send({ from: getEmailFrom(), to: email, subject, html });
    if (mailError) {
      await supabase.from("email_verifications").delete().eq("id", verification.id);
      throw mailError;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("request-code", error);
    return NextResponse.json({ error: "验证码暂时发送失败，请稍后再试。" }, { status: 500 });
  }
}
