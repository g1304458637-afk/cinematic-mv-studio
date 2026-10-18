# Visual language for a 9:16 code-drawn film

## 1. Composition for vertical cinema

- The frame is a column, not a cropped landscape. Use vertical lines (dome ribs, ladders, rain,
  trees, doorways) and vertical staging (high/low, above/below).
- Put the human face in the upper third and the hands/props in the lower third; the middle is for
  relation and negative space.
- Use foreground occlusion (glass, branches, pots, shoulders) to create depth. A flat mid-ground
  is the fastest route to a slide deck.
- Alternate scale: extreme wide (the world), medium (the relationship), macro (the object/choice).
  A film of only medium shots has no world; a film of only wides has no people.
- Leave active space in the direction of a look or movement, but let some compositions be
  deliberately airless when the character is trapped.

## 2. Camera grammar

Every move has a motive:
- **push** = realisation, pressure, intimacy;
- **pull** = release, isolation, aftermath;
- **drift/track** = accompany, search;
- **crane** = scale, fate, time;
- **handheld** = danger, breath, immediacy;
- **whip** = violence, interruption;
- **orbit** = relation, ritual, embrace;
- **dolly zoom** = a world changed underfoot (use once, if at all).

Avoid default slow zooms on every shot. A static camera with a moving subject is stronger than a
moving camera with a static subject. Shake is not energy; it is an accent.

## 3. Colour script

Write a table of time, place, key light, fill, dominant hue, accent, and emotional state. Keep a
small palette (5–7 colours) and let one accent carry the story (e.g. a green seed, an amber scarf,
a red signal). Cold/warm is not good/evil; it is proximity/distance, safety/exposure, memory/present.

Test the palette in greyscale: if the values collapse, the frame will read as mud on a phone.

## 4. Character design that survives code

- Build from a clear silhouette: one shape you could recognise as a black cut-out.
- Use a small number of views (front, 3/4 left/right, profile, back) and a parameterised turn,
  not a new drawing per shot.
- Give each lead a distinct proportion, posture, hair mass, coat line, and one coloured accent.
- Wardrobe continuity is a data problem: record `costume_state_id` per shot. Change clothes only at
  a story event, and show the change.
- Hands and eyes carry more emotion than a mouth. Design a hand with a readable thumb and four
  fingers; design an eye with a lid, iris, highlight and a shadow side.
- If close-up faces are not strong enough, stage the emotion in profile, shadow, hands, or a
  partial frame. Do not pretend a weak face is a strong close-up.

## 5. Painterly rendering without a paint program

A practical layered approach:
1. **ground**: paper colour + large soft washes + fibre/grain texture;
2. **mid**: shapes with two-tone shading, edge pooling, dry-brush edges;
3. **ink**: tapered contours, hatching in shadow, a few deliberate gaps;
4. **light**: one key, one fill, one rim; volumetric shafts and bloom used sparingly;
5. **atmosphere**: dust, rain, fog, particles with parallax and depth;
6. **finish**: paper grain (multiply), gentle vignette, subtle gate weave/boil, optional halation.

Use a pre-rendered texture atlas for expensive watercolour/p5.brush plates. Cache static layers;
do not recompute a background wash 24 times a second. Keep line boil at 12 fps while the camera
moves at 24 fps — this reads as hand-drawn without making the camera stutter.

## 6. Motion quality

- Animate on twos (12 fps) for character line work; interpolate camera and cloth at 24 fps.
- Use anticipation, overshoot and settle. A reach has a preparation, a contact, and a reaction.
- Add secondary motion to hair, coat hems, scarves, foliage, rain and dust.
- Use smear frames (2–3 frames) for fast actions; do not motion-blur everything.
- Keep the character's feet planted unless the story says otherwise. Sliding feet destroy weight.
- Give eyes a target and a blink pattern. A face that never blinks reads as a mask.
- If a character is a silhouette, the **pose** must do the acting: spine, shoulders, hands, head.

## 7. Transitions

Use motivated transitions: a shape match (seed → eye → sun), a colour wipe (ash → rain), a
glass shatter, a door, a hand covering the lens, a light flash. Avoid random cross-dissolves and
"film burn" overlays. A hard cut on a musical accent is usually better than a soft dissolve.

## 8. Anti-template checklist

- No more than one "floating particles" shot without a story reason.
- No zoom on a still image presented as animation.
- No lyric line illustrated by drawing the noun in the line.
- No identical chorus composition.
- No unmotivated lens flare, glitch, VHS or bloom.
- No character design change between shots without a story event.
- No scene that exists only to show off a shader.
