#!/usr/bin/env python3
"""Build the frame-accurate EDL and the human storyboard from one shot table.

All times are snapped to the 24 fps frame grid.  The last shot is extended to
cover the full audio duration (ceil), so there is no black tail.
"""
import json, math
from pathlib import Path

FPS = 24
DURATION = 232.595
TOTAL_FRAMES = math.ceil(DURATION * FPS)  # 5583

# id, start, end, section, lyric refs, size, composition, environment, action,
# expression, camera, transition_in, transition_out, emotion, function, implementation, complexity
S = [
("S01",0.00,6.40,"intro",[],"EWS","green point on lower third, huge negative sky","ash sea, cliff, distant dome",
 "Nothing moves except ash drifting right-to-left and a faint green pulse at the dome. A dead pylon creaks.",
 "none","extremely slow lateral drift, 24mm equivalent","fade in from paper black","dissolve on a dust gust",
 "numb, vast","establish scale and the single living point","set_ashwide; cached far/mid layers; 220 dust motes; paper grain",3),
("S02",6.40,10.10,"intro",[],"WS","ark crosses the top third; a thin falling line cuts the frame","night sky, ark silhouette, ash clouds",
 "The ark's lights crawl like a slow whale. A pod detaches, its ember trail drawing a vertical line toward the cliff.",
 "none","locked wide, slight handheld breath","cut on a low piano note","match cut: line becomes the window frame",
 "distant, mythic","introduce the ark and the falling visitor","set_arksky; ark as layered silhouette + window lights; ember trail shader-ish stroke",3),
("S03",10.10,12.72,"intro",[],"ECU","dust grain in lower third, hand enters from top","windowsill, macro dust, a green spore",
 "A dust grain trembles, splits, reveals a green spore. Mu's fingers enter and cup it; her fingernails are cracked.",
 "wonder, caution","macro slow push","cut","ink bleed into interior",
 "a small life is noticed","macro image that makes dust potential life; introduces Mu's hand","set_macro; particle close-up; soft DOF; hand insert rig",4),
("S04",12.72,17.60,"verse1",["L01"],"MS","Mu at left third, seedling at right; tall dome ribs","orchard interior, empty pots, hanging lamp",
 "Mu waters the seedling with an eyedropper. One drop hangs, falls. She wipes condensation from a leaf.",
 "tired, tender","slow push from MS to MCU","ink bleed","cut on the drop",
 "routine as grief","introduce Mu, the seedling and the ritual","set_orchard; mu rig idle/reach; water drop fx; lamp light pool",4),
("S05",17.60,22.20,"verse1",["L02"],"CU","tally marks fill frame; her hand at bottom","glass wall, chalk tally marks, condensation",
 "Her hand adds one mark to 2,190 others. The chalk slips. She steadies it, finishes the mark, presses her palm to the glass.",
 "numb, determined","static CU, slight handheld","cut","match cut: palm to glass reflection",
 "years of waiting made physical","reveal the cost of her waiting without exposition","set_orchard; tally texture cached; hand rig; chalk particle",3),
("S06",22.20,27.05,"verse1",["L02","L03"],"MCU","profile at left, photograph in frame edge","orchard interior, cracked pane, old photo, paper crane",
 "She climbs the ladder, sees the photo tucked in the frame: two children, one paper crane. She almost touches it; the ark's shadow passes.",
 "memory, ache","slow drift right, rack focus from glass to photo","cut","shadow wipe",
 "the boy is a memory, not a stranger","plant the photo/crane mystery","set_orchard; insert photo; crane prop; rack focus via blur layers",4),
("S07",27.05,32.90,"verse1",["L03"],"WS","dome low, ark huge above, Mu tiny on ladder","orchard interior looking up through dome",
 "The ark passes; its shadow sweeps the plants. Every leaf leans toward the light. One leaf detaches and lands on her shoulder.",
 "awe, loneliness","low angle, slow tilt up, lens flare","cut","cut on leaf landing",
 "cosmic scale vs domestic care","the ark is both hope and threat","set_orchard; dome skylight; ark overlay; leaf particle; god rays",4),
("S08",32.90,39.16,"verse1",["L04"],"MCU","Mu centered low, seedling foreground","orchard, sapling, paper wish",
 "She ties a paper wish to the sapling: a drawing of two cranes. She whispers. The paper trembles in the draft.",
 "fragile hope","slow push to CU on hands","cut","whip to exterior on the pod's sonic boom",
 "her wish is a physical object","make the wish concrete before it is interrupted","set_orchard; mu rig kneel; paper wish; crane drawing; shallow DOF",4),
("S09",39.16,45.65,"pre1",["L05"],"WS","dome lower right, pod trail upper left","cliff exterior at dusk, storm wall, orchard glow",
 "Dusk. The orchard glows. The pod's ember trail grows. Mu runs out of the dome, scarf whipping.",
 "alarm, hope","handheld wide, tracking right","whip","cut on a gust",
 "hope arrives as danger","launch the inciting event","set_cliff; dusk palette; mu run cycle; ember trail; wind fx",4),
("S10",45.65,52.43,"pre1",["L06"],"MS","Mu on cliff edge at left, sky at right","cliff edge, wind, scarf, distant pod",
 "She shields her eyes. The pod tumbles, fires a retro-burn, disappears behind the ridge. Her scarf tears free.",
 "fear, exhilaration","handheld MS, slight push","cut","match cut: scarf to smoke",
 "she chooses to move toward the unknown","the 'wave/hold/let go' hand motif begins","set_cliff; mu rig; cloth sim on scarf; smoke; pod sprite",4),
("S11",52.43,57.04,"pre1",["L07"],"WS","ridge line diagonal, impact at right third","ridge, crash site, dust wave",
 "Impact. A wall of dust and glass sprays toward camera. Mu drops behind a rock; the lantern goes out.",
 "shock","locked wide, impact shake 3 frames","cut","dust wipe",
 "violence of arrival","raise the stakes physically","set_ridge; impact fx; dust wall; debris; camera shake",4),
("S12",57.04,61.45,"pre1",["L08"],"MCU","Mu low left, flame at center, figure far right","ridge, wreck, lantern",
 "She relights the lantern. In the dust, a figure crawls from the wreck and collapses. She lifts a pruning hook.",
 "fear, resolve","handheld, slow push, lantern flicker","dust settle","hard cut on chorus",
 "she chooses to help or hide","end act I on a decision","set_ridge; mu rig; chen collapse rig; lantern light; dust",4),
("S13",61.45,64.88,"chorus1",["L09"],"MS","door frame, two bodies, green interior beyond","orchard door, storm outside",
 "She drags Chen through the door. His cracked mask hisses. His hand leaves a dark smear on the glass.",
 "urgency, tenderness","handheld tracking, low angle","hard cut","cut on the mask crack",
 "the intruder becomes a body in her care","chorus 1 begins with physical action","set_orchard_door; drag rig; mask prop; smear decal; storm bg",5),
("S14",64.88,68.00,"chorus1",["L10"],"CU","Chen's face lower third, Mu's hands top","orchard floor, mask off, scar, crane",
 "She removes the mask. Recognition: the scar through his brow, the paper crane in his collar. Her hands stop.",
 "shock, grief","static CU, rack focus from scar to crane","cut","match cut: crane to her eye",
 "he is the boy she lost","the recognition beat; no dialogue","set_orchard; chen face rig; mask; crane; blink/tear fx",5),
("S15",68.00,74.00,"chorus1",["L11"],"overhead","bodies among pots, seedling between them","orchard floor, plants leaning in",
 "Overhead: she lays him among the pots. The seedling's leaves turn toward him. Her tears fall on his cheek; he does not wake.",
 "tender, suspended","overhead crane, very slow rotate","cut","dissolve on her hand",
 "care in a sacred space","chorus 1 resolves into shelter, not romance","set_orchard; overhead composition; two rigs; leaf turn; tear fx",5),
("S16",74.00,80.00,"interlude",[],"insert montage","three inserts: wound, cranes, wrist signal","orchard, table, medical kit, device",
 "Insert 1: she cleans his wound. Insert 2: two paper cranes side by side, one faded. Insert 3: his wrist device blinks red.",
 "focus, unease","macro inserts, 8-frame cuts","dissolve","cut on red blink",
 "intimacy and the countdown","interlude: quiet labor, plant the countdown","macro set; texture insets; device UI as diegetic light, no text",3),
("S17",80.00,86.06,"interlude",[],"WS","dome centered, dawn, tiny green heart","orchard exterior at dawn, ash plain",
 "Dawn. The dome is a green heartbeat in the ash. Inside, Mu sleeps sitting up beside Chen. The camera pulls back slowly.",
 "exhausted peace","very slow crane up/pullback","dissolve","hard cut on verse 2",
 "shelter before the argument","breathe; show the fragility of the refuge","set_cliff_dawn; dome glow; interior silhouette; crane move",4),
("S18",86.06,92.53,"verse2",["L12"],"MCU","Chen at right, pod on table left, red signal","orchard interior, table, seed pod, wrist device",
 "Chen wakes. He watches Mu sleep. His hand hovers over the seed pod; the red signal pulses on his wrist.",
 "guilt, hunger","slow push, shallow focus, handheld","cut","cut on his hand closing",
 "his want is real and sympathetic","verse 2 begins with temptation","set_orchard; chen rig; hand insert; pod glow; device light",4),
("S19",92.53,99.95,"verse2",["L13"],"two-shot","Mu left, Chen right, pod between; dome ribs","orchard, morning light, broken pane",
 "Mu wakes and catches his hand at the pod. They confront: he points to the sky, she points to the last green. Neither backs down.",
 "anger, hurt","handheld two-shot, slow orbit to profile","cut","cut on her slap/withdrawal",
 "both wants are legitimate","the argument that defines the middle","set_orchard; two rigs; IK hands; pod; orbit camera",5),
("S20",99.95,106.86,"verse2",["L14"],"insert / CU","device screen left, soil right, faces above","orchard, dead ark gardens on device, mother's ashes in soil",
 "He shows her the ark's dead gardens: rows of dust. She opens the vial of her mother's ashes and lets a little fall into the seed bed.",
 "grief, recognition","macro two-shot, rack focus","cut","match cut: ash to soil",
 "two losses, no villain","make the conflict structural, not moral","set_orchard; device UI (no text, only dead gardens); ash vial; macro soil",4),
("S21",106.86,112.52,"verse2",["L15"],"WS","two figures at opposite edges, seedling center","orchard, cold night, crack in dome",
 "They sit apart. Ash falls through a crack. She puts a blanket over him; he does not look at her. The seed glows faintly between them.",
 "silence, thaw","static wide, 8-second hold with micro-motion","cut","cut on storm gust",
 "the relationship at its lowest","quiet before the storm; show care without words","set_orchard_night; two rigs; ash through crack; blanket; low light",3),
("S22",112.52,119.20,"pre2",["L16"],"WS","dome left, storm wall right, two figures on roof","orchard exterior, storm, roof",
 "The storm hits. A pane cracks. They climb the dome in rain and ash; she holds a pane, he seals it with resin.",
 "urgency, cooperation","handheld wide, wind shake","cut","cut on lightning",
 "external pressure forces cooperation","music lift becomes physical effort","set_dome_storm; two rigs climb; rain/ash; lightning; wind cloth",5),
("S23",119.20,125.76,"pre2",["L17"],"MS","beam diagonal, bodies below, pod at edge","orchard interior, collapsing beam, seed pod",
 "A support beam snaps. Chen shields Mu; they fall. The seed pod rolls toward the broken edge. Close on her hand grabbing his wrist.",
 "fear, protectiveness","whip pan + crash zoom","cut","match cut: hand to pod",
 "he protects her before he decides","physical intimacy earned through action","set_orchard_storm; beam rig; fall; pod roll; hand insert",5),
("S24",125.76,130.13,"pre2",["L18"],"ECU","two hands on pod, root between fingers","orchard floor, wet glass, seed pod",
 "Both hands close on the pod. Their fingers touch. The pod opens; a white root curls around both wrists. The seed drinks.",
 "wonder, connection","macro orbit, slow","cut","match cut: root to vein/light",
 "the seed's rule: it needs two people","the midpoint miracle; visual rule established","set_orchard; hand rigs; pod open; root growth; bioluminescence",5),
("S25",130.13,134.70,"pre2",["L19"],"two-shot CU","faces close, sprout light below, rain outside","orchard, night, young sprout",
 "Their faces, close, lit from below by the sprout. They laugh/cry. Outside, the storm quiets. Neither lets go.",
 "relief, joy","slow push to two-shot CU, handheld breath","cut","cut on the red signal",
 "the joy before the choice","emotional high before the bridge","set_orchard_night; two rigs; sprout glow; rain-on-glass; micro expressions",4),
("S26",134.70,138.26,"chorus2",["L20"],"WS","tree center, two figures small, dome ribs","orchard, young tree, golden sap rain",
 "The sprout unfurls into a young tree. Golden sap falls like rain. They work around it, stealing looks at each other.",
 "wonder, play","overhead crane descending","cut","cut on palm contact",
 "chorus 2 = growth and joy (not repeat of chorus 1)","the seed answers their care","set_orchard_tree; tree growth; sap particles; two rigs; warm palette",5),
("S27",138.26,141.33,"chorus2",["L21"],"MCU","two palms on trunk, faces in profile","orchard, tree trunk, light",
 "They press their palms to the trunk. Light runs up the branches. Their faces are lit; they look at each other.",
 "awe, love","slow orbit, shallow DOF","cut","cut on the device buzz",
 "the tree recognizes them","intimate beat inside the spectacle","set_orchard_tree; palm contact; light propagation; two rigs",4),
("S28",141.33,146.10,"chorus2",["L22"],"CU","Chen's face, red light from below, Mu soft behind","orchard, tree, wrist device",
 "The ark's signal turns red. A countdown. Chen's face falls. Mu sees his expression and understands before he speaks.",
 "dread","static CU, rack focus to Mu","cut","hard cut to black doorway",
 "the countdown returns","turn the joy into dread without dialogue","set_orchard_tree; device light; face rig; rack focus",4),
("S29",146.10,152.54,"bridge",["L23"],"WS","open door left, Mu small right, night outside","orchard door, night, pod on his back",
 "Night. Chen stands in the open door with the seed pod. Mu wakes. She does not stop him. Her hand lowers.",
 "betrayal, restraint","static wide, long hold; wind moves curtains","hard cut","cut on the door closing",
 "he chooses the ark; she lets him choose","the bridge is the choice, not a fight","set_orchard_door_night; two rigs; door light; wind; pod",4),
("S30",152.54,159.33,"bridge",["L24"],"WS","launch pad right, Mu left, storm behind","cliff launch pad, pod, storm",
 "He runs to the pod. She follows, stops at the pad's edge. He looks back. She is a small figure in the door light. He boards.",
 "longing, resolve","handheld tracking, then static wide","cut","cut on launch",
 "the departure","the lyric 'I won't go' becomes a visual irony","set_launchpad; run cycles; pod; rain; wind; two rigs",5),
("S31",159.33,163.38,"final_chorus",["L25"],"WS","launch trail top, Mu kneeling bottom, tree dim","cliff, launch, storm",
 "The pod launches. Mu falls to her knees. The young tree dims leaf by leaf. Ash swirls around her.",
 "loss","low angle wide, slow push","cut","match cut: trail to pod interior",
 "the betrayal lands on the final chorus","largest emotional drop at the chorus start","set_launchpad; launch fx; mu kneel; tree dim; ash",4),
("S32",163.38,167.99,"final_chorus",["L26"],"MCU","Chen in pod, empty pod in hands, earth below","pod interior, window, Earth",
 "In the pod, Chen opens the pod: empty. She kept the seed. A single dry leaf in his hand crumbles. He sees the orchard below, small and dark.",
 "horror, realization","handheld CU, slow push","cut","match cut: window to dome crack",
 "he chose wrong; she outplayed him with love","the twist: the seed was never his to take","set_pod_interior; chen rig; empty pod; leaf crumble; window view",5),
("S33",167.99,171.49,"final_chorus",["L27"],"WS","dome left, storm right, Mu center small","orchard, storm tearing dome",
 "The storm tears the dome apart. Mu shields the seedling with her body. Glass shards fly. Lightning turns the frame white.",
 "terror, defiance","whip pan, camera shake, 2-frame whiteouts","cut","cut on thunder",
 "consequence: the refuge cannot hold","the storm as antagonist; Mu's choice to protect","set_dome_break; glass shards; wind; mu shield; lightning",5),
("S34",171.49,174.56,"final_chorus",["L28"],"WS","pod falling top, orchard below, rain","sky above orchard, pod, storm",
 "The pod turns back. Chen ejects, falls toward the orchard, a tiny figure against the storm. The ark's lights recede.",
 "determination","vertical tracking shot, fast","cut","match cut: falling body to embrace",
 "he chooses her / the surface","the return begins","set_skyfall; pod; chen falling rig; storm; ark",5),
("S35",174.56,179.53,"final_chorus",["L29"],"MS","two bodies in rain, tree behind, shards","orchard ruins, rain, tree",
 "Chen crashes through the broken dome, finds Mu, pulls her up. They hold each other. Roots rise around them.",
 "relief, desperation","handheld MS, orbit, rain","cut","cut on the seed cracking",
 "mutual rescue","the embrace is the emotional center","set_dome_ruins; two rigs embrace; rain; roots; shards",5),
("S36",179.53,183.65,"final_chorus",["L30"],"ECU","seed in four hands, root piercing ground","orchard ruins, rain, seed",
 "The seed in their hands cracks. A root pierces the ground. Golden light runs through the ash. The rain turns silver.",
 "awe","macro push, lens flare","cut","match cut: root to trunk",
 "the seed opens for their choice","the rule planted in S24 pays off","set_dome_ruins; hand rigs; seed open; root; light; rain color shift",5),
("S37",183.65,187.79,"final_chorus",["L31"],"WS","tree erupts center, shards orbit, figures below","orchard ruins, giant tree, sky",
 "The tree erupts through the dome. Glass shards float like stars. The ark is silhouetted. Their upturned faces are lit.",
 "sublime","low angle crane up, slow","cut","cut on rain hitting ground",
 "rebirth","the film's iconic image","set_tree_birth; procedural tree; shards; god rays; two rigs; rain",5),
("S38",187.79,191.30,"final_chorus",["L32"],"EWS","valley left, tree right, rain diagonal","ash valley transforming, rain, distant ark",
 "Rain falls on the dead valley. Green spreads in a wave from the tree. The ark's lights descend toward the ground.",
 "release, healing","high crane, lateral drift","cut","cut on a drop hitting a leaf",
 "the world answers","show the scale of healing without losing the couple","set_valley_rain; green spread; rain; ark descend; time-lapse hints",5),
("S39",191.30,194.56,"final_chorus",["L33"],"MS","two figures under tree, cranes in foreground","tree, rain, paper cranes",
 "Under the tree, they hold each other. Two paper cranes are tied to a branch, one old, one new. The rain softens.",
 "tenderness","slow orbit to profile, rain in bokeh","cut","cut on her hand on his chest",
 "the lyric 'only for the moment of reunion'","quiet inside the spectacle","set_tree_night; two rigs; cranes; rain; warm light",4),
("S40",194.56,198.50,"final_chorus",["L34"],"ECU","hands clasped, seed between palms, rain","tree, rain, hands",
 "Close on their hands: ten fingers interlocked around the empty seed pod. A drop of rain falls between them. Whiteout.",
 "reunion, peace","macro static, one drop","cut","whiteout to coda",
 "the title line made physical","deliver the lyric's image without text","macro hand rig; pod; rain drop; whiteout",4),
("S41",198.50,204.50,"outro",[],"EWS","tree center, valley, grounded ark","healed valley, tree, ark",
 "Wide: the tree towers over the valley. The broken dome is a ring of glass at its roots. The ark has landed; people walk toward the green.",
 "awe, calm","very slow crane up","whiteout dissolve","cut on a figure walking",
 "resolution at world scale","show what their choice changed","set_valley_day; tree; ark grounded; crowd silhouettes; green",4),
("S42",204.50,211.00,"outro",[],"MS","Chen left, Mu right, ark people behind","orchard roots, crowd, morning",
 "Chen's people come down the ramp. He meets them, then turns back and reaches for Mu. She takes his hand. The crowd parts.",
 "belonging","handheld MS, slow push","cut","cut on hands",
 "he is claimed by both worlds and chooses both","reunion with the ark, not just the girl","set_valley_day; crowd silhouettes; two rigs; hand clasp",4),
("S43",211.00,218.00,"outro",[],"WS time-lapse","tree, valley, seasons, new fields","valley through seasons",
 "Time-lapse: blossoms, fruit, irrigation channels, new trees. The ark becomes a roof, then a hill. The couple plant rows.",
 "ordinary happiness","locked wide, time-lapse light","dissolve","dissolve to older couple",
 "healing is work, not a single miracle","the coda earns the ending","set_valley_timelapse; tree stages; seasonal palette; crowd/field",5),
("S44",218.00,226.59,"outro",[],"MS","older couple under tree, cranes, valley","tree, bench, paper cranes, late afternoon",
 "Years later. Older Mu and Chen sit under the tree. She leans on him. Two cranes turn slowly above. A child (their daughter?) runs past, out of focus.",
 "peace, melancholy","static long take, gentle breeze","dissolve","cut on a falling leaf",
 "a life, not just a victory","the 'ever after' is ordinary and mortal","set_tree_old; aged rig variants; cranes; child silhouette; warm light",4),
("S45",226.59,232.595,"outro",[],"ECU → EWS","leaf falls into pool; reflection widens","pool, tree reflection, sky, title",
 "A single leaf falls into a pool. Ripples widen; the reflection shows the tree, the two figures, and the ark in the sky. The image settles. Title.",
 "quiet, eternal","macro static, then slow pull to reflection","cut","fade to paper",
 "the last image outlasts the song","close the circle: dust → seed → leaf → water","set_pool; leaf; ripples; reflection composite; title type; paper fade",5),
]

