# Motion system

Motion communicates hierarchy and causality. It is fast, subtle and interruptible.

## Durations

- Fast: direct hover and focus feedback.
- Normal: controls, disclosure and small overlays.
- Slow: drawers and larger transitions.
- Hero: deliberate introductory movement only.

## Interaction patterns

- Hover: translate up by the hover-lift token and expand the soft shadow.
- Press: return toward the surface with a subtle scale or translation.
- Exit: opacity and transform only; exits are faster than entrances.
- Page transition: short opacity/vertical transform.
- Section reveal: progressive CSS view-timeline enhancement; content remains visible without support.
- Card hover: small lift and reflective highlight shift.
- Floating: low-amplitude transform for decorative, nonessential objects.
- Glow pulse: low-alpha shadow/opacity only; never behind body copy.
- Focus: immediate visible semantic focus ring.

Never animate layout properties such as width, height, margin, inset or padding. Respect `prefers-reduced-motion`; decorative animations become static and interaction feedback becomes immediate.
