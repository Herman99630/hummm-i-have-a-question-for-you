"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Heart, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const extraTimes = [
  "Tonight, if you're free", "This afternoon", "10 minutes later 👀", "After your last meeting",
  "The next rainy evening", "Whenever you miss me", "Our next free weekend", "Right after you say yes",
];

const activities = [
  { emoji: "🍽️", label: "Fancy dinner" }, { emoji: "🎬", label: "Movie night" },
  { emoji: "📺", label: "Netflix & chill" }, { emoji: "🌙", label: "Take a walk" },
  { emoji: "🍸", label: "Grab a drink" }, { emoji: "🎨", label: "Museum date" },
  { emoji: "🎤", label: "Karaoke for two" }, { emoji: "🌅", label: "Watch the sunset" },
];

const foods = [
  { emoji: "🥘", label: "Stir fry" }, { emoji: "🍲", label: "Hotpot" },
  { emoji: "🍣", label: "Sushi" }, { emoji: "🍝", label: "Italian" },
  { emoji: "🌮", label: "Tacos" }, { emoji: "🍜", label: "Ramen" },
  { emoji: "🥩", label: "Steak" }, { emoji: "🍕", label: "Pizza" },
  { emoji: "🍛", label: "Thai food" }, { emoji: "🍔", label: "Burgers" },
  { emoji: "🥐", label: "Cute café" }, { emoji: "🎲", label: "Surprise me" },
];

const pageTitles = [
  "Can we have a date?", "Wait… did you just say YES?!", "When can I see you?",
  "What other time can I meet you?", "What activities do you prefer?", "What should we eat tonight?", "One last look",
];

const pageTitlesZh = [
  "可以和我一起约会吗？", "等一下！你真的点了愿意吗？你真的愿意吗？！", "所以什么时候能见到你？",
  "还有什么时间可以见到你？", "我们一起去干什么？", "想吃什么呀？", "最后确认一下吧",
];

const timeZh: Record<string, string> = {
  "Tonight, if you're free": "今晚，如果你有空", "This afternoon": "今天下午", "10 minutes later 👀": "十分钟后 👀",
  "After your last meeting": "等你忙完", "The next rainy evening": "下一个下雨的晚上", "Whenever you miss me": "任何一个你想我的时候",
  "Our next free weekend": "下一个我们都有空的周末", "Right after you say yes": "就在你说愿意之后",
};

const activityZh: Record<string, string> = {
  "Fancy dinner": "吃一顿精致晚餐", "Movie night": "一起看电影", "Netflix & chill": "窝在一起追剧",
  "Take a walk": "出去散散步", "Grab a drink": "小酌一杯", "Museum date": "逛逛展览",
  "Karaoke for two": "两个人去唱K", "Watch the sunset": "一起看日落",
};

const foodZh: Record<string, string> = {
  "Stir fry": "中式小炒", "Hotpot": "火锅", "Sushi": "寿司", "Italian": "意大利菜", "Tacos": "墨西哥卷饼",
  "Ramen": "拉面", "Steak": "牛排", "Pizza": "披萨", "Thai food": "泰国菜", "Burgers": "汉堡",
  "Cute café": "去可爱的咖啡店", "Surprise me": "你来决定",
};

