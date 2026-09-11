"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Copy, Heart, Languages, Mail, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "zh" | "en";
type Stage = "cover" | "details" | "verify" | "ready";

const text = {
  zh: {
    coverEyebrow: "想约就约，怂的部分交给我", coverTitle: "你负责心动，我负责开口", coverBridge: "有点紧张，但还是想约你——没关系，我陪你", coverBody: "填名字和邮箱，生成一条专属链接。TA 选日期、活动、想吃的，答案只发给你。", coverCta: "别怂，开始吧", noAccount: "不用注册，验证邮箱就好", howOne: "写下心意", howTwo: "发给 TA", howThree: "收到答案",
    eyebrow: "别犹豫，勇敢追爱！", title: "创建你的约会邀请", subtitle: "填好信息，获得一条只属于你们的链接。对方提交后，完整答案会自动发到你的邮箱。",
    creator: "你的名字", creatorPlaceholder: "比如：Herman", crush: "TA 的名字", crushPlaceholder: "比如：小可爱", email: "你的邮箱", emailHint: "验证码、邀请链接和最终报告都会发到这里。",
    note: "想对 TA 说的话（选填）", notePlaceholder: "悄悄写一句只给 TA 看的话…", sendCode: "发送验证码", sending: "正在发送…",
    verifyTitle: "查看你的邮箱", verifyBody: "输入刚刚收到的六位验证码。它在 10 分钟内有效。", code: "六位验证码", create: "创建专属邀请", creating: "正在创建…", back: "修改信息",
    ready: "邀请已经准备好啦！", readyBody: "先复制下面的邀请链接发给 TA，发完再回来进入你的私密结果页。", invite: "第一步 · 复制给 TA 的邀请链接", copy: "复制邀请链接", copied: "已复制，可以发给 TA 啦", preview: "先自己预览一下", goResults: "我已经发给 TA，进入我的结果页", resultsHint: "复制邀请链接后，就可以安全进入自己的结果页。", again: "再创建一个",
  },
  en: {
    coverEyebrow: "Want the date? I’ll handle the nerves.", coverTitle: "You bring the butterflies. I’ll ask the question.", coverBridge: "A little nervous, but you still want to ask—don’t worry, I’ve got you.", coverBody: "Add your names and email to create a private link. They pick the date, activities, and food—their answer goes only to you.", coverCta: "Be brave—let’s do it", noAccount: "No account needed. Just verify your email.", howOne: "Write it down", howTwo: "Send it to them", howThree: "Get their answer",
    eyebrow: "A little courage goes a long way", title: "Create your date invitation", subtitle: "Make a private link for someone special. Their answers will be saved and emailed directly to you.",
    creator: "Your name", creatorPlaceholder: "e.g. Herman", crush: "Their name", crushPlaceholder: "e.g. Cutie", email: "Your email", emailHint: "Your code, links, and final report will be sent here.",
    note: "A note for them (optional)", notePlaceholder: "Write something only they will see…", sendCode: "Send verification code", sending: "Sending…",
    verifyTitle: "Check your email", verifyBody: "Enter the six-digit code we just sent. It is valid for 10 minutes.", code: "Six-digit code", create: "Create my invitation", creating: "Creating…", back: "Edit details",
    ready: "Your invitation is ready!", readyBody: "First copy the invitation and send it to your date. Then come back here to open your private results page.", invite: "Step 1 · Invitation link for them", copy: "Copy invitation", copied: "Copied—ready to send", preview: "Preview the invitation", goResults: "I've sent it—open my results page", resultsHint: "Copy the invitation first, then you can safely open your own results page.", again: "Create another",
  },
};

