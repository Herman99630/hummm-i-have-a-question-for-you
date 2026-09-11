import { NextResponse } from "next/server";
import { getAppUrl, getEmailFrom, getMailer } from "@/lib/mailer";
import { cleanText, createManageToken, createPublicCode, escapeHtml, isValidEmail, normalizeEmail, safeHashEqual, sha256 } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const language = body.language === "en" ? "en" : "zh";
    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    const creatorName = cleanText(body.creatorName, 80);
    const crushName = cleanText(body.crushName, 80);
    const personalNote = cleanText(body.personalNote, 500);
    const code = cleanText(body.code, 6);
    if (!isValidEmail(email) || !creatorName || !crushName || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: language === "zh" ? "请检查姓名、邮箱和六位验证码。" : "Check the names, email, and six-digit code." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: verification } = await supabase.from("email_verifications").select("*").eq("email", email).is("verified_at", null).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!verification || verification.attempts >= 10) return NextResponse.json({ error: language === "zh" ? "验证码已失效，请重新获取。" : "That code has expired. Request a new one." }, { status: 400 });

    if (!safeHashEqual(verification.code_hash, sha256(code))) {
      await supabase.from("email_verifications").update({ attempts: verification.attempts + 1 }).eq("id", verification.id);
      return NextResponse.json({ error: language === "zh" ? "验证码不正确。" : "That code is not correct." }, { status: 400 });
    }

    const verifiedAt = new Date().toISOString();
    await supabase.from("email_verifications").update({ verified_at: verifiedAt }).eq("id", verification.id);
    const publicCode = createPublicCode();
    const manageToken = createManageToken();
    const { error } = await supabase.from("invitations").insert({
      public_code: publicCode, manage_token_hash: sha256(manageToken), creator_name: creatorName,
      crush_name: crushName, creator_email: email, language, personal_note: personalNote || null,
      email_verified_at: verifiedAt,
    });
    if (error) throw error;

    const appUrl = getAppUrl();
    const inviteUrl = `${appUrl}/invite/${publicCode}`;
    const manageUrl = `${appUrl}/manage/${manageToken}`;
    const subject = language === "zh" ? "你的专属约会邀请已准备好 💌" : "Your private date invitation is ready 💌";
    const html = language === "zh"
      ? `<div style="font-family:Arial,sans-serif;color:#54172a"><h1>邀请做好啦！</h1><p>发给 ${escapeHtml(crushName)}：<a href="${inviteUrl}">${inviteUrl}</a></p><p><strong>仅你可看的结果页：</strong> <a href="${manageUrl}">${manageUrl}</a></p><p>请保存结果页链接，不要发给对方。</p></div>`
      : `<div style="font-family:Arial,sans-serif;color:#54172a"><h1>Your invitation is ready!</h1><p>Send this to ${escapeHtml(crushName)}: <a href="${inviteUrl}">${inviteUrl}</a></p><p><strong>Your private results page:</strong> <a href="${manageUrl}">${manageUrl}</a></p><p>Save the results link and do not share it with your date.</p></div>`;
    getMailer().emails.send({ from: getEmailFrom(), to: email, subject, html }).catch((mailError) => console.error("ready-email", mailError));
    return NextResponse.json({ inviteUrl, manageUrl });
  } catch (error) {
    console.error("create-invitation", error);
    return NextResponse.json({ error: "创建邀请失败，请稍后再试。" }, { status: 500 });
  }
}
