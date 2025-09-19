# Meoris Sandal - Implementation TODO

Approved Plan Summary:
- Modular UI with components:
  - src/components/layout/Header.tsx
  - src/components/ui/IconButton.tsx
  - src/components/sections/HeroSection.tsx
- Background split 50% left light gray, 50% right white (applied globally via CSS linear-gradient).
- Header merged with first section; top-right icons: cart, favorit, user, search.
- Left side of the section shows mockup image test1.png.
- Assets located in public/images.

Color:
- Light gray: slate-100 default (#f1f5f9) if using Tailwind palette. If exact requested, using #f3f4f6.

Testing levels:
- Critical-path to be executed after implementation.
- Optional thorough testing to be confirmed.

---

## Tasks

1) Create reusable UI component: IconButton
   - Path: src/components/ui/IconButton.tsx
   - Description: A small, accessible icon button that accepts href (optional), label, src, width/height, className.
   - Status: PENDING

2) Create Header component with top-right icons
   - Path: src/components/layout/Header.tsx
   - Description: Header aligned to top of the page/section, contains icons: cart, favorit, user, search on the right.
   - Status: PENDING

3) Create HeroSection (first section)
   - Path: src/components/sections/HeroSection.tsx
   - Description: 2-column layout, left column contains mockup image test1.png, right column reserved for future content.
   - Status: PENDING

4) Apply global background split across body
   - Path: src/app/globals.css
   - Description: Use linear-gradient to split background left 50% light gray and right 50% white; ensure full-height body.
   - Status: PENDING

5) Render components on home page
   - Path: src/app/page.tsx
   - Description: Render & compose Header + HeroSection.
   - Status: PENDING

6) Critical-path testing (post-implementation)
   - Check: page renders without errors; header visible; icons at top-right; background split 50/50; test1.png shows on left.
   - Status: PENDING

7) Thorough testing (optional)
   - Hover/focus states, accessibility labels, responsiveness across breakpoints, image performance.
   - Status: PENDING

---

## Notes
- Icons expected under public/images: cart.png, favorit.png, user.png, search.png.
- Mockup image under public/images: test1.png.
- Tailwind and Next Image are used; images from public can be referenced with src="/images/..".

---

## Implementation Status (Hero Section)

- [x] Fonts loaded via next/font/local in src/app/layout.tsx and exposed as --font-heading and --font-body, used by .font-heading and .font-body classes.
- [x] Homepage created at src/app/page.tsx with:
  - Split background inherited from body (50% #f3f4f6 left, 50% #ffffff right).
  - Left column: centered /images/test1.png.
  - Right column: heading "Sock Sneakers" and "Cloud" with heading font, description with body font, "Lihat detail" button with black border and right-arrow icon, and product image /images/test1-produk.png aligned with heading.
  - Responsive behavior: stacks on small screens.
- [x] Verified rendering locally using npm run dev (Next on http://localhost:3001 when 3000 busy).