export default function CreatorPage() {
  const [language, setLanguage] = useState<Language>("zh");
  const [stage, setStage] = useState<Stage>("cover");
  const [form, setForm] = useState({ creatorName: "", crushName: "", email: "", personalNote: "", code: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [links, setLinks] = useState({ inviteUrl: "", manageUrl: "" });
  const [copied, setCopied] = useState(false);
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
      setLinks(data);
      try {
        const inviteCode = new URL(data.inviteUrl).pathname.split("/").filter(Boolean).pop();
        if (inviteCode) window.localStorage.setItem(`date-invite-manage:${inviteCode}`, data.manageUrl);
      } catch { /* The emailed private link remains the fallback. */ }
      setStage("ready");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); } finally { setBusy(false); }
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(links.inviteUrl); setCopied(true);
  }

  return <main className="app-shell creator-shell"><div className="floating-heart heart-one">♥</div><div className="floating-heart heart-two">♥</div>
    <section className="invitation-card creator-card">
      <button className="language-toggle" onClick={() => setLanguage(language === "zh" ? "en" : "zh")}><Languages className="h-4 w-4"/><span className={language === "zh" ? "active-language" : ""}>中文</span><i>/</i><span className={language === "en" ? "active-language" : ""}>EN</span></button>
      {stage === "cover" && <div className="creator-cover"><div className="creator-cover-copy"><span className="eyebrow"><Sparkles className="h-4 w-4"/> {t.coverEyebrow}</span><h1>{t.coverTitle}</h1><p className="cover-bridge">{t.coverBridge}</p><p className="subtitle">{t.coverBody}</p><Button className="primary-button cover-cta" size="lg" onClick={()=>setStage("details")}>{t.coverCta} <ArrowRight className="h-4 w-4"/></Button><p className="cover-safe-note">✓ {t.noAccount}</p></div><div className="cover-visual"><span className="love-orbit">♥</span><Image src="/love-bear.png" alt="A cute bear holding a red heart" width={410} height={410} priority/></div><div className="cover-steps"><div><strong>①</strong><span>{t.howOne}</span></div><div><strong>②</strong><span>{t.howTwo}</span></div><div><strong>③</strong><span>{t.howThree}</span></div></div></div>}
      {stage === "details" && <><span className="eyebrow"><Sparkles className="h-4 w-4"/> {t.eyebrow}</span><h1>{t.title}</h1><p className="subtitle creator-subtitle">{t.subtitle}</p>
        <form className="creator-form" onSubmit={requestCode}><div className="form-grid"><label className="form-field"><span>{t.creator}</span><input value={form.creatorName} onChange={(e)=>update("creatorName",e.target.value)} placeholder={t.creatorPlaceholder} maxLength={80}/></label><label className="form-field"><span>{t.crush}</span><input value={form.crushName} onChange={(e)=>update("crushName",e.target.value)} placeholder={t.crushPlaceholder} maxLength={80}/></label></div>
          <label className="form-field"><span>{t.email}</span><input type="email" value={form.email} onChange={(e)=>update("email",e.target.value)} placeholder="you@example.com" autoComplete="email"/><small>{t.emailHint}</small></label>
          <label className="form-field"><span>{t.note}</span><textarea value={form.personalNote} onChange={(e)=>update("personalNote",e.target.value)} placeholder={t.notePlaceholder} maxLength={500} rows={3}/><small>{form.personalNote.length}/500</small></label>
          {error && <p className="form-error">{error}</p>}<Button className="primary-button creator-submit" size="lg" disabled={busy}>{busy ? t.sending : t.sendCode} <Mail className="h-4 w-4"/></Button><button type="button" className="text-button form-back" onClick={()=>setStage("cover")}>{language === "zh" ? "返回介绍页" : "Back to introduction"}</button>
        </form></>}
      {stage === "verify" && <div className="stage-panel"><div className="mail-orbit">💌</div><span className="eyebrow"><Mail className="h-4 w-4"/> {form.email}</span><h1>{t.verifyTitle}</h1><p className="subtitle">{t.verifyBody}</p><form className="creator-form verify-form" onSubmit={createInvitation}><label className="form-field"><span>{t.code}</span><input className="code-input" inputMode="numeric" autoComplete="one-time-code" value={form.code} onChange={(e)=>update("code",e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="••••••" maxLength={6}/></label>{error && <p className="form-error">{error}</p>}<Button className="primary-button creator-submit" size="lg" disabled={busy || form.code.length !== 6}>{busy ? t.creating : t.create} <Heart className="h-4 w-4 fill-current"/></Button><button type="button" className="text-button" onClick={()=>{setStage("details");setError("");}}>{t.back}</button></form></div>}
      {stage === "ready" && <div className="stage-panel"><div className="ready-check"><Check/></div><span className="eyebrow">{form.creatorName} + {form.crushName}</span><h1>{t.ready}</h1><p className="subtitle">{t.readyBody}</p><div className="link-list"><div className={`link-card invitation-link-card ${copied ? "link-card-copied" : ""}`}><span>{t.invite}</span><code>{links.inviteUrl}</code><button onClick={copyInvite}><Copy/>{copied ? t.copied : t.copy}</button></div></div><div className="ready-actions"><a className={`primary-link result-link ${copied ? "" : "result-link-disabled"}`} href={copied ? links.manageUrl : undefined} aria-disabled={!copied}>{t.goResults} <Heart/></a>{!copied && <p className="tiny-note ready-hint">{t.resultsHint}</p>}<a className="preview-link" href={`${links.inviteUrl}?preview=1`} target="_blank" rel="noreferrer">{t.preview} <Send/></a></div><button className="text-button" onClick={()=>{setStage("details");setCopied(false);setForm({creatorName:"",crushName:"",email:"",personalNote:"",code:""});setLinks({inviteUrl:"",manageUrl:""});}}>{t.again}</button></div>}
    </section><p className="made-with">Made with courage <span>♥</span></p></main>;
}
