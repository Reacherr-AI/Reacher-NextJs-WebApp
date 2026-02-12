# UI Components (Reference)

This document tracks reusable UI and layout components for fast discovery and reuse.

## Location Conventions

- Reusable primitives: `components/ui/*`
- Reusable layout sections: `components/layout/*`
- Core app shell bits: `app/(core)/_components/*`

## Reusable Layout Components

- `components/layout/site-navbar.tsx`
  - Marketing/auth navigation header.
- `components/layout/site-footer.tsx`
  - Shared footer for marketing/static pages.
- `components/layout/have-questions.tsx`
  - FAQ + CTA section used on static pages.
- `components/layout/product-hero.tsx`
  - Reusable hero block for `/product` and `/solution`.
- `components/layout/feature-card.tsx`
  - Gradient card pattern for marketing feature/use-case cards.

## Shared UI Primitives

- Inputs/actions: `button.tsx`, `input.tsx`, `phone-input.tsx`
- Overlay primitives: `popover.tsx`, `sheet.tsx`, `alert-dialog.tsx`, `tooltip.tsx`
- Navigation primitives: `dropdown-menu.tsx`, `command.tsx`, `scroll-area.tsx`, `separator.tsx`
- Identity/status: `avatar.tsx`, `skeleton.tsx`
- App shell: `sidebar.tsx`
- Marketing helpers: `marquee.tsx`, `features-grid.tsx`

## Core Console Components

- `app/(core)/_components/app-sidebar.tsx`
  - Main workspace navigation (Agents, Knowledge Base).
- `app/(core)/_components/nav-user.tsx`
  - User dropdown/signout entry.
- `components/sign-out-dialog.tsx`
  - Shared sign-out confirmation modal.

## Styling System Notes

- Global tokens and theme variables are in `app/globals.css`.
- Dark theme is forced at root (`<html className="dark">`).
- Repeated page shell look:
  - black base background,
  - radial-gradient hero container,
  - rounded border + blur/glass panel styling.

## Reuse Guidance

When introducing new UI patterns:

1. Promote common patterns to `components/ui` or `components/layout`.
2. Keep feature-specific logic in route `_components` folders.
3. Update this document with file path + short purpose note.
