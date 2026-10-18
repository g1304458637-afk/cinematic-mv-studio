#!/usr/bin/env bash
# Install cinematic-music-video-director as a single-source Agent Skill.
#
# Canonical source: this directory (the same one that contains SKILL.md).
# Links (not copies) into:
#   $HOME/.claude/skills/cinematic-music-video-director
#   $HOME/.agents/skills/cinematic-music-video-director
# so Claude Code and Codex share one copy. No drift.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
NAME="$(basename "$SKILL_DIR")"
echo "canonical: $SKILL_DIR"
for parent in .claude .agents; do
  TARGET="$HOME/$parent/skills/$NAME"
  mkdir -p "$(dirname "$TARGET")"
  ln -sfn "$SKILL_DIR" "$TARGET"
  echo "linked:    $TARGET -> $SKILL_DIR"
done
echo "done. Restart the agent (or /skills refresh) to pick up the skill."
