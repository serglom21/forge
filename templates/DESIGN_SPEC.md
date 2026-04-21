# Template Design Specification

All reference app templates must follow this spec. These apps are
demoed live to customers by Sales Engineers and shared as code
references — they must look like real, modern applications.

## Design principles

1. **Look like a real product.** The customer should think "this
   looks like something my team would build."
2. **Minimal but not empty.** Clean layouts with purpose. Every
   element earns its place.
3. **Consistent across templates.** Same tokens, spacing, and
   primitives regardless of which template or vocabulary generated it.
4. **Readable code.** Inline styles only — no CSS frameworks. The
   customer reads the source; styles must be self-explanatory.
5. **Composable.** Pages are built from layout primitives, not
   bespoke designs. New page types compose from existing primitives
   without requiring new design work.

## Design tokens

### Colors
- Page background: #f8f9fa
- Surface (cards, nav, panels): #ffffff
- Text primary: #111827
- Text secondary: #4b5563
- Text muted: #9ca3af
- Border: #e5e7eb
- Input border: #d1d5db
- Input focus border: #6366f1
- Input focus ring: rgba(99, 102, 241, 0.2)
- Accent: #6366f1 (primary actions, links, active states)
- Accent hover: #4f46e5
- Success text: #059669
- Success background: #ecfdf5
- Warning text: #d97706
- Warning background: #fffbeb
- Error text: #dc2626
- Error background: #fef2f2

### Typography
- Font stack: system-ui, -apple-system, sans-serif
- Page title: 24px, weight 600, color primary
- Section heading: 18px, weight 600, color primary
- Body: 14px, weight 400, line-height 1.6, color primary
- Secondary text: 14px, weight 400, color secondary
- Small/meta: 13px, weight 400, color muted
- Monospace: ui-monospace, SFMono-Regular, monospace, 13px

### Spacing
- Page max width: 960px, centered with auto margins
- Page padding: 24px horizontal, 32px vertical
- Card padding: 20px
- Section gap (vertical stacking): 24px
- Component gap (between related items): 12px
- Tight gap (inline elements): 8px

### Elevation
- Card default: box-shadow 0 1px 2px rgba(0,0,0,0.04)
- Card hover (clickable): box-shadow 0 2px 8px rgba(0,0,0,0.08)
- No other shadow levels. No drop shadows on text, buttons, or nav.

## Components

### Navigation bar
Top bar. White background, 48px height, 1px bottom border.
App name on the left: 15px, weight 600, color primary.
Nav links on the right: 14px, color secondary, color accent on hover.
No hamburger menus, dropdowns, or icons. Horizontal links only.

### Card
White background, 1px border, border-radius 8px, default elevation.
Padding 20px. Content is flexible — cards are containers, not
opinionated about what goes inside. Clickable cards gain hover
elevation on mouseover.

### Button — primary
Background accent, white text, 8px 16px padding, border-radius 6px,
weight 500, 14px. Hover: background accent-hover. No border.

### Button — secondary
White background, 1px border #d1d5db, color primary, same sizing
as primary. Hover: background #f8f9fa.

### Button — disabled
Background #e5e7eb, color #9ca3af, cursor not-allowed. Same sizing.

### Input / Textarea
Full width, 10px 12px padding, 1px border input-border,
border-radius 6px, 14px, font stack. Focus: border input-focus-border,
outline 2px solid input-focus-ring. Textarea shares these tokens.

### Status badge
Pill shape: border-radius 9999px, 12px font, weight 500,
2px 10px padding. Three variants using the semantic color pairs:
- Success: success-text on success-background
- Warning: warning-text on warning-background
- Error: error-text on error-background

### Feedback banner
Full width inside its parent container. 12px 16px padding,
border-radius 6px. Uses success or error bg/text color pairs.
Appears inline below forms or actions — never as a modal or toast.

### Monospace value
ui-monospace font, 13px, color muted. Used for IDs, timestamps,
technical identifiers, code references. Never for labels or body text.

## Layout primitives

These are reusable patterns, not specific pages. Any template page
composes from one or more of these. The generator selects primitives
based on the pattern's surface.pages[].kind field.

### Header block
Page title (24px, 600) on the left. Optional action button
right-aligned. Flexbox row, space-between, align-center.
Bottom margin 24px to separate from content below.

### Card grid
Vertical stack of cards with 12px gap. Each card has flexible
content: primary text (bold), secondary text (muted), optional
badge (right-aligned), optional metadata line (small/mono, bottom).
Used for: lists, queues, feeds, search results, job statuses,
audit logs, notification streams.

### Single card
One prominent card filling the content width. Internal sections
separated by subtle borders or spacing. Used for: detail views,
summaries, status panels, confirmation screens, profile views.

### Form card
A card containing stacked fields with 16px vertical gap between
fields. Each field: label (14px, weight 500, 4px bottom margin)
above the input. Submit button at the bottom, left-aligned.
Feedback banner appears below the form on submit.
Used for: creation forms, edit forms, settings, configuration,
search filters, import/upload interfaces.

### Data display
Key-value pairs. Label in small/muted text (13px), value below in
body text (14px) or monospace (for technical values). Pairs stacked
vertically with 12px gap, or arranged in a 2-column grid for dense
information. Used inside single cards for: detail views, status
panels, metric summaries, configuration readouts.

### Back navigation
Text link: "← {label}" in 14px, color secondary, no underline.
Positioned above the main content with 16px bottom margin.
Used on any page that drills down from a list or parent view.

### Empty state
Centered in the content area. Secondary text (14px) describing
what would be here. Single primary button below with a clear action
("Create your first item"). No illustrations, no icons.

### Split layout
Two-column flexbox. Default split: 60% left, 40% right with 24px gap.
Each column contains other primitives (cards, data display, etc.).
Used for: side-by-side comparisons, map+list, chart+table,
main content + sidebar summary. Not used in MVP template but
defined for future templates.

### Section divider
A labeled separator within a page. Small/muted text with optional
horizontal rule. Used to group content on long pages without
creating separate cards.

## Page composition examples

These show how primitives combine. They are examples, not
exhaustive — any page can combine any primitives.

**A list page:** header block + card grid + empty state (when no data)

**A detail page:** back navigation + single card containing data display

**A form page:** header block + form card + feedback banner

**A landing page:** header block + card grid (where cards link to sections)

**A dashboard page:** header block + split layout (card grid left +
single card right) + data display inside cards

**A queue/jobs page:** header block + card grid (status badges on each
card) + section divider between active and completed

**A settings page:** header block + form card per section + section dividers

## What NOT to do
- No gradients, glassmorphism, or shadows heavier than card-hover
- No custom fonts or font loading
- No icons or icon libraries (text labels are clearer in reference code)
- No animations or transitions
- No CSS frameworks (Tailwind, Bootstrap, Chakra, etc.)
- No component library imports (shadcn, MUI, Radix, etc.)
- No dark mode toggle
- No modals, toasts, or popovers (inline feedback only)
- No responsive breakpoints (reference apps are viewed on desktop)
- No images or illustrations