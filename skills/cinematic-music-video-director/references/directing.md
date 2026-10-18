# Directing a music-led short film

## 1. Start from a thesis, not a mood board

A thesis is a sentence that can be argued. Good: *"Love is not the refusal of dust; it is the
act of remembering together that turns dust into rain."* Weak: *"A cosmic, emotional journey."*
Write the anti-thesis too — the failure mode you are most likely to produce. Every major visual
choice should be defensible against the thesis.

## 2. Three concepts, genuinely different

Do not write three skins of the same idea. Vary the **engine of change**:

- a journey (someone goes somewhere and returns changed);
- a siege (someone defends a place until the cost is clear);
- a exchange (two people trade what they cannot both keep);
- a mystery (someone investigates a absence);
- a ritual (a repeated action breaks).

For each concept write: logline, world, protagonist want/need, antagonist pressure, midpoint
reversal, crisis, climax, ending image, and the five or six visual motifs that will recur.
Score 1–5 on lyric/music fit, story completeness, emotional impact, originality, code
feasibility, long-form watchability. Select with reasons, not vibes.

**Reject:** a concept whose only conflict is "the world is ending"; a concept that needs dialogue
to be understood; a concept whose climax is a visual effect rather than a choice.

## 3. Director score

Write `director_score.json` before shot code. Minimum fields:

- `thesis`, `anti_thesis`;
- `emotional_curve`: time, state, energy 0–1;
- `visual_chapters`: id, name, start/end, world, palette, space, camera, grammar;
- `contrast_map`: from → to, and the intended contrast;
- `motifs`: id, meaning, first appearance, payoff;
- `cast`: want, need, arc;
- `shot_roles`: shot id, role, incoming handoff, outgoing handoff, contrast;
- `sound_visual_map`: music event → visual event;
- `recurring_visual_events`: where a motif returns and how it changes.

## 4. Visual duration is not music duration

A 12-second musical window is not permission for four story beats. Approximate minimum readable
times (adapt, don't worship):

| beat | minimum |
|---|---:|
| discovery / notice | 4–6 s |
| check / reaction | 2–4 s |
| reveal of an object | 2–4 s |
| impact / hit | 0.8–2 s |
| emotional turn | 1.5–3 s |
| wide resolution | 3–5 s |

If a shot needs three ideas, split it. If a shot needs one idea but 8 seconds, give it a camera
move or a change of light — not a new plot beat.

## 5. Shot duties and handoffs

Every shot answers:
1. What does the audience know at the end that they did not know at the start?
2. What does this shot hand to the next (object, look, motion, colour, sound)?
3. What is the contrast from the previous shot (near/far, still/moving, warm/cold, alone/together)?
4. Why is it this length, at this point in the song?

If the answer to 1 is "nothing", the shot is atmosphere. Atmosphere is allowed, but budget it.

## 6. Rhythm

- Cut on musical events, not on a metronome. A cut 0.2 s before a downbeat can feel like breath;
  a cut 0.4 s after can feel late.
- Vary shot length. A run of 3.0 s shots is a rhythm; a run of identical 5.0 s shots is a sampler.
- Put the longest hold before or after the biggest musical event, not on it, unless the hold is
  the event (a face, a choice).
- Let the chorus change the film's **state**, not just its energy. If chorus 2 looks like chorus 1,
  the story has not moved.
- Do not put the quiet resolution shot over the strongest vocal line.

## 7. Openings and endings

An opening shot should contain the film in miniature: the world, the absence, the motif. An ending
should answer the question the opening asked, with a changed image. Avoid:
- a fade to black after the last chord that lasts longer than the music;
- a title card that explains the film;
- a "it was all a dream" reversal;
- a final VFX shot with no human consequence.

If the song has a long instrumental outro, the coda must **do** something: time passing, a new
ordinary life, a seed, a return, a cost. Not a slow pull-back on the same frame.

## 8. Working with collaborators or subagents

One owner for the director score, timeline and shared rig. Parallel workers may own separate
shots only after those interfaces are frozen. Give each worker: the style guide, character sheet,
timeline slice, shot card, render command, and QC checklist. Require a contact sheet back, not a
promise.
