# scenes

The production uses one data-driven shot table (`../src/shots.js`, 45 specs) plus a set of
reusable painters (`../src/lib/sets.js`), a silhouette rig (`../src/lib/character.js`), props
(`../src/lib/props.js`) and custom close-ups (`../src/custom_shots.js`).

This folder is kept for future per-scene modules (e.g. `orchard.js`, `storm.js`) if the project
outgrows the single-table approach. It is intentionally empty in the current build.
