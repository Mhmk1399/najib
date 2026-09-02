---
version: alpha
colors:
  primary: "#0B0B0B"
  surface: "#FFFFFF"
  background: "#F6F2EB"
  accent: "#C15427"
  muted: "#707070"
  border: "#E5E5E5"
typography:
  body:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: "1.5"
  persian:
    fontFamily: "var(--font-dana), Inter, sans-serif"
  display:
    fontFamily: "Georgia, Times New Roman, serif"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.none}"
  productCard:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
  glassQuickPanel:
    backgroundColor: "rgb(17 17 17 / 0.42)"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
---

# Najibzadeh Design Context

Najibzadeh is a luxury menswear commerce experience with a restrained editorial tone. Interfaces should feel precise, calm, and image-led rather than decorative.

Use black and white for primary structure, cream for editorial page backgrounds, and copper only as a small accent for badges, counts, and selected emphasis.

Product browsing should prioritize large photography, tight metadata, and compact controls. Quick actions may use glass panels over imagery, but they should stay legible, compact, and below 8px radius.

Avoid one-note warm palettes, oversized marketing cards, nested cards, decorative gradient blobs, and explanatory UI copy. Controls should use familiar icons and stable dimensions so product grids do not jump during hover, selection, or loading states.
