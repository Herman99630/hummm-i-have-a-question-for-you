"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, Heart, Languages, Mail, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "zh" | "en";
type Stage = "details" | "verify" | "ready";

const text = {
  zh: {
    eyebrow: "替朋友，也替自己勇敢一次", title: "创建你的约会邀请", subtitle: "填好信息，获得一条只属于你们的链接。对方提交后，完整答案会自动发到你的邮箱。",
    creator: "你的名字", creatorPlaceholder: "比如：Herman", crush: "TA 的名字", crushPlaceholder: "比如：小可爱", email: "你的邮箱", emailHint: "验证码、邀请链接和最终报告都会发到这里。",
    note: "想对 TA 说的话（选填）", notePlaceholder: "悄悄写一句只给 TA 看的话…", sendCode: "发送验证码", sending: "正在发送…",
    verifyTitle: "查看你的邮箱", verifyBody: "输入刚刚收到的六位验证码。它在 10 分钟内有效。", code: "六位验证码", create: "创建专属邀请", creating: "正在创建…", back: "修改信息",
    ready: "邀请已经准备好啦！", readyBody: "把第一条链接发给 TA；第二条是你自己的私密结果页，请不要发给别人。", invite: "发给 TA 的邀请链接", manage: "你自己的私密结果页", copy: "复制", copied: "已复制", preview: "先自己预览一下", again: "再创建一个",
  },
  en: {
    eyebrow: "A little courage goes a long way", title: "Create your date invitation", subtitle: "Make a private link for someone special. Their answers will be saved and emailed directly to you.",
    creator: "Your name", creatorPlaceholder: "e.g. Herman", crush: "Their name", crushPlaceholder: "e.g. Cutie", email: "Your email", emailHint: "Your code, links, and final report will be sent here.",
    note: "A note for them (optional)", notePlaceholder: "Write something only they will see…", sendCode: "Send verification code", sending: "Sending…",
    verifyTitle: "Check your email", verifyBody: "Enter the six-digit code we just sent. It is valid for 10 minutes.", code: "Six-digit code", create: "Create my invitation", creating: "Creating…", back: "Edit details",
    ready: "Your invitation is ready!", readyBody: "Send the first link to your date. Keep the second results link private—it is only for you.", invite: "Invitation link for them", manage: "Your private results page", copy: "Copy", copied: "Copied", preview: "Preview the invitation", again: "Create another",
  },
};

export default function CreatorPage() {
  const [language, setLanguage] = useState<Language>("zh");
  const [stage, setStage] = useState<Stage>("details");
  const [form, setForm] = useState({ creatorName: "", crushName: "", email: "", personalNote: "", code: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [links, setLinks] = useState({ inviteUrl: "", manageUrl: "" });
  const [copied, setCopied] = useState<"invite" | "manage" | "">("");
  const t = text[language];

  useEffect(() => { document.documentElement.lang = language === "zh" ? "zh-CN" : "en"; }, [language]);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function requestCode(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!form.creatorName.trim() || !form.crushName.trim() || !form.email.trim()) throw new Error(language === "zh" ? "请把姓名和邮箱填写完整。" : "Please complete both names and your email.");
      const response = await fetch("/api/invitations/request-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, language }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setStage("verify");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); } finally { setBusy(false); }
  }

  async function createInvitation(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/invitations/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, language }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setLinks(data); setStage("ready");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); } finally { setBusy(false); }
  }

  async function copyLink(kind: "invite" | "manage", value: string) {
    await navigator.clipboard.writeText(value); setCopied(kind); window.setTimeout(() => setCopied(""), 1600);
  }

  return <main className="app-shell creator-shell"><div className="floating-heart heart-one">♥</div><div className="floating-heart heart-two">♥</div>
    <section className="invitation-card creator-card">
      <button className="language-toggle" onClick={() => setLanguage(language === "zh" ? "en" : "zh")}><Languages className="h-4 w-4"/><span className={language === "zh" ? "active-language" : ""}>中文</span><i>/</i><span className={language === "en" ? "active-language" : ""}>EN</span></button>
      {stage === "details" && <><span className="eyebrow"><Sparkles className="h-4 w-4"/> {t.eyebrow}</span><h1>{t.title}</h1><p className="subtitle creator-subtitle">{t.subtitle}</p>
        <form className="creator-form" onSubmit={requestCode}><div className="form-grid"><label className="form-field"><span>{t.creator}</span><input value={form.creatorName} onChange={(e)=>update("creatorName",e.target.value)} placeholder={t.creatorPlaceholder} maxLength={80}/></label><label className="form-field"><span>{t.crush}</span><input value={form.crushName} onChange={(e)=>update("crushName",e.target.value)} placeholder={t.crushPlaceholder} maxLength={80}/></label></div>
          <label className="form-field"><span>{t.email}</span><input type="email" value={form.email} onChange={(e)=>update("email",e.target.value)} placeholder="you@example.com" autoComplete="email"/><small>{t.emailHint}</small></label>
          <label className="form-field"><span>{t.note}</span><textarea value={form.personalNote} onChange={(e)=>update("personalNote",e.target.value)} placeholder={t.notePlaceholder} maxLength={500} rows={3}/><small>{form.personalNote.length}/500</small></label>
          {error && <p className="form-error">{error}</p>}<Button className="primary-button creator-submit" size="lg" disabled={busy}>{busy ? t.sending : t.sendCode} <Mail className="h-4 w-4"/></Button>
        </form></>}
      {stage === "verify" && <div className="stage-panel"><div className="mail-orbit">💌</div><span className="eyebrow"><Mail className="h-4 w-4"/> {form.email}</span><h1>{t.verifyTitle}</h1><p className="subtitle">{t.verifyBody}</p><form className="creator-form verify-form" onSubmit={createInvitation}><label className="form-field"><span>{t.code}</span><input className="code-input" inputMode="numeric" autoComplete="one-time-code" value={form.code} onChange={(e)=>update("code",e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="••••••" maxLength={6}/></label>{error && <p className="form-error">{error}</p>}<Button className="primary-button creator-submit" size="lg" disabled={busy || form.code.length !== 6}>{busy ? t.creating : t.create} <Heart className="h-4 w-4 fill-current"/></Button><button type="button" className="text-button" onClick={()=>{setStage("details");setError("");}}>{t.back}</button></form></div>}
      {stage === "ready" && <div className="stage-panel"><div className="ready-check"><Check/></div><span className="eyebrow">{form.creatorName} + {form.crushName}</span><h1>{t.ready}</h1><p className="subtitle">{t.readyBody}</p><div className="link-list"><div className="link-card"><span>{t.invite}</span><code>{links.inviteUrl}</code><button onClick={()=>copyLink("invite",links.inviteUrl)}><Copy/>{copied === "invite" ? t.copied : t.copy}</button></div><div className="link-card private-link"><span>{t.manage}</span><code>{links.manageUrl}</code><button onClick={()=>copyLink("manage",links.manageUrl)}><Copy/>{copied === "manage" ? t.copied : t.copy}</button></div></div><a className="primary-link" href={links.inviteUrl} target="_blank" rel="noreferrer">{t.preview} <Send/></a><button className="text-button" onClick={()=>{setStage("details");setForm({creatorName:"",crushName:"",email:"",personalNote:"",code:""});setLinks({inviteUrl:"",manageUrl:""});}}>{t.again}</button></div>}
    </section><p className="made-with">Made with courage <span>♥</span></p></main>;
}
