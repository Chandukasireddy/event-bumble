

# Name-Based Role Logic: Organizer vs. Participant

## Overview

This plan implements a name-based identity system where Organizers and Participants get different views and permissions -- without formal authentication. Identity is determined by matching a locally-stored name against database records.

## Current State

- No authentication or identity system exists
- Dashboard shows ALL events (no filtering by creator)
- Events table has no `creator_name` field
- Participants register via `/register/:shareCode` and are stored in localStorage per event
- No permission checks on organizer-only actions (edit, manage, settings)

## Data Structure Changes

### Database Migration: Add `creator_name` to events table

```sql
ALTER TABLE public.events ADD COLUMN creator_name text;
```

This column stores the name of the organizer who created the event. Existing events will have `NULL` for this field (they'll be visible to all organizers until updated).

---

## Implementation Plan

### 1. Organizer Identity Entry (Landing Page Update)

**File: `src/pages/Index.tsx`**

- Update the "Create Your Event" CTA to link to `/dashboard` (already does this)
- No separate organizer form needed on landing -- the identity prompt happens on the Dashboard

### 2. Dashboard: Organizer Name Prompt + Filtered View

**File: `src/pages/Dashboard.tsx`**

**On first visit:**
- Check `localStorage.getItem('organizerName')`
- If not set, show a name entry form: "Enter your name to manage events"
- Store the entered name in `localStorage` as `organizerName`
- Show a "Change Identity" text link in the header to switch names

**Event Creation:**
- When creating an event, include `creator_name` from `localStorage.getItem('organizerName')` in the insert

**Event Filtering:**
- Fetch only events where `creator_name` matches the stored organizer name
- Query: `.eq('creator_name', organizerName)`
- Fallback: Also show events with `creator_name = null` (legacy events)

**Header Update:**
- Show "Logged in as: [Name]" with a small "Change" link
- "Change" clears `organizerName` from localStorage and re-prompts

### 3. Participant Flow (Already Mostly Working)

**File: `src/pages/PublicRegister.tsx`** -- Minimal changes needed

- Already collects participant name and stores in `localStorage` as `currentUser_{eventId}`
- After registration, redirects to `/event/{eventId}` where participant sees the event detail

**File: `src/pages/EventDetail.tsx`** -- Add permission checks

- Determine user role by checking:
  1. Is `localStorage.getItem('organizerName')` set AND does it match `event.creator_name`? --> Organizer view
  2. Is `localStorage.getItem('currentUser_{eventId}')` set? --> Participant view
  3. Neither? --> Read-only / prompt to register

### 4. Permission-Based UI in EventDetail

**File: `src/pages/EventDetail.tsx`**

**Organizer View (full access):**
- Show all tabs (AI Matching, Requests, Participants)
- Show "Copy Link" button
- Show event management actions
- Can trigger AI matching for all participants

**Participant View (limited):**
- Show AI Matching tab (personal matches only -- already works this way)
- Show Requests tab (their own requests)
- Show Participants tab (read-only list)
- Hide "Copy Link" and management actions
- Event details shown as read-only text

**Implementation approach:**
```tsx
const isOrganizer = (() => {
  const orgName = localStorage.getItem('organizerName');
  return orgName && event?.creator_name && 
    orgName.toLowerCase() === event.creator_name.toLowerCase();
})();
```

### 5. Participant Dashboard View

**New consideration:** Currently participants go directly to `/event/{eventId}`. For a participant to see "all their events," we need a way to look up events by participant name.

**Approach:** Add a "My Events" section to the Dashboard when an organizer name is NOT set but participant registrations exist:

- Scan localStorage for all `currentUser_*` keys
- Extract event IDs from those keys
- Fetch those events from the database
- Display as a simpler read-only list (no "Create Event" or management actions)

**OR simpler approach:** Add a participant entry point on the Dashboard:
- If no `organizerName` is set, show two options:
  - "I'm an Organizer" --> Name entry form, then organizer dashboard
  - "I'm a Participant" --> Name entry, then show events where their name exists in registrations

---

## Detailed File Changes

| File | Changes |
|------|---------|
| **Database** | Add `creator_name` text column to `events` table |
| `src/pages/Dashboard.tsx` | Add organizer name prompt, filter events by creator_name, save creator_name on event creation, add role selection (organizer vs participant), participant event list |
| `src/pages/EventDetail.tsx` | Add `isOrganizer` check, conditionally show/hide management UI, make participant view read-only |
| `src/pages/Index.tsx` | Minor: Update CTA links if needed for role split |
| `src/components/AIMatchingPanel.tsx` | Pass `isOrganizer` prop to control "generate matches for all" vs "find my matches" |
| `src/components/ParticipantCard.tsx` | Hide "Meet" action for organizers (they're not participants) |

---

## User Flow Summary

```text
Landing Page (/)
    |
    v
Dashboard (/dashboard)
    |
    +-- No identity stored?
    |       |
    |       v
    |   "Who are you?" prompt
    |       |
    |       +-- "I'm an Organizer" --> Enter name --> See YOUR events
    |       |
    |       +-- "I'm a Participant" --> Enter name --> See events you're registered for
    |
    +-- Organizer identity stored?
    |       |
    |       v
    |   Filtered event list (creator_name matches)
    |   Can create events, manage, copy links
    |
    +-- Participant identity stored?
            |
            v
        Read-only event list (events where name is in registrations)
        Click event --> EventDetail (participant view)
```

---

## Permission Matrix

| Action | Organizer | Participant |
|--------|-----------|-------------|
| Create Event | Yes | No |
| Edit Event Details | Yes | No |
| Copy Share Link | Yes | No |
| View Participants List | Yes | Yes (read-only) |
| Trigger AI Matching (all) | Yes | No |
| Find My Matches | No (not a participant) | Yes |
| Send Meeting Requests | No | Yes |
| Accept/Decline Requests | No | Yes |
| View Event Info | Yes (full) | Yes (read-only) |
| Switch Role | Yes (via "Change" link) | Yes (via "Change" link) |

---

## Edge Cases Handled

- **Same name, different people:** This is a known limitation of name-based matching. Names are compared case-insensitively. Users are informed this is not secure authentication.
- **Organizer who is also a participant:** They can switch roles via the dashboard. When viewing as organizer, they see management. When registered as participant, they see matches.
- **Legacy events (no creator_name):** Shown to all organizers with a note "unclaimed event."
- **Name changes:** If an organizer changes their stored name, they lose access to previously created events. A warning is shown before changing.

---

## Testing Checklist

- [ ] Dashboard shows role selection prompt on first visit
- [ ] Organizer can enter name and see only their events
- [ ] Creating an event saves `creator_name` correctly
- [ ] Participant can enter name and see their registered events
- [ ] EventDetail hides management UI for participants
- [ ] EventDetail shows full controls for organizers
- [ ] "Change Identity" works and re-prompts
- [ ] Existing events (without creator_name) are handled gracefully
- [ ] Mobile responsive for the role selection prompt

