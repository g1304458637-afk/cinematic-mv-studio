# Audio analysis and honest lyric alignment

## 1. Measure, don't remember

Never use a BPM or duration from memory. Decode the actual file and report:
duration, sample rate, channels, integrated loudness/true peak, tempo estimate, beat grid,
downbeats, energy/spectral curves, sections, candidate climax windows, vocal presence.

`scripts/analyze_music.py` does this with librosa. The tempo fit is a constant-grid phase fit;
it reports coherence. Low coherence (<0.6) means the performance has rubato or the detector is
locking to a subdivision. Check the tempogram and the section starts before trusting it. For
through-composed or rubato music, store actual detected beats and use a local tempo map.

## 2. Sections

Section labels are a directorial decision backed by evidence. Supply a manual `sections.json`
when you know the song; let the analyzer propose blocks otherwise. Every section boundary should
be cross-checked against at least two of: energy change, spectral change, lyric phrase, beat/bar
line, arrangement entry. Record the evidence.

## 3. Climax

Loudness is not emotion. A loud verse can out-score a quiet final chorus in RMS. Use the climax
detector as a candidate list, then choose the film's climax from the **story** and the song's
structural release. Write down the override reason. Never place the quiet resolution over the
strongest vocal passage.

## 4. Lyric timing: keep provenance

Three distinct times matter:

| time | meaning | use |
|---|---|---|
| `phrase_start` | official LRC/SRT bar or phrase mark | cutting picture |
| `vocal_start` | first sung syllable (ASR/spectrogram) | captions, lip/eye acting |
| `vocal_end` | end of the sung phrase | caption out, reaction |

They are often not equal. LRC marks frequently precede the vocal by 0.4–1.5 s. Do not collapse
them silently. Store both, with a source and confidence.

Rules:
- No timing without evidence. Plain text lyrics get `timing: "untimed"` and are not rendered as
  captions until aligned.
- ASR is a witness, not an oracle. Whisper segment starts on singing can be late; cross-check the
  first syllable against a spectrogram/word timestamp and a manual anchor or two.
- Prefer character-level anchoring for Chinese. Keep unmatched lines as unmatched.
- Do not interpolate timings across a gap and present them as measured.
- For subtitles, use `vocal_start` and a readable end; keep line duration ≥ 1.2 s where possible.

`scripts/align_lyrics.py` implements LRC/SRT parsing, optional ASR matching, and writes separate
`phrase_start` and `vocal_start` fields plus an SRT. Review every line flagged low-confidence.

## 5. Cut alignment

Cuts can land on a beat, a bar, a lyric phrase, a section, or a deliberate off-grid breath.
The validator reports the nearest event and flags cuts > 0.35 s from all evidence unless the shot
declares `intentional_offgrid` with a reason. Do not quantise every cut to the grid; do know why
each exception exists.

## 6. A/V sync checks

- Container duration vs audio duration: ≤ 0.12 s.
- First/last vocal line: check a 2 s window before/after against the waveform.
- Any impact/flash: check the frame and the audio onset in the final file, not the source.
- Captions: burn-in is optional; if provided, verify the sidecar times against the master audio.
- Never trim the song to fit the picture. If the film is short, fix the edit, not the master.
