[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/motion/genie](../README.md) / GenieClasses

Defined in: core/utils/motion/genie.ts:29

Class contract a genie host must satisfy: the element the enter/leave
modifier lands on (the backdrop), the two modifiers themselves, and the
dialog panel that scales from the recorded origin.

## Properties

### backdrop

```ts
backdrop: string
```

Defined in: core/utils/motion/genie.ts:31

Selector for the element that carries the enter/leave modifier.

---

### backdropEnter

```ts
backdropEnter: string
```

Defined in: core/utils/motion/genie.ts:33

Modifier applied while the dialog flies in (collapsed start state).

---

### backdropLeave

```ts
backdropLeave: string
```

Defined in: core/utils/motion/genie.ts:35

Modifier applied while the dialog collapses back to the origin.

---

### dialog

```ts
dialog: string
```

Defined in: core/utils/motion/genie.ts:37

Selector for the dialog panel the genie transforms.
