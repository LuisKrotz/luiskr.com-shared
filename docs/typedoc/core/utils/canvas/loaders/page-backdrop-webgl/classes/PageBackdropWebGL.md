[**luiskr.com**](../../../../../../README.md)

---

[luiskr.com](../../../../../../README.md) / [core/utils/canvas/loaders/page-backdrop-webgl](../README.md) / PageBackdropWebGL

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:40

WebGL page backdrop. Construct once at app boot with the element the
canvas should mount into (the document body); `destroy()` on shell
teardown. Registers with the shared webglPool so GPU pressure can
purge/restore it and user actions retry a fallen-back instance.

## Constructors

### Constructor

```ts
new PageBackdropWebGL(container): PageBackdropWebGL;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:83

#### Parameters

##### container

`HTMLElement`

element that receives the canvas as its first child

#### Returns

`PageBackdropWebGL`

## Properties

### canvas

```ts
canvas: HTMLCanvasElement
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:42

Fullscreen canvas — created by the constructor, parked as the container's first child.

---

### container

```ts
container: HTMLElement
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:44

Element the canvas mounts into (document.body in production).

---

### gl

```ts
gl: WebGLRenderingContext | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:45

---

### program

```ts
program: WebGLProgram | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:46

---

### quadBuffer

```ts
quadBuffer: WebGLBuffer | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:47

---

### uRes

```ts
uRes: WebGLUniformLocation | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:48

---

### uBase

```ts
uBase: WebGLUniformLocation | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:49

---

### uCol

```ts
uCol: WebGLUniformLocation | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:50

---

### uGain

```ts
uGain: WebGLUniformLocation | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:51

---

### uKey

```ts
uKey: WebGLUniformLocation | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:52

---

### uShade

```ts
uShade: WebGLUniformLocation | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:53

---

### width

```ts
width: number = 0
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:55

Backing-store size in device pixels.

---

### height

```ts
height: number = 0
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:56

---

### isActive

```ts
isActive: boolean = false
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:57

---

### useWebGL

```ts
useWebGL: boolean = false
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:58

---

### \_base

```ts
_base: Float32Array<ArrayBuffer>
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:60

Surface colour (`--bg-primary`) as an RGB float triple.

---

### \_colors

```ts
_colors: Float32Array<ArrayBuffer>
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:62

Seven field hues, flat RGB — the `u_col` uniform array payload.

---

### \_key

```ts
_key: Float32Array<ArrayBuffer>
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:64

Key light — specular RGB + theme gain packed for one `uniform4fv`.

---

### \_shade

```ts
_shade: Float32Array<ArrayBuffer>
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:66

Counter-shade — ink RGB + theme gain packed for one `uniform4fv`.

---

### \_gain

```ts
_gain: number = 1
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:68

Lobe strength multiplier — light 1, dark ember gain.

---

### \_darkAtStart

```ts
_darkAtStart: boolean = false
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:69

---

### \_paletteDirty

```ts
_paletteDirty: boolean = true
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:71

Upload gates — set by sampleTheme/handleResize, cleared by the draw.

---

### \_resDirty

```ts
_resDirty: boolean = true
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:72

---

### \_onContextLost

```ts
_onContextLost: EventListener | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:73

---

### \_purged

```ts
_purged: boolean = false
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:74

---

### \_rootObserver

```ts
_rootObserver: MutationObserver | null = null;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:76

Watches the root class list for high-contrast flips.

## Methods

### \_onResize()

```ts
_onResize(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:78

Bound passive resize handler — allocated once.

#### Returns

`void`

---

### \_initGL()

```ts
_initGL(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:113

Creates the WebGL context + lobe program; falls back to the CSS lobes on failure.

#### Returns

`void`

---

### \_triggerFallback()

```ts
_triggerFallback(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:118

Switches to the CSS lobe path — context loss, init failure, bad palette.

#### Returns

`void`

---

### \_releaseGL()

```ts
_releaseGL(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:123

Frees the quad program/buffer and force-loses the context (listener detached first).

#### Returns

`void`

---

### \_sampleTheme()

```ts
_sampleTheme(): boolean;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:133

Samples `--field-*` + `--bg-primary` + specular/ink into the uniform buffers.

#### Returns

`boolean`

true when the surface colour parsed

---

### \_onRootClass()

```ts
_onRootClass(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:142

Root class flip — high contrast stops the field (the HC surface is
flat by contract); leaving it resumes. A dark/light flip redraws the
static pose with the resampled palette; only the HC edge stops it.

#### Returns

`void`

---

### start()

```ts
start(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:161

Starts the field (see page-backdrop/loop.ts).

#### Returns

`void`

---

### stop()

```ts
stop(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:166

Stops the loop and clears the document marker.

#### Returns

`void`

---

### \_handleResize()

```ts
_handleResize(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:171

Syncs the backing store with the viewport and redraws.

#### Returns

`void`

---

### \_renderFrame()

```ts
_renderFrame(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:176

Draws the one static field pose.

#### Returns

`void`

---

### purge()

```ts
purge(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:184

webglPool hook — GPU pressure or an offscreen canvas: tears the GL
resources down and clears the marker so the CSS lobes cover the gap.

#### Returns

`void`

---

### restore()

```ts
restore(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:197

webglPool hook — recreates the context + restarts after a purge.

#### Returns

`void`

---

### destroy()

```ts
destroy(): void;
```

Defined in: core/utils/canvas/loaders/page-backdrop-webgl.ts:210

Releases everything — context, listeners, observer, the canvas itself.

#### Returns

`void`
