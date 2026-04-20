# Template Design Specification

All reference app templates must follow these design principles.
These apps are demoed live to customers by Sales Engineers — they
must look like real, modern applications, not tutorials or scaffolds.

## Design principles

1. **Look like a real product.** The customer should see the app and
   think "this looks like something my team would build." No tutorial
   aesthetics, no placeholder-looking UIs.

2. **Minimal but not empty.** Clean layouts with purpose. Every
   element earns its place. No decorative flourishes, no empty states
   that look broken.

3. **Dark-mode ready.** Use a neutral color system that works in
   both light and dark. Default to light with a clean white/gray
   palette.

4. **Consistent across templates.** Every template uses the same
   design tokens, spacing scale, and component patterns so SEs get
   a professional, cohesive experience regardless of which template
   they generate from.

## Design tokens

### Colors
- Background: #ffffff (surfaces), #f8f9fa (page bg), #f1f3f5 (subtle bg)
- Text: #111827 (primary), #4b5563 (secondary), #9ca3af (muted)
- Border: #e5e7eb (default), #d1d5db (input)
- Accent: #6366f1 (indigo-500 — primary actions, links, active states)
- Accent hover: #4f46e5 (indigo-600)
- Success: #059669 on #ecfdf5
- Warning: #d97706 on #fffbeb
- Error: #dc2626 on #fef2f2
- Status badges: use the success/warning/error palette above

### Typography
- Font: system-ui, -apple-system, sans-serif (no custom fonts — fast load)
- Page title: 24px, weight 600
- Section heading: 18px, weight 600
- Body: 14px, weight 400, line-height 1.6
- Small/meta: 13px, weight 400, color secondary
- Monospace (IDs, code): ui-monospace, monospace, 13px

### Spacing
- Page padding: 24px horizontal, 32px vertical
- Card padding: 20px
- Stack gap (vertical sections): 24px
- Inline gap (horizontal items): 12px
- Max content width: 960px, centered

### Components

**Cards** — white background, 1px border #e5e7eb, border-radius 8px,
subtle shadow (0 1px 2px rgba(0,0,0,0.05)). Hover: shadow increases
slightly. Used for list items, detail views, form containers.

**Buttons** — Primary: bg accent, white text, 8px 16px padding,
border-radius 6px, weight 500. Secondary: white bg, border #d1d5db,
dark text. Disabled: bg #e5e7eb, text #9ca3af.

**Inputs** — Full width, 10px 12px padding, 1px border #d1d5db,
border-radius 6px, font-size 14px. Focus: border accent, ring
2px accent/20%.

**Status badges** — Inline, font-size 12px, weight 500, padding
2px 8px, border-radius 9999px (pill). Use success/warning/error
colors from tokens.

**Naviga