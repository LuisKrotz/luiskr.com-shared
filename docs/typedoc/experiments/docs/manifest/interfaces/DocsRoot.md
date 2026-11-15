[**luiskr.com**](../../../../README.md)

---

[luiskr.com](../../../../README.md) / [experiments/docs/manifest](../README.md) / DocsRoot

Defined in: experiments/docs/manifest.ts:44

A publishable root bucket (docs / reports / coverage-* / source modules).

## Properties

### root

```ts
root: string
```

Defined in: experiments/docs/manifest.ts:45

---

### label

```ts
label: string
```

Defined in: experiments/docs/manifest.ts:46

---

### kind?

```ts
optional kind?: "docs" | "source" | "coverage" | "reports";
```

Defined in: experiments/docs/manifest.ts:52

Behavior class emitted by shared/build/docs/scan.mjs: 'source' roots
are protected (copy-guard, no index auto-open); 'coverage' roots are
per-module test reports; 'docs'/'reports' are browsable content.

---

### children

```ts
children: DocsNode[];
```

Defined in: experiments/docs/manifest.ts:53
