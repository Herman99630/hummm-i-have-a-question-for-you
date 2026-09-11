import { NextResponse } from "next/server";
import { activities, activityZh, extraTimes, foods, foodZh, timeZh } from "@/lib/options";
import { getAppUrl, getEmailFrom, getMailer } from "@/lib/mailer";
import { escapeHtml } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function validChoices(value: unknown, allowed: string[]) {
  return Array.isArray(value) && value.length > 0 && value.length <= allowed.length && value.every((item) => typeof item === "string" && allowed.includes(item));
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const body = await request.json();
    const date = typeof body.date === "string" ? body.date : "";
    const dateLabel = typeof body.dateLabel === "string" ? body.dateLabel.slice(0, 100) : date;
    const time = typeof body.time === "string" ? body.time : "";
    const language = body.language === "zh" ? "zh" : "en";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(1[0-2]|[1-9]):(00|15|30|45) (AM|PM)$/.test(time)
      || !validChoices(body.backupTimes, extraTimes) || !validChoices(body.activities, activities) || !validChoices(body.foods, foods)) {
      return NextResponse.json({ error: language === "zh" ? "请完整选择约会信息。" : "Please complete every section." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: invitation } = await supabase.from("invitations").select("id,creator_name,crush_name,creator_email,language,status,expires_at,manage_token_hash").eq("public_code", code).maybeSingle();
    if (!invitation || new Date(invitation.expires_at).getTime() < Date.now()) return NextResponse.json({ error: language === "zh" ? "这个邀请已经失效。" : "This invitation has expired." }, { status: 410 });
    if (invitation.status !== "pending") return NextResponse.json({ error: language === "zh" ? "这个邀请已经提交过啦。" : "This invitation has already been answered." }, { status: 409 });

    const answers = { date, dateLabel, time, backupTimes: body.backupTimes, activities: body.activities, foods: body.foods, language };
    const { data: responseRow, error: insertError } = await supabase.from("responses").insert({ invitation_id: invitation.id, answers }).select("id").single();
    if (insertError) {
      if (insertError.code === "23505") return NextResponse.json({ error: language === "zh" ? "这个邀请已经提交过啦。" : "This invitation has already been answered." }, { status: 409 });
      throw insertError;
    }
    await supabase.from("invitations").update({ status: "answered", answered_at: new Date().toISOString() }).eq("id", invitation.id);

    const isZh = invitation.language === "zh";
    const localize = (items: string[], map: Record<string, string>) => items.map((item) => isZh ? map[item] || item : item).join(" · ");
    const rows = [
      [isZh ? "日期" : "Date", dateLabel], [isZh ? "具体时间" : "Exact time", time],
      [isZh ? "其他可见时间" : "Other available times", localize(body.backupTimes, timeZh)],
      [isZh ? "约会活动" : "Activities", localize(body.activities, activityZh)],
      [isZh ? "想吃的东西" : "Food", localize(body.foods, foodZh)],
    ].map(([label, value]) => `<tr><td style="padding:10px;color:#9a6270;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px;color:#54172a;font-weight:700">${escapeHtml(value)}</td></tr>`).join("");
    const subject = isZh ? `${invitation.crush_name} 已经回答了你的约会邀请 💌` : `${invitation.crush_name} answered your date invitation 💌`;
    const html = `<div style="font-family:Arial,sans-serif;color:#54172a;max-width:640px"><h1>${isZh ? "好消息，约会有回应啦！" : "Good news—your date replied!"}</h1><table style="width:100%;background:#fff7f4;border-radius:16px">${rows}</table><p style="margin-top:24px">${isZh ? "完整结果也已经安全保存在你的私密结果页。" : "The full answer is also saved on your private results page."}</p><p><a href="${getAppUrl()}" style="color:#a80732">herman99.click</a></p></div>`;
    let emailSent = false;
    try {
      const { error: mailError } = await getMailer().emails.send({ from: getEmailFrom(), to: invitation.creator_email, subject, html });
      if (mailError) await supabase.from("responses").update({ report_email_error: String(mailError.message || mailError) }).eq("id", responseRow.id);
      else {
        emailSent = true;
        await supabase.from("responses").update({ report_email_sent_at: new Date().toISOString(), report_email_error: null }).eq("id", responseRow.id);
      }
    } catch (mailError) {
      await supabase.from("responses").update({ report_email_error: mailError instanceof Error ? mailError.message : String(mailError) }).eq("id", responseRow.id);
    }

    return NextResponse.json({ ok: true, emailSent });
  } catch (error) {
    console.error("respond-invitation", error);
    return NextResponse.json({ error: "提交失败，请稍后再试。" }, { status: 500 });
  }
}
