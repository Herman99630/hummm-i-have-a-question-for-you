import { notFound } from "next/navigation";
import { activityZh, foodZh, timeZh } from "@/lib/options";
import { sha256 } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();
  const { data: invitation } = await supabase.from("invitations").select("id,creator_name,crush_name,language,status,created_at,answered_at").eq("manage_token_hash", sha256(token)).maybeSingle();
  if (!invitation) notFound();
  const { data: response } = await supabase.from("responses").select("answers,submitted_at,report_email_sent_at").eq("invitation_id", invitation.id).maybeSingle();
  const zh = invitation.language === "zh";
  const answers = response?.answers as { dateLabel?: string; date?: string; time?: string; backupTimes?: string[]; activities?: string[]; foods?: string[] } | undefined;
  const localize = (items: string[] | undefined, map: Record<string, string>) => (items || []).map((item) => zh ? map[item] || item : item).join(" · ") || "—";

  return <main className="app-shell creator-shell"><section className="invitation-card creator-card">
    <span className="eyebrow">♥ {zh ? "你的私密结果页" : "Your private results"}</span>
    <h1>{response ? (zh ? `${invitation.crush_name} 回复啦！` : `${invitation.crush_name} replied!`) : (zh ? "正在等待心动回应" : "Waiting for a lovely reply")}</h1>
    {!response ? <div className="empty-state"><div className="mail-orbit">💌</div><p className="subtitle">{zh ? `把邀请链接发给 ${invitation.crush_name}。对方提交后，完整答案会出现在这里，也会发到你的邮箱。` : `Send the invitation link to ${invitation.crush_name}. Their answer will appear here and arrive by email.`}</p><p className="tiny-note">{zh ? "请保存这个页面的链接，它就是你的查看凭证。" : "Save this page URL—it is your private access key."}</p></div>
      : <><p className="subtitle">{zh ? "这是你们的约会计划，正式记录在案。" : "Your date plan, officially on the record."}</p><div className="summary-card report-card">
        <div><span>{zh ? "日期" : "Date"}</span><strong>{answers?.dateLabel || answers?.date || "—"}</strong></div>
        <div><span>{zh ? "具体时间" : "Exact time"}</span><strong>{answers?.time || "—"}</strong></div>
        <div><span>{zh ? "其他见面时间" : "Backup moments"}</span><strong>{localize(answers?.backupTimes, timeZh)}</strong></div>
        <div><span>{zh ? "约会活动" : "Activities"}</span><strong>{localize(answers?.activities, activityZh)}</strong></div>
        <div><span>{zh ? "想吃的东西" : "Food"}</span><strong>{localize(answers?.foods, foodZh)}</strong></div>
      </div><div className="final-message">♥ {zh ? "想快点见到你！" : "I can’t wait to see you."}</div><p className="tiny-note centered-note">{response.report_email_sent_at ? (zh ? "报告也已发送到你的邮箱。" : "This report was also sent to your email.") : (zh ? "答案已安全保存。" : "The answer is safely saved.")}</p></>}
  </section></main>;
}
