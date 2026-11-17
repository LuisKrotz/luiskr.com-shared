[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/burn/types](../README.md) / BurnParticle

Defined in: core/utils/burn/types.ts:243

One combustion particle — an ember (bright, rises) or fleck (dark, curls).

## Properties

### x

```ts
x: number
```

Defined in: core/utils/burn/types.ts:244

---

### y

```ts
y: number
```

Defined in: core/utils/burn/types.ts:245

---

### vx

```ts
vx: number
```

Defined in: core/utils/burn/types.ts:246

---

### vy

```ts
vy: number
```

Defined in: core/utils/burn/types.ts:247

---

### life

```ts
life: number
```

Defined in: core/utils/burn/types.ts:248

---

### maxLife

```ts
maxLife: number
```

Defined in: core/utils/burn/types.ts:249

---

### size

```ts
size: number
```

Defined in: core/utils/burn/types.ts:250

---

### kind

```ts
kind: number
```

Defined in: core/utils/burn/types.ts:252

0 = ember, 1 = char fleck.

---

### rot

```ts
rot: number
```

Defined in: core/utils/burn/types.ts:254

Rotation for flecks (radians) + tumble speed.

---

### spin

```ts
spin: number
```

Defined in: core/utils/burn/types.ts:255

---

### phase

```ts
phase: number
```

Defined in: core/utils/burn/types.ts:257

Per-particle noise phase — keeps flicker/wobble desynced.

---

### L?

```ts
optional L?: LetterBurn;
```

Defined in: core/utils/burn/types.ts:262

Rebuild deposits only — the letter whose front this particle rains
onto. Undefined for burn particles, which simply rise and die.
