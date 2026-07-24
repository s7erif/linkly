# AUTH_SAVE_CARD.md

## Overview
The application architecture has shifted from a B2C model (where customers sign up to create their own cards) to a B2B Shop Admin model (where the shop owner creates cards on behalf of customers). Because only the Shop Admin uses the dashboard now, we no longer need to arbitrarily interrupt the "Save Card" workflow with a forced Google Sign-In prompt.

## Files Changed
1. `src/app/page.tsx`
2. `src/components/SharePanel.tsx`

## Previous Behavior
- **`handleSave` in `page.tsx`:** Clicking the "Save Card" button would check if `session?.user` was present. If not, it would immediately halt the save process and invoke `signIn("google")`, redirecting the user away from their unsaved work.
- **`SharePanel.tsx`:** The sidebar contained an explicit "Sign in to save, share, and manage multiple cards" section that rendered a "Sign in with Google" button whenever a session was absent.
- **Prop Drilling:** The `signIn` function from `next-auth/react` was passed down deeply into the component tree to enable these interruptions.

## New Behavior
- **Seamless Saving:** The `handleSave` function in `src/app/page.tsx` no longer interrupts the flow to check `!session?.user`. When the "Save Card" button is clicked, it immediately triggers the `fetch` request to `/api/cards` to save the data.
- **Security Maintained:** The backend API route (`/api/cards`) is still protected. If a user somehow accesses the dashboard without a valid session, the API will naturally reject the request. The authentication requirement for protected routes remains strictly in place.
- **Cleaner UI:** The "Sign in with Google" block in the `SharePanel.tsx` component has been completely removed. The UI assumes that if you have access to the dashboard page, you are the authorized Shop Admin.
- **Reduced Prop Drilling:** The unused `signIn` prop has been removed from `SharePanel.tsx` and its parent `page.tsx`.