const copy = {
  en: {
    back: "Back", tinyQuestion: "A tiny question for you", homeSub: "I promise it’ll be worth saying yes.", yes: "YES, of course",
    no: "No", noLines: ["Ohh, you can't find me", "You can't click, right?", "Wrong place 😌", "Nice try!"],
    holdOn: "Hold on, hold on", shockCopy: "Like… you actually want to go on a date with me?? Are you sure? Are you really sure?!",
    shockWhisper: "This is your final chance to make me ridiculously happy.", yesYes: "YES YES!!!",
    pickMoment: "01 · Pick our moment", chooseDate: "Choose a date", month: "Month", day: "Day", year: "Year",
    exactTime: "What exact time can I meet you?", gettingReady: "I’ll start getting ready embarrassingly early.", confirm: "Confirm",
    justInCase: "02 · Just in case", multi: "You can always select more than one option.",
    funPart: "03 · The fun part", activitySub: "Pick every idea that sounds like us.",
    important: "04 · Most important question", foodSub: "There are no wrong answers. Except maybe “I’m not hungry.”",
    submit: "Submit", pickOne: "Pick at least one option to keep going.", confirmed: "Your date plan",
    record: "Here’s our little plan, officially on the record.", date: "Date", time: "Time", backup: "Backup moments",
    plans: "Our plans", food: "Food shortlist", final: "I can’t wait to see you.", restart: "Make another reservation",
    sendAnswers: "All picked! ❤", sending: "Saving our little plan…", sent: "All set! Your date plan is saved 💌",
    sendFailed: "It didn’t send. Please try again.", finalSub: "Your choices are saved and your little date plan is on its way. 💌", finalClose: "See you soon ❤", made: "Made with a suspicious amount of courage", am: "AM", pm: "PM",
  },
  zh: {
    back: "返回", tinyQuestion: "有一个小问题想问你", homeSub: "装作不在意，其实很期待", yes: "愿意",
    no: "不同意", noLines: ["咦，你找不到我", "点不到对吧？", "点错地方啦 😌", "想得美！"],
    holdOn: "等一下，等一下", shockCopy: "你居然真的想和我约会？？你确定吗？真的确定吗？！",
    shockWhisper: "我都做好准备你说点不要了！😭😭", yesYes: "愿意愿意！！！",
    pickMoment: "01 · 挑一个属于我们的时间", chooseDate: "选择日期", month: "月份", day: "日期", year: "年份",
    exactTime: "具体几点可以见到你？", gettingReady: "我可能会提前很久就开始准备。", confirm: "确认",
    justInCase: "02 · 以防我们忍不住想早一点见面", multi: "可以多选哦。",
    funPart: "03 · 约会的快乐环节", activitySub: "喜欢的都可以选。",
    important: "04 · 最重要的问题", foodSub: "没有错误答案，除了“我不饿”。",
    submit: "提交", pickOne: "至少选一个才可以继续哦。", confirmed: "约会计划预览",
    record: "这是我们说好的约会计划。", date: "日期", time: "时间", backup: "其他见面时间",
    plans: "约会安排", food: "想吃的东西", final: "想快点见到你！", restart: "再预约一次",
    sendAnswers: "我选好啦 ❤", sending: "正在保存我们的约会计划…", sent: "选好啦！约会计划已经保存 💌",
    sendFailed: "没有发送成功，请再试一次。", finalSub: "你的选择已经保存好，约会计划也悄悄送达啦。💌", finalClose: "好呀 ❤", made: "鼓起了很多勇气才做出来", am: "上午", pm: "下午",
  },
};

function ChoiceCard({ emoji, label, displayLabel, selected, onToggle }: { emoji?: string; label: string; displayLabel?: string; selected: boolean; onToggle: () => void }) {
  return (
    <label className={`choice-card ${selected ? "choice-card-selected" : ""}`}>
      <Checkbox checked={selected} onCheckedChange={onToggle} aria-label={label} className="choice-checkbox" />
      {emoji && <span className="text-2xl" aria-hidden="true">{emoji}</span>}
      <span>{displayLabel ?? label}</span>
      {selected && <Check className="ml-auto h-4 w-4 text-[#a80732]" />}
    </label>
  );
}