# snap to frames, force contiguity
shots=[]
prev=0
for i,(sid,st,en,sec,lrefs,size,comp,env,act,expr,cam,tin,tout,emo,func,impl,cx) in enumerate(S):
    sf=prev
    ef=round(en*FPS)
    if i==len(S)-1: ef=TOTAL_FRAMES
    if ef<=sf: ef=sf+1
    shots.append(dict(id=sid,start_frame=sf,end_frame=ef,start=round(sf/FPS,4),end=round(ef/FPS,4),
        duration=round((ef-sf)/FPS,3),section=sec,lyric_refs=lrefs,shot_size=size,composition=comp,
        environment=env,action=act,expression=expr,camera=cam,transition_in=tin,transition_out=tout,
        emotion=emo,function=func,implementation=impl,complexity=cx))
    prev=ef

# validation
assert shots[0]["start_frame"]==0
assert shots[-1]["end_frame"]==TOTAL_FRAMES
assert all(a["end_frame"]==b["start_frame"] for a,b in zip(shots,shots[1:]))
# lyric line data
lyr=json.loads(Path("analysis/audiomap.json").read_text())["lyrics"]["lines"]
L={f"L{i+1:02d}":x for i,x in enumerate(lyr)}
for s in shots:
    used=[L[k] for k in s["lyric_refs"] if k in L]
    s["lyrics"]=[{"start":x["start"],"end":x["end"],"text":x["text"]} for x in used]
    s["lyric_text"]=" / ".join(x["text"] for x in used)

