# 06 · Policy-safe automation

This is the document that decides whether StickVerse still exists in two years.

You are planning exactly the kind of channel YouTube has been removing: faceless, AI-assisted,
automated, monetised. That is allowed. What is not allowed is doing it **without adding
anything of your own**. The difference is entirely in this document.

---

## 1 · The policy, in YouTube's own words

- **15 July 2025** — YouTube renamed its "repetitious content" policy to
  **"inauthentic content"** and clarified that it covers *"content that is repetitive or
  mass-produced"*. YouTube stated this was a clarification, not a new rule: that content was
  never eligible for monetisation.
- **16 July 2026** — YouTube clarified three categories that cannot be monetised:
  1. **generic, repetitive or template-based content**,
  2. **off-putting or distressing content**,
  3. **AI personas discussing sensitive topics** such as health, finance and legal issues.
- **January 2026** — a coordinated enforcement wave removed a group of large automated
  channels: around **16 channels**, ~**35 million subscribers**, ~**4.7 billion lifetime views**,
  estimated at ~$10M/year in ads. They were removed for mass-produced content, not for using
  AI.

Meanwhile, YouTube has never banned AI. Its disclosure rules only require you to flag
**realistic** synthetic content (a real person saying something they did not say, a real place
or event altered, a realistic scene that did not happen, or AI-generated music that is the main
focus). **Clearly animated, unrealistic content — which stickman videos are — does not require
disclosure.** YouTube may still add a label automatically when it detects photorealistic AI.

So the line is not "AI or no AI". The line is:

> **Is there a human point of view, original writing and a consistent creative identity — or is
> this the same template filled with a new keyword?**

---

## 2 · The five tests a video must pass

Run this before every upload. If a video fails two, do not publish it.

### Test 1 — Could only this channel have made it?
If you swapped your character and your voice, would the video be identical to 50 others on
YouTube? Then it is a template. Your answer must be: *no, because of the argument, the
examples, the character, the recurring bits.*

### Test 2 — Is there an original point of view?
Not "original topic" — original **take**. One sentence you personally believe and would defend
in the comments. Write it at the top of the script. If you cannot, you are summarising, not
creating.

### Test 3 — Does it say something the viewer did not already know?
Ten seconds of generic motivation ("work hard, believe in yourself") is the fastest route to
demonetisation. Every video needs a mechanism, a story, or a fact with a source.

### Test 4 — Is the automation invisible?
Automation should remove *drudgery* (voice takes, captions, rendering, thumbnails), not
judgement (topic choice, script angle, fact-checking, what gets cut). If a step could publish a
video you have not watched, it is too automated.

### Test 5 — Would you put your name on it?
The creator whose name is on the channel is the one who gets struck. Watch every video end to
end before it goes public. Every single one.

---

## 3 · The StickVerse production rules

**Always**
- Write or heavily rewrite every script yourself. AI drafts, you decide.
- Use **recurring characters** with names, a look and running jokes. Characters are protectable
  IP and instantly signal "this is a channel, not a content farm".
- Cite one real source per factual claim; put it on screen and in the description.
- Keep a human editorial pass: watch, cut, reorder, add one personal line.
- Use **one consistent visual style** across the channel (this repo's styles are a good example
  of a defined grammar).
- Keep the volume sustainable: **1–2 long-form and 3–7 Shorts a week.** Not 20 uploads a day.
- Track where each asset came from (prompt, tool, licence) in a simple `assets.md`.

**Never**
- Re-upload another channel's video with a new voice or a new language.
- Generate 100 near-identical videos from one prompt template and schedule them.
- Do "AI persona gives health / financial / legal advice" formats — explicitly named in the
  2026 clarification. Educational *explainers* are fine; a fake doctor telling people what to
  take is not.
- Use real people's faces or voices without permission (deepfake/likeness rules, and in India,
  personality rights).
- Fabricate quotes, studies or news.
- Make "made for kids" content aimed at children unless you intend to comply with children's
  privacy rules — and note that advertising on kids' content is largely turned off.
- Use music you did not license. "No copyright infringement intended" is not a licence.

---

## 4 · Where automation is safe, and where it is not

| Step | Automate? | Why |
|---|---|---|
| Topic research (Studio Inspiration, Reddit threads, search suggestions) | ✅ Yes | Data gathering |
| Script **draft** | ✅ Yes | You edit it |
| Script **final** | ❌ No | This is your voice |
| Fact-checking | ❌ No | Liability lives here |
| Voiceover | ✅ Yes, with a **licensed/synthetic** voice you have rights to | Never clone a real person |
| Images / b-roll generation | ✅ Yes | Check for third-party logos, real faces |
| Captions / SRT | ✅ Yes | Then proofread names and numbers |
| Rendering / assembly | ✅ Yes | That is what this repo does |
| Thumbnail **layout** | ✅ Yes | The kit in this pack |
| Thumbnail **text/idea** | ❌ No | The click is your judgement |
| Title | ⚠️ Draft yes, final no | The title is the product |
| Uploading/scheduling | ⚠️ Only after you watch the finished file | Never auto-publish unwatched |
| Reply to comments | ❌ No | Comments are your retention signal |

A practical rule: **automate everything that happens after the creative decision, never the
decision itself.**

---

## 5 · Rights checklist for a faceless channel

- [ ] Every image: generated by you, or licensed, or public domain (keep the licence text)
- [ ] Every font: OFL/Apache or licensed (the fonts in `brand/fonts/` are OFL — safe)
- [ ] Every music track: YouTube Audio Library, or a paid licence with a saved receipt
- [ ] Every SFX: same rule
- [ ] Every voice: your own, a licensed synthetic voice, or written permission
- [ ] Every real-person reference: public figure commentary is generally fine; impersonation
      and fabricated statements are not
- [ ] Every screenshot: minimised, commented on, and necessary — not the point of the video
- [ ] Your own generated assets: keep the project files; they are your proof of creation

---

## 6 · If you get hit anyway

The order of events is usually: a video is demonetised → the channel gets a warning → a
90-day suspension → removal from YPP. Appeals are read by humans.

If it happens:

1. Do not delete the video immediately — you need it to appeal.
2. Read the exact policy cited in Studio (Community Guidelines vs YPP monetisation policy are
   different systems).
3. Write a specific appeal: what the video is, who made it, what original work it contains,
   links to your scripts and project files.
4. Fix the pattern across the channel before appealing a second time.
5. Keep publishing quality content. Panic-deleting a channel is what kills small creators.

---

## 7 · The 60-second version

- AI is allowed. **Templates at scale are not.**
- Original scripts + recurring characters + real sources = safe.
- Publish at a human pace: a handful of good videos a week.
- A human watches every video before it goes live.
- Never build a business that depends on uploads you have not personally reviewed.

Do that, and your "fully automated" channel is just a well-run studio — which is exactly what
YouTube says it wants.

---

**Next:** [`07-90-day-plan.md`](07-90-day-plan.md).
