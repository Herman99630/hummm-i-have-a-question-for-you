import { notFound } from "next/navigation";
import DateInvitation from "@/components/date-invitation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data } = await getSupabaseAdmin().from("invitations").select("public_code,creator_name,crush_name,language,personal_note,status,expires_at").eq("public_code", code).maybeSingle();
  if (!data) notFound();

  const expired = new Date(data.expires_at).getTime() < Date.now();
  if (expired || data.status !== "pending") {
    return <main className="app-shell"><section className="invitation-card compact-card"><div className="empty-state"><span className="shock-burst">💌</span><h1>{data.language === "zh" ? "这个邀请已经完成啦" : "This invitation is complete"}</h1><p className="subtitle">{data.language === "zh" ? "它已经被回答，或者已经过期。" : "It has already been answered or has expired."}</p></div></section></main>;
  }

  return <DateInvitation invitationCode={data.public_code} creatorName={data.creator_name} crushName={data.crush_name} personalNote={data.personal_note} initialLanguage={data.language === "en" ? "en" : "zh"} />;
}
