# Liquid Glass system

OI glass is polished crystal, not opaque frosted glass. It uses high transparency, restrained blur, backdrop saturation, a reflective edge, an internal top highlight and layered low-alpha depth.

## Levels

Glass XS, SM, MD, LG and XL are semantic recipes. Components select a level rather than rebuilding opacity, blur, saturation, border or shadow values.

## Rules

- Maintain a solid semantic fallback before applying backdrop filters.
- Use the lightest level that establishes separation.
- Keep text contrast independent from the backdrop.
- Avoid multiple high-blur layers in the same stacking context.
- Do not place saturated gradients or colored glows inside glass content surfaces.
- Use reflective highlights as edge light, never as decoration.
- Hover adjusts the tokenized background, border, highlight and shadow subtly.

Glass may support cards, navigation and floating surfaces when information hierarchy calls for depth. Dense data, long-form forms and accessibility-critical content should prefer the clearest semantic surface or the lowest glass level.
