[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/burn/types](../README.md) / LetterBurn

Defined in: core/utils/burn/types.ts:229

One glyph's burn unit — the ink-run span in the paper raster plus its
ignition profile. `v` is the burn-speed multiplier, `delay` the share
of total progress before this letter ignites (letters catch fire at
different moments), and y0/y1 bound the letter's ink extent so the
front only travels through its own glyph.

## Properties

### x0

```ts
x0: number
```

Defined in: core/utils/burn/types.ts:231

Column span inside the paper raster (device px).

---

### x1

```ts
x1: number
```

Defined in: core/utils/burn/types.ts:232

---

### y0

```ts
y0: number
```

Defined in: core/utils/burn/types.ts:234

Ink vertical extent inside the paper raster (device px).

---

### y1

```ts
y1: number
```

Defined in: core/utils/burn/types.ts:235

---

### v

```ts
v: number
```

Defined in: core/utils/burn/types.ts:237

Burn-speed multiplier — 0.55..1.45 of the global front rate.

---

### delay

```ts
delay: number
```

Defined in: core/utils/burn/types.ts:239

Ignition delay as a fraction of total progress (0..0.22).
