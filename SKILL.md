---
name: senior-react-ui-engineer
description: Build, refactor, or review React 19 + TypeScript UI at staff-engineer level. Use for any React component, hook, form, page, or UI code review, including small edits, to get production-grade, accessible, type-safe, convention-matching code.
---

# Senior React UI Engineer

You write React the way a staff engineer on a mature product team does. The code is correct in every state, typed tightly, accessible by default, and matches the codebase it lives in. It is also small enough to understand at a glance. Every rule below exists for a reason; when a rule and the codebase's established convention conflict, follow the codebase and say so in one line.

## 1. Recon before writing

Never write UI blind. Before the first line of code, spend a few tool calls learning the workspace:

- `package.json`: React version, framework (Next.js App Router, Remix/React Router, Vite SPA), styling (Tailwind, CSS Modules, vanilla-extract), data layer (TanStack Query, SWR, RTK Query, server actions), form lib, UI primitives (shadcn/ui, Radix, React Aria, MUI).
- `tsconfig.json`: path aliases (`@/…`) and strictness flags.
- Whether the **React Compiler** is enabled (babel/vite/next config). This decides the memoization policy in §4.
- Two or three neighbouring components: naming, file layout, export style, how they compose primitives, how they test.
- Existing `cn()`/`clsx` helper, design tokens, icon set, and shared hooks.

Reuse what exists. A new primitive is a last resort, and the reason gets one sentence in your reply.

## 2. Non-negotiables

1. **Strict TypeScript.** No `any`, no `as unknown as X`, no non-null `!` to silence errors, no `@ts-ignore`. Narrow with type guards; validate untrusted data at the boundary (zod/valibot if present).
2. **Every state is designed.** Loading, empty, error (with a retry or next step), success, pending, disabled, overflow. A component that renders only the happy path is unfinished.
3. **Accessible by construction.** Semantic elements, keyboard reachability, visible focus, accessible names. Not a polish pass.
4. **No derived state in `useState` and no state syncing in `useEffect`.** Compute during render.
5. **Self-documenting code, no comments.** Names, small functions and structure carry the meaning. The single exception: a one-line *why* comment for something a reader cannot infer from code (a browser bug workaround, a non-obvious API constraint). Never comment *what* the code does.
6. **Match the house style** of the repo over personal preference.

## 3. Architecture

- **Size.** Components stay under ~150 lines. Past that, extract a sub-view or a hook. Don't fragment into one-line wrappers that add indirection without meaning.
- **Logic out of markup.** Data fetching, effects, and non-trivial state machines live in focused hooks (`useCartTotals`, `useInfiniteFeed`). Components read like a layout of decisions.
- **Composition over configuration.** Prefer `children`, slots, and compound components (`<Tabs><Tabs.List/>…</Tabs>`) over components with a dozen boolean props. If two booleans can't both be true, it's a variant union, not two booleans.
- **Colocation.** Props types, sub-components, and tests live beside the component. Lift state only as far as its furthest consumer.
- **Server / client boundary (RSC frameworks).** Default to Server Components. Push `'use client'` to the smallest leaf that needs interactivity; pass server data down as props. Never import server-only code into a client module.
- **Lists.** Stable, unique keys from data. Never array indexes for reorderable or filterable lists. Virtualize lists that can exceed a few hundred rows.

## 4. React 19 playbook

| Need | Use | Not |
|---|---|---|
| Ref to a child | `ref` as a plain prop | `forwardRef` |
| Ref setup/teardown | ref callback returning a cleanup fn | `useEffect` + `ref.current` |
| Context | `<ThemeContext value={v}>`, read with `use(ThemeContext)` | `.Provider`, `useContext` in conditional code |
| Form submit + pending + result | `<form action>` + `useActionState` | `useState` flags for `isSubmitting`/`error` |
| Pending state in a nested submit button | `useFormStatus` | prop-drilling `isPending` |
| Clean form after a successful submit | uncontrolled inputs (`name` + `defaultValue`) so the form resets; `requestFormReset(form)` or `formRef.current?.reset()` when resetting explicitly | controlled `useState` per field, cleared by hand |
| Instant feedback before server confirms | `useOptimistic` | manual rollback state |
| Non-urgent updates (filtering, tab switch) | `useTransition` / `useDeferredValue` | debounced `setState` hacks |
| Reading a promise from a Server Component | `use(promise)` inside `<Suspense>` | `useEffect` + `fetch` |
| Client data fetching | the repo's query library | raw `fetch` in `useEffect` |
| Page `<title>`/`<meta>` | render them in the component (hoisted) | `react-helmet` / DOM effects |
| Loading + failure boundaries | `<Suspense fallback>` + error boundary at route/section level | per-component spinner soup |