timeline=dict(schema="cinematic-mv.timeline/2",fps=FPS,total_frames=TOTAL_FRAMES,
    duration_audio=DURATION,duration_video=round(TOTAL_FRAMES/FPS,4),
    sections=json.loads(Path("analysis/audiomap.json").read_text())["sections"],
    shots=shots)
Path("storyboard/timeline.json").write_text(json.dumps(timeline,ensure_ascii=False,indent=1))

# markdown
md=["# Storyboard — 《最后的果园》 / The Last Orchard","",
    f"Song: 林俊杰《愿与愁》 · 24 fps · {TOTAL_FRAMES} frames · {TOTAL_FRAMES/FPS:.3f} s","",
    "All cuts are frame-snapped. Shots are contiguous: no gaps, no overlaps. The final shot covers the",
    "audio tail (ceil to the next frame), so there is no black tail.","",
    "| # | Time | Dur | Section | Lyric | Size | Action / camera | Function | Complexity |",
    "|---|---|---:|---|---|---|---|---|---:|"]
for s in shots:
    md.append(f"| {s['id']} | {s['start']:.2f}–{s['end']:.2f} | {s['duration']:.2f} | {s['section']} | {s['lyric_text'] or '—'} | {s['shot_size']} | {s['action']} **Camera:** {s['camera']} | {s['function']} | {s['complexity']} |")
md+=["","## Full shot cards",""]
for s in shots:
    md+= [f"### {s['id']} · {s['start']:.2f}–{s['end']:.2f} · {s['duration']:.2f}s · {s['shot_size']}",
          f"- **Section / lyric:** {s['section']} / {s['lyric_text'] or 'instrumental'}",
          f"- **Composition:** {s['composition']}",
          f"- **Environment:** {s['environment']}",
          f"- **Action:** {s['action']}",
          f"- **Expression:** {s['expression']}",
          f"- **Camera:** {s['camera']}",
          f"- **In / out:** {s['transition_in']} → {s['transition_out']}",
          f"- **Emotion → function:** {s['emotion']} → {s['function']}",
          f"- **Implementation:** {s['implementation']}",
          f"- **Complexity:** {s['complexity']}/5",""]
Path("storyboard/storyboard.md").write_text("\n".join(md)+"\n")
print(f"{len(shots)} shots, {TOTAL_FRAMES} frames, {TOTAL_FRAMES/FPS:.3f}s")
for s in shots[:3]: print(s['id'],s['start'],s['end'],s['start_frame'],s['end_frame'])
