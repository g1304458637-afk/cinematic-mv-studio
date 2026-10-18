# Rights

This repository is the open-source studio: the `cinematic-music-video-director` skill and the original animation code for *The Last Orchard*.

It does **not** contain the commercial recording, the lyric text, subtitle files, or the finished MP4. Those stay on the machine that has the rights to use them. Put your own audio at `projects/<name>/assets/song.m4a` and follow the skill. Do not add someone else's song or lyrics to this repo.

# Cinematic MV Studio

Code-drawn music videos. The reusable director is `skills/cinematic-music-video-director`. Claude Code and Codex both see it through symlinks:

- `.claude/skills/cinematic-music-video-director`
- `.agents/skills/cinematic-music-video-director`

## This film

`projects/jjlin-wish-and-sorrow` — an original short, 《最后的果园》, cut to a user-supplied master of 林俊杰《愿与愁》.

Play `projects/jjlin-wish-and-sorrow/output/愿与愁_完整AI动画MV.mp4`.

## Make another one

1. Put the audio in `projects/<slug>/assets/song.m4a`.
2. Open the skill and follow its checklist. Do not copy this film's shots.
3. The studio page must set `window.ready` and `window.renderAt(t)`.

Song files stay local. This repository does not grant rights to the music or the lyrics.