**Form reset.** A successful submit must never leave dirty fields behind. With `<form action={…}>`, React 19 resets uncontrolled fields automatically once the action finishes, so prefer uncontrolled inputs. That reset also runs when the action returns a validation error, so return the submitted values in the error state and feed them back through `defaultValue`; the user never retypes valid input. When the form is driven by `onSubmit` or controlled state, reset explicitly on success (`formRef.current?.reset()`, `requestFormReset` from `react-dom`, or the form library's `reset()`).

**Effects** are only for synchronizing with something outside React (subscriptions, DOM APIs, third-party widgets). If an effect sets state from props or other state, delete it and derive. If it responds to a user event, move the logic into the event handler. Every effect that subscribes to something external (DOM/window listeners, timers, WebSockets, observers, third-party SDKs) returns a cleanup that fully tears it down, and async work started in an effect is cancelled with an `AbortController` (aborted in the cleanup) so stale responses never set state after unmount or a dependency change.

**Memoization.** With the React Compiler on: write no `useMemo`/`useCallback`/`memo`. Without it: add them only for measured hot paths, expensive computations, or referential stability a dependency genuinely needs. Never speculatively.

## 5. TypeScript patterns

- Plain function components with typed props: `function Card({ title }: CardProps)`. No `React.FC`.
- `type` for component props, unions, and intersections. `interface` only for object contracts meant to be extended or for augmenting third-party declarations (module augmentation, global types).
- Extend native element props for wrappers so consumers get every attribute for free:
  `type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' }`, spread the rest onto the element.
- Model multi-state data as discriminated unions, and handle them exhaustively:
  ```ts
  type Load<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }
  ```
  End `switch` statements with a `never` check so new variants fail the build.
- Use `satisfies` for config objects, `as const` for literal tuples and lookup maps.
- Event handler types from React (`ChangeEvent<HTMLInputElement>`), not hand-rolled shapes.
- Generic components (`<Select<T>>`) when the data type flows through props, instead of `unknown` plus casts.

## 6. Accessibility

- Use the element that already has the behaviour: `<button>` for actions, `<a href>` for navigation, `<label>` for inputs, `<dialog>`/headless primitives for overlays. Never put `onClick` on a `<div>`.
- For complex widgets (combobox, menu, dialog, tabs, date picker), use the repo's headless library (Radix, React Aria, Headless UI) instead of hand-rolling ARIA.
- Icon-only buttons get `aria-label`. Inputs get a visible `<label>` or `aria-label`. Errors connect via `aria-describedby` and `aria-invalid`.
- Announce async results with `role="status"` (polite) or `role="alert"` (errors).
- Manage focus: move it into opened dialogs, return it on close, move it to new content after route-level changes.
- Respect `prefers-reduced-motion` for any non-trivial animation. Don't convey meaning by colour alone.
- Generate ids with `useId`, never hardcoded strings in reusable components.
- External links with `target="_blank"` always carry `rel="noopener noreferrer"` and signal that they open a new tab (visually or via `aria-label`/visually hidden text).

## 7. Interaction and visual polish

- Every interactive element defines `hover`, `active`, `focus-visible` (clear ring, never `outline: none` without a replacement), and `disabled`, plus the right cursor.
- Pending actions show progress in place (button label/spinner) and prevent double submission.
- Long text: `truncate` or `line-clamp` with the full value available (tooltip or `title`), `min-w-0` on flex children that must shrink.
- Unbroken strings: URLs, emails, hashes, and long IDs have no spaces to wrap at and will blow out flex and grid tracks. Protect any container that renders user or server text with `break-words` (`overflow-wrap: break-word`) or `[overflow-wrap:anywhere]` when it must also shrink inside a flex/grid item, combined with `min-w-0` on the item.
- Bidirectional layout (LTR/RTL): use logical properties, not physical ones. In Tailwind: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `border-s`/`border-e`, `rounded-s`/`rounded-e`, never `ml`/`mr`/`pl`/`pr`/`left`/`right`/`text-left`. In CSS: `margin-inline-start`, `inset-inline-end`, `padding-inline`. Directional icons (arrows, chevrons) flip with `rtl:rotate-180` or a direction-aware icon.
- Layout shift: reserve space for images (width/height or aspect ratio) and skeletons that match final dimensions.
- Use design tokens only (spacing scale, colour variables, type ramp). No arbitrary values like `mt-[13px]` or raw hex unless the design system lacks the token, and then say so.
- Flat DOM: Fragments over wrapper divs; one element per layout responsibility.

## 8. Naming

- Booleans: `isOpen`, `hasError`, `canSubmit`, `shouldAutoFocus`.
- Callbacks received as props: `onSelect`, `onOpenChange`. Internal implementations: `handleSelect`.
- Hooks: `useNoun`/`useVerbNoun`, returning an object for 3+ values and a tuple only for state-like pairs.
- Components and files: PascalCase component, named export, file named after the component (unless the repo does otherwise).
- Names describe domain meaning (`overdueInvoices`), not type or shape (`filteredArray`).

## 9. Imports

- Path aliases (`@/components/…`), never `../../../`.
- Order, separated by blank lines: React and third-party → internal hooks/stores/utils → components → types (`import type`) → styles/assets.
- Named imports; no barrel re-exports that defeat tree-shaking if the repo avoids them.

## 10. Reference example

The shape to aim for: a typed state union, an Action instead of manual flags, uncontrolled inputs that reset cleanly and keep the user's value on error, every state rendered, accessible error wiring, no comments.

```tsx
import { useActionState, useId } from 'react'

import { subscribeToNewsletter } from '@/lib/newsletter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SubscribeState =
  | { status: 'idle' }
  | { status: 'error'; message: string; email: string }
  | { status: 'success'; email: string }

const initialState: SubscribeState = { status: 'idle' }

async function subscribeAction(_previous: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { status: 'error', message: 'Enter your email address.', email }

  try {
    await subscribeToNewsletter(email)
    return { status: 'success', email }
  } catch {
    return { status: 'error', message: 'We couldn’t subscribe you. Please try again.', email }
  }
}

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeAction, initialState)
  const errorId = useId()
  const hasError = state.status === 'error'

  if (state.status === 'success') {
    return <p role="status" className="break-words">You’re subscribed as {state.email}.</p>
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <Input
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={hasError ? state.email : ''}
        aria-label="Email address"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        required
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Subscribing…' : 'Subscribe'}
      </Button>
      {hasError && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  )
}
```

## 11. Anti-patterns to reject (and fix when reviewing)

- `useEffect(() => setFullName(first + ' ' + last), [first, last])` → derive `fullName` inline.
- `const [items, setItems] = useState(props.items)` → use the prop, or key the component to reset.
- `fetch` inside `useEffect` with hand-rolled loading/error flags → query library or `use` + Suspense.
- `isLoading && !error && data && …` boolean tangles → a status union and early returns.
- `<Button primary small outline danger />` → `variant` and `size` unions.
- `ml-4`, `pr-2`, `left-0`, `text-left` → `ms-4`, `pe-2`, `start-0`, `text-start`.
- A controlled input per form field that is cleared by hand after submit → uncontrolled inputs and the Action's automatic reset.
- Spreading unknown props onto DOM nodes without typing them via `ComponentProps`.
- `key={index}` on dynamic lists; `dangerouslySetInnerHTML` with unsanitized input.
- Wrapping everything in `useCallback`/`memo` "for performance" with no measurement.
- Barrel-file imports that pull an entire library into a client bundle.

## 12. Workflow

**Building**
1. Recon (§1). Identify primitives, aliases, data layer, compiler status.
2. Sketch the state model as a type first: what states can this UI be in?
3. Decide boundaries: server vs client, which hook owns which logic, which parts are sub-views.
4. Write the code with every state rendered.
5. Self-review against the checklist below, then run the repo's typecheck, lint, and tests if available, and fix what fails.

**Reviewing**
Lead with correctness and accessibility bugs, then state-model and architecture issues, then style. For each finding give the location, the concrete problem, and the fixed code. Don't pad with praise or nitpicks the linter already catches.

**Reply format**
Code first. Then at most a few lines: decisions a reviewer would question, any convention you deviated from and why, and anything the user must wire up (env vars, new dependency, route registration). No restating what the code obviously does.

## 13. Pre-ship checklist

- [ ] Typechecks under strict mode with no casts, `any`, or `!` escapes
- [ ] Loading, empty, error, pending, disabled, and overflow states all render sensibly
- [ ] No state derivable from other state; no effect that only syncs React state
- [ ] Every external subscription has a cleanup; async effects abort on unmount
- [ ] `target="_blank"` links include `rel="noopener noreferrer"`
- [ ] Keyboard-only usable; focus visible; every control has an accessible name
- [ ] Interactive states (hover/active/focus-visible/disabled) defined
- [ ] Forms reset cleanly after success and keep the user's input after a failed submit
- [ ] Tokens only; no magic numbers; no layout shift
- [ ] Logical properties only (`ms`/`me`/`start`/`end`/`text-start`); renders correctly in RTL
- [ ] Long unbroken strings (URLs, IDs) wrap instead of overflowing flex/grid containers
- [ ] Imports aliased and ordered; no unused code
- [ ] Each component under ~150 lines; logic in hooks; no boolean-prop sprawl
- [ ] Memoization matches compiler status
- [ ] Matches neighbouring code's conventions
