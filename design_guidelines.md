# BProjetos Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from modern education platforms like Notion (for organization), Linear (for clean UI), and Asana (for project tracking), combined with gamification elements from Duolingo. The design emphasizes clarity, visual hierarchy, and delightful micro-interactions that make educational project management engaging.

## Core Design Principles
1. **Clarity First**: Educational tools must be immediately understandable - no learning curve
2. **Gamification Joy**: Progress indicators, achievements, and visual rewards motivate continued use
3. **Professional Polish**: Teachers need to feel this is a serious, trustworthy tool
4. **Visual Breathing Room**: Generous whitespace prevents cognitive overload in data-heavy interfaces

---

## Typography

**Font Families:**
- **Display/Headers**: 'Outfit' (Google Fonts) - Modern, geometric, friendly
  - H1: 48px / font-bold / tracking-tight
  - H2: 36px / font-semibold
  - H3: 24px / font-semibold
  - H4: 18px / font-semibold

- **Body/Interface**: 'Plus Jakarta Sans' (Google Fonts) - Highly legible, professional
  - Body: 16px / font-normal / leading-relaxed
  - Small text: 14px / font-medium
  - Captions: 12px / font-medium / uppercase / tracking-wide

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** consistently
- Component padding: p-4, p-8
- Section spacing: py-12, py-16
- Card gaps: gap-4, gap-8
- Element margins: m-2, m-4, m-8

**Grid Structure:**
- Main dashboard: Sidebar (280px fixed) + Content area (flex-1)
- Project cards: grid-cols-1 md:grid-cols-2 xl:grid-cols-3
- Statistics: grid-cols-2 md:grid-cols-4
- Max container width: max-w-7xl

---

## Visual Treatment

**Glassmorphism Effect** (primary design signature):
```
Background: rgba(255, 255, 255, 0.7)
Backdrop-filter: blur(20px)
Border: 1px solid rgba(255, 255, 255, 0.5)
Shadow: 0 8px 32px rgba(31, 38, 135, 0.15)
```

**Gradient Backgrounds:**
- Hero sections: Radial gradient from indigo-100 → purple-100 → white
- Accent elements: Linear gradient indigo-600 → purple-600
- Status indicators: Project-specific theme gradients

**Card Elevations:**
- Default cards: shadow-lg with glass effect
- Hover state: shadow-xl with subtle lift (transform: translateY(-2px))
- Active projects: Add subtle glow with matching theme accent

---

## Component Library

### Navigation
- **Sidebar**: Fixed 280px, glass-card background, subtle shadow
  - Logo + brand (56px height, centered)
  - Nav items: Full-width, p-4, rounded-lg, hover bg-white/50
  - Active state: bg-indigo-50, border-l-4 border-indigo-600
  - Icons: 20px, inline with 12px gap to labels

### Project Cards
- **Structure**: Glass card, p-8, rounded-2xl
- **Header**: Project title (H3) + subject tags (pill badges)
- **Status badge**: Top-right, rounded-full, px-4 py-1, matching theme
- **Progress bar**: Full-width, h-2, rounded-full, bg-gray-200, fill with theme gradient
- **Metadata grid**: 2-column grid showing students, deadline, teacher avatar
- **Theme variants**: green (sustainable), blue (communication), purple (creative), red (urgent)

### Statistics Dashboard
- **Stat cards**: 4-column grid, glass-card, p-8, rounded-xl
- **Big number**: 36px font-bold, theme-colored
- **Label**: 14px text-gray-600 below number
- **Icon**: 40px, top-right, theme-colored with light background circle

### Forms & Inputs
- **Text inputs**: h-12, px-4, rounded-lg, border-2 border-gray-200, focus:border-indigo-500
- **Textareas**: min-h-32, same border treatment
- **Buttons Primary**: px-8 py-3, rounded-lg, indigo-600 background, white text, font-semibold, shadow-lg
- **Buttons Secondary**: Same dimensions, white background, gray-700 text, border-2 border-gray-300

### Rubric Builder
- **Table layout**: Clean rows with alternating subtle bg (bg-gray-50)
- **Criteria column**: font-semibold, w-1/3
- **Weight slider**: Custom styled range input with indigo accent
- **Level pills**: Horizontal scroll, rounded-full badges, gap-2

### Achievement Cards
- **Layout**: Glass card, flex horizontal, p-6, gap-4
- **Icon area**: 64px circle, gradient background matching achievement
- **Progress ring**: Circular SVG progress indicator around icon
- **Text area**: flex-col, title (font-semibold), description (text-sm text-gray-600)
- **XP badge**: Absolute top-right, rounded-full, purple gradient, white text

---

## Images

**Hero Section Image**: 
- Full-width decorative illustration showing diverse students collaborating around a table with digital devices, plants, and project materials
- Style: Modern, friendly illustration with purple/indigo accent colors
- Placement: Right side of hero (60% width on desktop), below text on mobile
- Alternative: Abstract geometric pattern with educational iconography

**Teacher Avatars**:
- Circular, 40px default size (64px in profile views)
- API: DiceBear Avataaars (already implemented)
- Border: 2px solid white with subtle shadow

**Empty States**:
- Friendly illustrations for "No projects yet", "No students assigned"
- Style: Minimal line art with single accent color

---

## Animations (Minimal Use)

- **Page transitions**: 600ms fade-in only
- **Card hover**: 200ms translateY(-2px) with shadow change
- **Progress bars**: 1s ease-out fill animation on page load
- **Achievement unlock**: Scale + fade celebration (one-time only)
- **NO scroll animations, NO parallax, NO continuous motion**

---

## Accessibility
- All interactive elements: min-height 44px for touch targets
- Form inputs: Visible labels above inputs (not placeholders)
- Focus states: 2px solid indigo-600 ring with 2px offset
- Contrast ratios: Minimum 4.5:1 for all text
- Keyboard navigation: Clear focus indicators throughout

---

## Special Features

**Gamification Elements:**
- XP progress bars with level indicators
- Badge showcase using grid-cols-3 with locked/unlocked states (grayscale filter for locked)
- Achievement popups: Toast-style, bottom-right, glass-card, auto-dismiss 5s

**BNCC Competency Tags:**
- Pill badges, small (text-xs), multiple colors for different competency categories
- Wrap in flex-wrap container, gap-2

**Status Workflow Colors:**
- Planning: blue-500
- In Progress: green-500
- For Evaluation: purple-500
- Delayed: red-500

This design creates a professional yet approachable educational platform that motivates through visual delight while maintaining serious functionality for teachers and students.