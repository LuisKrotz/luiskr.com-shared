[**luiskr.com**](../../../../README.md)

---

[luiskr.com](../../../../README.md) / [core/utils/dom](../README.md) / flushLayout

```ts
function flushLayout(el): number
```

Defined in: core/utils/dom.ts:314

Deliberate synchronous layout flush — the ONE sanctioned forced reflow.
Used by the transition-restart pattern: write classes/styles, force
layout so the browser commits them, then apply the animating class in
the same frame. Callers get the element's offsetHeight as a side effect
of the flush; the return value is meant to be ignored (`void`).

The flush rides a getBoundingClientRect CALL on purpose: production
terser (`pure_getters`) dead-codes a bare `el.offsetHeight` statement
whose result is ignored — which is exactly how callers use this — but
a method invocation can never be proven pure, so the forced layout can
never be minified away. Reading offsetWidth/offsetHeight directly at a
call site reproduces the prod regression; always route through here.

## Parameters

### el

`HTMLElement`

Element whose layout is flushed.

## Returns

`number`

the element's offsetHeight (the flushing read).
