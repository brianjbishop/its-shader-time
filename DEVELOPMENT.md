## Devlog — It's Shader Time · Spring 2026

It's Shader Time is a 7-week intensive at ITP taught by Elias Zananiri. The course is about the GPU — not as a black box that renders things, but as a programmable pipeline you can read, write, and redirect. The medium is Three.js and GLSL, and the progression is methodical: every week adds one more layer of control over what the GPU is actually doing.

The course splits into two arcs. The first arc (weeks 2–4) is about the shading pipeline and how data flows through it — from vertices through the vertex shader, through rasterization, into the fragment shader, and out to the screen. The p5.js sketches in this half are structured as workshops for building that intuition: passing uniforms, sampling textures, writing `void main()` from scratch. The second arc (weeks 5–7) shifts from understanding the pipeline to bending it — custom geometry deformed by vertex shaders, post-processing passes that modify the rendered frame, and finally GPGPU: using the GPU's fragment shaders not to render pixels but to compute particle positions every frame.

The through-line is audio reactivity. It appears in W4 and again in W4's solar system — microphone volume driving a distance field's ring density, then driving a planet system's rotation speed. That same impulse to make something respond to sound is what makes the technical work feel personal rather than just academic.

The sharpest conceptual jump in the course happens between W5 and W7. In W5, the vertex shader is still doing what vertex shaders are "supposed" to do: displacing geometry. By W7, the vertex and fragment shaders have been repurposed entirely — the fragment shader is a physics simulation, the render target is a data buffer, and the "scene" that gets drawn is just a way to read the results back out. The GPU stopped being a renderer and became a calculator. Marine snow is what falls when that shift finishes landing.

---

### 3D Reactive Mesh — building a mesh from a body segmentation mask

**Why:** W2 introduced the shading pipeline: how geometry feeds vertex data, how rasterization interpolates across fragments, how a fragment shader writes to the screen. The creative assignment pushed beyond the renderer itself, into using an existing ML model to generate geometry dynamically from live input.

**What:** The W2 sketch uses p5.js and ml5's BodyPix body segmentation model. A webcam feed runs through `bodySegmentation.detectStart()`, which returns a mask — a binary image where white pixels are body, black pixels are background. Every frame, the sketch iterates the mask in a grid (`x_step = 30`, `y_step = 20`), finds the white pixels, and feeds them as vertices into a `TRIANGLE_STRIP` with random RGB fills. The result is a mesh that traces the body's silhouette in colored triangles, flickering with each frame.

**Impact:** The mesh is unstable by design — random colors, no smoothing, no persistence. But the concept is precise: a computer vision mask becomes vertex geometry in real time. That same idea — treating external data as a mesh input rather than as a texture or label — reappears in the W4 solar system when mic volume drives geometry transforms, and it's the conceptual ancestor of the W7 GPGPU work where a data texture drives point positions.

---

### Shader Pipeline — first custom GLSL shaders in p5.js

**Why:** W3 introduced texture coordinates and the mechanics of passing data between the CPU and GPU via uniforms. For the first time the sketch owns both the vertex shader and the fragment shader — they're not p5.js defaults but `.vert` and `.frag` files loaded via `loadShader()`.

**What:** The W3 sketch passes a photograph (`b5.jpg` — a personal image) as a texture uniform into the fragment shader. The vertex shader handles coordinate transforms and passes `aTexCoord` through as a varying; the fragment shader samples the texture and modulates each RGB channel independently with `abs(sin(uTime))`, `abs(cos(uTime))`, and `abs(sin(uTime))` at different frequencies. The result is a photo whose colors pulse and shift continuously — not a filter applied after the fact, but color math written directly in GLSL, running on every pixel simultaneously on the GPU.

**Impact:** The step from "using a shader" to "writing a shader" is the foundational shift of the course. Everything after this — audio uniforms, noise functions, post-processing passes, GPGPU — is built on the mental model established here: uniforms carry data from the CPU to the GPU, varyings carry data from the vertex stage to the fragment stage, `gl_FragColor` is what appears on screen. The personal photo as the texture source also set a pattern: technical exercises in this class consistently used personal material.

---

### Shapes and Patterns — audio-reactive distance field

**Why:** W4 covered image compositing and shaders in three.js. The shapes-and-patterns sketch extends the W3 pipeline with two new inputs: mouse position and microphone volume, both piped into the fragment shader as uniforms.

**What:** The fragment shader constructs a distance field using `length(abs(centeredSt) - 0.2)` — a signed distance function for a rectangular frame centered on the mouse position (`uMouse`). The color output is `fract(d * (uAudio * 600.0))`: the distance field wrapped through `fract()`, scaled by microphone volume. Loud input = dense concentric rings expanding outward from wherever the cursor sits. Quiet = almost no rings. The sketch listens for a click to activate the mic via `userStartAudio()`.

**Impact:** This is the first sketch where the GPU is doing something genuinely interactive — not just animating over time but responding to two simultaneous inputs that have different characters (mouse is spatial, audio is volumetric). The distance field approach also introduced signed distance functions as a drawing primitive, which is a different model of geometry than vertices and triangles.

---

### Solar System — Three.js, classes, and mic-reactive rotation