export default function DateInvitation({ invitationCode, creatorName, crushName, personalNote, initialLanguage = "zh" }: {
  invitationCode: string;
  creatorName: string;
  crushName: string;
  personalNote?: string | null;
  initialLanguage?: "en" | "zh";
}) {
  const today = new Date();
  const [language, setLanguage] = useState<"en" | "zh">(initialLanguage);
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(String(today.getDate()));
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [hour, setHour] = useState("7");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("PM");
  const [times, setTimes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [teaseIndex, setTeaseIndex] = useState(-1);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showFinal, setShowFinal] = useState(false);
  const [creatorManageUrl, setCreatorManageUrl] = useState("");
  const t = copy[language];

  const daysInMonth = useMemo(() => new Date(Number(year), Number(month), 0).getDate(), [month, year]);
  const safeDay = String(Math.min(Number(day), daysInMonth));
  const selectedDate = useMemo(() => new Date(Number(year), Number(month) - 1, Number(safeDay)).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }), [safeDay, month, year, language]);

  const toggle = (item: string, values: string[], setter: (next: string[]) => void) =>
    setter(values.includes(item) ? values.filter((value) => value !== item) : [...values, item]);

  const dodgeNo = () => {
    setTeaseIndex(Math.floor(Math.random() * t.noLines.length));
    setNoPos({ x: Math.round((Math.random() - 0.5) * 190), y: Math.round((Math.random() - 0.5) * 110) });
  };

  const canContinue = step === 3 ? times.length > 0 : step === 4 ? selectedActivities.length > 0 : step === 5 ? selectedFoods.length > 0 : true;

  const sendAnswers = async () => {
    if (sendStatus === "sending" || sendStatus === "sent") return;
    setSendStatus("sending");
    try {
      const response = await fetch(`/api/invitations/${encodeURIComponent(invitationCode)}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: `${year}-${month.padStart(2, "0")}-${safeDay.padStart(2, "0")}`,
          dateLabel: selectedDate,
          time: `${hour}:${minute} ${period}`,
          backupTimes: times,
          activities: selectedActivities,
          foods: selectedFoods,
          language,
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Submission failed");
      setSendStatus("sent");
      setShowFinal(true);
    } catch {
      setSendStatus("error");
    }
  };

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    setTeaseIndex(-1);
  }, [language]);

  useEffect(() => {
    setCreatorManageUrl(window.localStorage.getItem(`date-invite-manage:${invitationCode}`) || "");
  }, [invitationCode]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const validActivities = activities.map(item => item.label);
    const validFoods = foods.map(item => item.label);
    const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === "string");
    void Promise.resolve(context.registerTool({
      name: "complete_date_reservation",
      title: "Complete date reservation",
      description: "Choose a date, exact time, backup moments, activities, and food, then show the same confirmation displayed by the app.",
      inputSchema: {
        type: "object",
        properties: {
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
          time: { type: "string", description: "Time in h:mm AM/PM format" },
          backupTimes: { type: "array", items: { type: "string", enum: extraTimes } },
          activities: { type: "array", items: { type: "string", enum: validActivities } },
          foods: { type: "array", items: { type: "string", enum: validFoods } },
        },
        required: ["date", "time", "backupTimes", "activities", "foods"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        if (!input || typeof input !== "object") throw new Error("Reservation details are required.");
        const data = input as Record<string, unknown>;
        const dateMatch = typeof data.date === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.date);
        const timeMatch = typeof data.time === "string" && /^(1[0-2]|[1-9]):(00|15|30|45) (AM|PM)$/.exec(data.time);
        if (!dateMatch || !timeMatch || !isStringArray(data.backupTimes) || !isStringArray(data.activities) || !isStringArray(data.foods)) throw new Error("Use the supported date, time, and selection formats.");
        if (!data.backupTimes.every(item => extraTimes.includes(item)) || !data.activities.every(item => validActivities.includes(item)) || !data.foods.every(item => validFoods.includes(item))) throw new Error("One or more selections are not available.");
        setYear(dateMatch[1]); setMonth(String(Number(dateMatch[2]))); setDay(String(Number(dateMatch[3])));
        setHour(timeMatch[1]); setMinute(timeMatch[2]); setPeriod(timeMatch[3]);
        setTimes(data.backupTimes); setSelectedActivities(data.activities); setSelectedFoods(data.foods); setStep(6);
        return { status: "confirmed", date: data.date, time: data.time };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="app-shell">
      <div className="floating-heart heart-one">♥</div><div className="floating-heart heart-two">♥</div><div className="floating-heart heart-three">♥</div>
      <section className="invitation-card" aria-labelledby="page-title">
        {creatorManageUrl && <a className="creator-return-button" href={creatorManageUrl}><ArrowLeft className="h-4 w-4" /> {language === "zh" ? "返回我的结果页" : "Back to my results"}</a>}
        <button className="language-toggle" onClick={() => setLanguage(language === "en" ? "zh" : "en")} aria-label={language === "en" ? "切换到中文" : "Switch to English"}>
          <Languages className="h-4 w-4" /><span className={language === "zh" ? "active-language" : ""}>中文</span><i>/</i><span className={language === "en" ? "active-language" : ""}>EN</span>
        </button>
        {step > 1 && step < 6 && <div className="progress-row" aria-label={language === "zh" ? `第 ${step - 1} 步，共 4 步` : `Step ${step - 1} of 4`}>{[1,2,3,4].map(item => <span key={item} className={item <= step - 1 ? "progress-active" : ""} />)}</div>}
        {step > 0 && <button className={`back-button ${creatorManageUrl ? "back-button-below-owner" : ""}`} onClick={() => setStep(step - 1)} aria-label={t.back}><ArrowLeft className="h-4 w-4" /> {t.back}</button>}

        {step === 0 && <div className="landing-content">
          <span className="eyebrow"><Sparkles className="h-4 w-4" /> {t.tinyQuestion}</span>
          <h1 id="page-title">{language === "zh" ? `${crushName}，可以和我一起约会吗？` : `${crushName}, can we have a date?`}</h1>
          <p className="subtitle">{t.homeSub}</p>
          {personalNote && <p className="personal-note">“{personalNote}”<span>— {creatorName}</span></p>}
          <div className="bear-wrap"><span className="love-orbit">♥</span><Image src="/love-bear.png" alt="A cute bear holding a red heart" width={410} height={410} priority /></div>
          <div className="landing-actions">
            <Button className="primary-button" size="lg" onClick={() => setStep(1)}>{t.yes} <Heart className="h-4 w-4 fill-current" /></Button>
            <div className="no-zone"><button className="runaway-button" style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }} onMouseEnter={dodgeNo} onPointerDown={event => { event.preventDefault(); dodgeNo(); }} onFocus={dodgeNo} tabIndex={-1} aria-hidden="true">{teaseIndex < 0 ? t.no : t.noLines[teaseIndex]}</button></div>
          </div>
        </div>}

        {step === 1 && <div className="shock-content">
          <span className="shock-burst">{language === "zh" ? "天啊！" : "OMG!"}</span>
          <div className="shock-hearts" aria-hidden="true">♥ &nbsp; ♥ &nbsp; ♥</div>
          <span className="eyebrow"><Sparkles className="h-4 w-4" /> {t.holdOn}</span>
          <h1 id="page-title">{language === "zh" ? pageTitlesZh[step] : pageTitles[step]}</h1>
          <p className="shock-copy">{t.shockCopy}</p>
          <p className="shock-whisper">{t.shockWhisper}</p>
          <Button className="primary-button shock-yes" size="lg" onClick={() => setStep(2)}>{t.yesYes} <Heart className="h-4 w-4 fill-current" /></Button>
        </div>}

        {step === 2 && <div className="step-content">
          <span className="step-kicker">{t.pickMoment}</span><h1 id="page-title">{language === "zh" ? pageTitlesZh[step] : pageTitles[step]}</h1>
          <div className="date-time-grid">
            <div className="picker-panel">
              <div className="panel-heading"><CalendarDays /> {t.chooseDate}</div>
              <div className="select-row">
                <div><label>{t.month}</label><Select value={month} onValueChange={setMonth}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from({length:12},(_,i)=><SelectItem key={i+1} value={String(i+1)}>{language === "zh" ? `${i+1}月` : new Date(2024,i).toLocaleString("en-US",{month:"short"})}</SelectItem>)}</SelectContent></Select></div>
                <div><label>{t.day}</label><Select value={safeDay} onValueChange={setDay}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from({length:daysInMonth},(_,i)=><SelectItem key={i+1} value={String(i+1)}>{language === "zh" ? `${i+1}日` : i+1}</SelectItem>)}</SelectContent></Select></div>
                <div><label>{t.year}</label><Select value={year} onValueChange={setYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from({length:4},(_,i)=><SelectItem key={today.getFullYear()+i} value={String(today.getFullYear()+i)}>{language === "zh" ? `${today.getFullYear()+i}年` : today.getFullYear()+i}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="selection-preview">{selectedDate}</div>
            </div>
            <div className="picker-panel">
              <div className="panel-heading"><Clock3 /> {t.exactTime}</div>
              <div className="time-row">
                <Select value={hour} onValueChange={setHour}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from({length:12},(_,i)=><SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>)}</SelectContent></Select><span>:</span>
                <Select value={minute} onValueChange={setMinute}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["00","15","30","45"].map(value=><SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
                <Select value={period} onValueChange={setPeriod}><SelectTrigger><SelectValue>{period === "AM" ? t.am : t.pm}</SelectValue></SelectTrigger><SelectContent><SelectItem value="AM">{t.am}</SelectItem><SelectItem value="PM">{t.pm}</SelectItem></SelectContent></Select>
              </div><p className="tiny-note">{t.gettingReady}</p>
            </div>
          </div>
        </div>}

        {step === 3 && <div className="step-content"><span className="step-kicker">{t.justInCase}</span><h1 id="page-title">{language === "zh" ? pageTitlesZh[step] : pageTitles[step]}</h1><p className="subtitle">{t.multi}</p><div className="choice-grid">{extraTimes.map(label=><ChoiceCard key={label} label={label} displayLabel={language === "zh" ? timeZh[label] : label} selected={times.includes(label)} onToggle={()=>toggle(label,times,setTimes)} />)}</div></div>}
        {step === 4 && <div className="step-content"><span className="step-kicker">{t.funPart}</span><h1 id="page-title">{language === "zh" ? pageTitlesZh[step] : pageTitles[step]}</h1><p className="subtitle">{t.activitySub}</p><div className="choice-grid">{activities.map(item=><ChoiceCard key={item.label} {...item} displayLabel={language === "zh" ? activityZh[item.label] : item.label} selected={selectedActivities.includes(item.label)} onToggle={()=>toggle(item.label,selectedActivities,setSelectedActivities)} />)}</div></div>}
        {step === 5 && <div className="step-content"><span className="step-kicker">{t.important}</span><h1 id="page-title">{language === "zh" ? pageTitlesZh[step] : pageTitles[step]}</h1><p className="subtitle">{t.foodSub}</p><div className="food-grid">{foods.map(item=><ChoiceCard key={item.label} {...item} displayLabel={language === "zh" ? foodZh[item.label] : item.label} selected={selectedFoods.includes(item.label)} onToggle={()=>toggle(item.label,selectedFoods,setSelectedFoods)} />)}</div></div>}

        {step === 6 && <div className="summary-content">
          <span className="eyebrow"><Check className="h-4 w-4" /> {t.confirmed}</span><h1 id="page-title">{language === "zh" ? pageTitlesZh[step] : pageTitles[step]}</h1><p className="subtitle">{t.record}</p>
          <div className="summary-card"><div><span>{t.date}</span><strong>{selectedDate}</strong></div><div><span>{t.time}</span><strong>{hour}:{minute} {period === "AM" ? t.am : t.pm}</strong></div><div><span>{t.backup}</span><strong>{times.map(value => language === "zh" ? timeZh[value] : value).join(" · ")}</strong></div><div><span>{t.plans}</span><strong>{selectedActivities.map(value => language === "zh" ? activityZh[value] : value).join(" · ")}</strong></div><div><span>{t.food}</span><strong>{selectedFoods.map(value => language === "zh" ? foodZh[value] : value).join(" · ")}</strong></div></div>
          <Button className="primary-button submit-choice-button" size="lg" disabled={sendStatus === "sending" || sendStatus === "sent"} onClick={sendAnswers}>
            {sendStatus === "sending" ? t.sending : sendStatus === "sent" ? t.sent : t.sendAnswers}
          </Button>
          {sendStatus === "error" && <p className="tiny-note">{t.sendFailed}</p>}
          {sendStatus !== "sent" && <button className="start-over" onClick={()=>{ setSendStatus("idle"); setShowFinal(false); setStep(0); }}>{t.restart}</button>}
        </div>}

        {step > 1 && step < 6 && <div className="footer-action"><Button className="primary-button" size="lg" disabled={!canContinue} onClick={()=>setStep(step+1)}>{step===2?t.confirm:t.submit} <ArrowRight className="h-4 w-4" /></Button>{!canContinue && <p>{t.pickOne}</p>}</div>}
      </section>
      {showFinal && <div className="final-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="final-modal-title">
        <div className="final-modal-card"><div className="modal-heart-cloud" aria-hidden="true"><span>♥</span><span>♥</span><span>♥</span></div><div className="ready-check"><Heart className="fill-current" /></div><span className="eyebrow">{t.confirmed}</span><h2 id="final-modal-title">{t.final}</h2><p>{t.finalSub}</p><Button className="primary-button" size="lg" onClick={() => setShowFinal(false)}>{t.finalClose}</Button></div>
      </div>}
      <p className="made-with">{t.made} <span>♥</span></p>
    </main>
  );
}
