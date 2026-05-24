# It's Shader Time

Three.js and GLSL shader sketches from It's Shader Time at ITP, NYU — Spring 2026.

## What it is

It's Shader Time is a 7-week intensive at ITP taught by Elias Zananiri. The course moves
from 3D rendering fundamentals through the full shader pipeline — vertex shaders,
fragment shaders, texture mapping, custom geometry, post-processing, and GPU computing.
The medium is Three.js and raw GLSL. Every week ends with a creative sketch that applies
that week's concept.

This repo is the record of those sketches: from a p5.js mesh built from a body segmentation
mask to a marine snow GPGPU system where the GPU runs as a parallel compute engine.

## Structure

| Folder | Week | Topic |
|--------|------|-------|
| `w02-3d-reactive-mesh/` | Week 2 | Shading Pipeline — ml5 body segmentation mesh in p5.js |
| `w03-shader-pipeline/` | Week 3 | Texture Coordinates — first custom GLSL shaders |
| `w04-shapes-and-patterns/` | Week 4 | Shaders in p5.js — audio-reactive distance field |
| `w04-solar-system/` | Week 4 | Intro to Three.js — solar system with mic-reactive rotation |
| `w05-vertex-shader-flower/` | Week 5 | Custom Geometry — simplex noise vertex displacement |
| `w06-post-processing-effect/` | Week 6 | Post-Processing — EffectComposer pipeline with custom warp |
| `w07-gpu-computing-marine-snow/` | Week 7 | GPU Computing — GPGPU two-pass particle system |

## Running a sketch

Each sketch is a Node.js project (Vite or plain CodeSandbox config).

```bash
cd w05-vertex-shader-flower
npm install
npm run dev
```

For the earlier p5.js sketches (`w02`, `w03`, `w04-shapes-and-patterns`), open
`index.html` directly in a browser or use a local server.

## Development notes

See [DEVELOPMENT.md](DEVELOPMENT.md) for the arc of the course — how each week built
on the last, where the conceptual shifts happened, and how the final GPGPU sketch
connects the threads from the second half of the course.