**Why:** W4 also introduced Three.js — the scene graph, perspective camera, orbit controls, and the `tick()` animation loop. The solar system sketch is the first full Three.js project, built around a `Planet` class and a hundred-body system driven by audio.

**What:** A `Planet` class wraps a `THREE.Group` containing a sphere and a box-moon, each with random HSL colors and independent random rotation speeds. 120 planets are instantiated in a loop and added to a central `Sun` group. A `THREE.AudioAnalyser` reads microphone volume via Web Audio API; `getAverageFrequency()` (0–255) normalizes to a `targetSpeed` that's eased toward the sun's y-rotation each frame. Click to activate the mic — louder sounds spin the galaxy faster. The commented-out code shows an abandoned experiment: faceMesh detection that would have added planets each time a new face appeared on camera.

**Impact:** The solar system is where Three.js clicked as a tool for spatial thinking — not just a library but a way to think about objects, groups, and hierarchies in 3D space. The `Planet` class pattern (constructor builds the group, methods handle motion) carried into every subsequent Three.js sketch. The abandoned faceMesh branch is also notable: the impulse to add more reactivity was already there, and it was cut not because it was wrong but because the audio version was already working and complete.

---

### Vertex Shader Flower — simplex noise displacement in Three.js

**Why:** W5 introduced custom geometry and post-processing. The vertex shader is no longer just transforming coordinates — it's displacing geometry, moving vertices in world space based on computed values. The flower sketch is the first Three.js sketch with a `RawShaderMaterial`.

**What:** A `PlaneGeometry(2, 2, 100, 100)` — a flat plane with 10,000 subdivisions — is rendered with a custom vertex shader that implements 2D simplex noise (the Ian McEwan / Ashima Arts GLSL implementation). Each vertex samples the noise field at its UV coordinates plus a time offset, then displaces along its normal by an amount that's also modulated by distance from center: edges wave more than the center, creating a petal-like undulation. Two uniforms (`uNoiseScale`, `uOffsetScale`) are exposed via a lil-gui panel for live parameter editing. The fragment shader visualizes normals as RGB — the colored surface reveals the displacement directly.

**Impact:** Vertex displacement is the moment the vertex shader becomes a creative tool rather than a coordinate transform. The simplex noise implementation is also the first time a significant chunk of code from outside the class (the webgl-noise library) is integrated into a sketch — understanding what it does well enough to pass the right inputs and read the right output. The lil-gui panel introduced a workflow that stayed in every subsequent Three.js sketch: expose the interesting parameters, tune them live, settle on values.

---

### Post-Processing Effect — EffectComposer pipeline with warp shader

**Why:** W6 covered GPU computing, but the post-processing effect sketch is also the payoff of the W5 vertex work: the displaced flower mesh goes through an `EffectComposer` pipeline, and the rendered frame itself becomes the input to a second custom shader pass.

**What:** The sketch builds on the vertex shader flower from W5, adding an `EffectComposer` chain: `RenderPass` → `DotScreenPass` → custom `warpPass`. The warp shader (`warp.frag`) takes the rendered frame as `tDiffuse` and modulates each RGB channel with `abs(sin(uTime))` at different frequencies (1.2, 0.7, 1.8) — the same color pulse technique from W3, now applied to the entire composed frame rather than a single texture. A `ShaderPass` wrapping `KaleidoShader` was built and commented out. The lil-gui panel adds a toggle for the warp pass.

**Impact:** Post-processing reveals what the pipeline actually is: a series of render targets, each feeding the next. Writing a custom `ShaderPass` is the same as writing any fragment shader — `tDiffuse` is just the input texture — but doing it inside the composer chain makes the architecture concrete. The KaleidoShader experiment (built, then disabled) shows the same pattern as the faceMesh branch in W4: try the more elaborate thing, find the simpler version already works, leave the experiment visible in comments.

---

### Marine Snow — GPGPU particle system

**Why:** W7 was the final week: GPU computing — using the fragment shader not to color pixels but to run a simulation. Marine snow is the creative output: 4,096 particles that behave like bioluminescent debris sinking through deep water, responding to clicks with a flash-and-flicker effect.

**What:** The sketch implements a two-pass GPGPU loop. A `DataTexture` (64×64 RGBA float) initializes particle positions randomly in a 30-unit cube. Every frame, an "update" render pass runs a fragment shader over a full-screen quad using that texture as input — each fragment reads one particle's position from its UV coordinate and writes back the updated position. A `WebGLRenderTarget` captures this output, which then feeds the "render" pass as `uTexPositions`. The render pass draws a `THREE.Points` system where each point looks up its position from the texture and draws an elongated, randomly-rotated rectangle (`gl_PointCoord` clipping with variable aspect ratio and random angle). The click handler triggers a flash: `scene.background` snaps to white and fades over 200ms; the render fragment shader modulates color and alpha with a `sin(15.0 * pow(timeSinceClick, 0.8))` flicker that decays via `exp(-timeSinceClick * 0.4)`.

**Impact:** The GPGPU architecture is a different mental model of what a shader is. In every earlier sketch, the fragment shader's job was to produce a color. Here, its job is to compute a value that another shader will read. The screen is almost incidental — what matters is the round-trip through the render target. Marine snow is visually quiet: dark, drifting particles that flash blue when you click. The aesthetic fits the concept. The GPU is doing something invisible and structural; the image on screen is just evidence of the computation underneath.
