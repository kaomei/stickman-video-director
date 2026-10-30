# A6 confirmed finishing standard

Only A6 uses this profile. Preserve A1–A5/B voice, caption and rendering rules. This standard captures the approved complete film, not its story-specific text, actor's outfit, shot timings or personal watermark.

## Independent narration and edit

- Use **Gemini TTS · Puck** for default English narration, with a curious, exploratory storytelling delivery: engaged and inviting, clear natural articulation, slight intrigue on the opening question, unhurried realization at the payoff. Avoid a flat announcer, exaggerated advertising, growling or forced whispers. Keep one continuous narrator identity across the film. Honor explicit language/voice choices.
- Check available Gemini TTS model/access and billing at execution time; record the exact model ID, Puck voice ID, direction, request settings and source hash. Do not infer a model ID from the voice name or silently switch to Volcengine/OS TTS/Renoise narration. If Gemini access is missing, explain that setup at the narration step and ask before any substitution.
- Keep voice generation separate from Flow/Renoise acting clips; put no narration text in those motion prompts. Generate one complete voice track when supported, or check any necessary joins. Reuse an already approved complete track by fingerprint when wording is unchanged. For a new voice, approve an audition before full synthesis; reuse an existing accepted audition rather than repeating it automatically.
- Edit clips to the actual voice timing. Use distinct, causally meaningful shots and prop/pose continuity; do not recycle an earlier reaction merely to fill the ending. Avoid freezing, arbitrary retiming or speeding the narrator just to fill the nominal runtime. Review source motion; leave natural facial expressions intact, with no mouth repaint/masking.
- Add original/licensed motivated coffee splashes, taps, footsteps, falls or impacts where the current action calls for them. Keep narration foregrounded. The approved mix measured about **−15.7 LUFS integrated / −1.4 dBTP**; use roughly −16 LUFS and a ≤−1 dBTP ceiling as practical checks, not a command to reprocess approved audio. No mandatory music bed; never promise Content-ID clearance.

## Title and captions

For the approved **720×1280 / 24fps** vertical layout (scale for other resolutions/ratios and visually verify safe zones):

- Title: persist in the upper-left. Use a short story-specific title, usually two lines. All text and the small vertical rule are **pure white**, with a subtle dark outline; no yellow title words. Reference placement: rule x45–49, y88–182; text starts around x62, y88. First line DIN Condensed Bold ~35px; emphasis line Impact ~46px. Rephrase/wrap an overlong title without changing its meaning; never shrink to illegibility or reuse the sample story title for a different film.
- Captions: Impact ~76px, cream-white base, ~5px black outline and a slight hard shadow. Bottom-centered, normally one or two semantic lines, within a ~618px text width and a caption layer y965–1215. No heavy panel. Adapt size/placement for other ratios; preserve phrases, names, phrasal verbs and number/unit groups rather than mechanically slicing into fixed word counts.
- English display text is **ALL CAPS**; spelling/content must still match the approved narration. Align phrase cues and word timings to the actual voice. The currently spoken word uses warm amber; other words remain white. Use positional word alignment so repeated words in a cue are not all highlighted together. Briefly hold the last word through short pauses, without changing cue timing.
- On phrase entry only, use a restrained three-frame pop at 24fps: 0.92 → 1.04 → 1.01 → 1.00. Scale the ~125ms entry duration for other frame rates; no repeated strobing or per-frame flicker. Preserve reading time rather than making every word a separate flashing card.
- No `@CrazyKaomei`, personal handle, logo or creator watermark is added by default. A separate explicit branding request is a scoped revision, not part of the A6 production preset.

## Reusable local finishing

Use [a6_finish.py](../scripts/a6_finish.py) for deterministic title/caption packaging of an **already edited clean picture** plus its **approved synchronized final audio mix**. The Agent prepares the montage/mix and corrected alignment first; this tool does not generate clips, synthesize speech, choose semantic breaks, add SFX or read a private Flow URL. Do not claim this helper alone is the entire two-provider workflow.

Requirements: Python 3 with Pillow, FFmpeg/FFprobe, and Impact plus DIN Condensed Bold (or an explicitly approved close substitute passed by path). Do not install dependencies or substitute a different look silently. No external generation calls are made by this renderer.

Create a project-specific JSON manifest; resolve media/font paths relative to that manifest:

```json
{
  "picture": "picture.mp4",
  "audio": "approved-mix.m4a",
  "script": "What if tomorrow started again?",
  "title": ["WHAT IF", "TOMORROW REPEATED?"],
  "cues": [
    {"start": 0.0, "end": 0.7, "text": "WHAT IF"},
    {"start": 0.7, "end": 2.6, "text": "TOMORROW\nSTARTED AGAIN?"}
  ],
  "words": [
    {"start": 0.0, "end": 0.3, "word": "What"},
    {"start": 0.3, "end": 0.7, "word": "if"},
    {"start": 0.7, "end": 1.3, "word": "tomorrow"},
    {"start": 1.3, "end": 1.9, "word": "started"},
    {"start": 1.9, "end": 2.6, "word": "again"}
  ]
}
```

Optional `caption_font` / `title_font` paths set available approved fonts. Correct ASR against the approved script before using its word timings; normalize spoken numerals in the alignment (e.g. ASR `10` → script `ten`) rather than silently changing displayed script content. The example is a schema illustration, not timing for a different story.

```sh
python3 scripts/a6_finish.py --config project/a6-finish.json --validate-only
python3 scripts/a6_finish.py --config project/a6-finish.json --output-dir project/a6-final
```

The output directory must be new or empty. The renderer validates script/cue/word content and non-overlapping times, draws the approved profile, copies AAC mix packets unchanged (or encodes a non-AAC mix once), exports plain SRT, proof frames/contact sheet and a hash/probe/decode manifest. SRT carries text/timing, not the burned-in highlight/pop styling. Retain source hashes, provider/job IDs and the project checkpoint. Do not rerender unchanged accepted clips or regenerate voice to revise only a title/caption.

Before delivery, check speech timing/content, semantic breaks, title contrast, mobile readability/safe areas, action continuity and mix. Decode/metadata checks and proof sheets are not substitutes for listening/motion review; report what was actually checked. Deliver the real MP4; no automatic upload or publication.
