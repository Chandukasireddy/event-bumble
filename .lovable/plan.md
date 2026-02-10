

## AI Matching Tab: Participant-Only Filtering

### Summary
Update the `AIMatchingPanel` component so participants only see matches involving themselves, exclude already-contacted people, and see a proper empty state. Organizer view remains unchanged. Remove the zig-zag indentation pattern so all matches are left-aligned.

---

### Changes (single file: `src/components/AIMatchingPanel.tsx`)

**1. Filter matches after generation (participant view only)**

After AI results are mapped in `generateMatches()`, if `currentUser` exists and `isOrganizer` is false, filter to keep only suggestions where `participant1.id === currentUser.id` or `participant2.id === currentUser.id`. This replaces the current sort-only logic at lines 226-234.

**2. Filter matches on render (`filteredSuggestions`)**

The existing `filteredSuggestions` computation (around line 330) already excludes people with existing requests. Add an additional filter: if `currentUser` exists and not organizer, only show matches involving the current user.

**3. Remove zig-zag indentation**

Remove the `indentPattern` array and the dynamic `paddingLeft` style (around lines 365-370). All match items will be left-aligned with consistent padding.

**4. Fresh participant fetch on "Find More Matches"**

In `generateMatches()`, before calling the AI edge function, re-fetch participants from Supabase instead of using the stale `participants` prop. This ensures newly registered participants are included.

**5. Update available count**

The "X people available" text already filters by `existingRequestIds`. No change needed -- it correctly reflects eligible participants.

**6. Empty state when all matched**

Replace the current empty state (lines ~340-355) with the specified design:
- Large sparkle icon (charcoal, 48px)
- "You've reached out to everyone!"
- "Check back if new participants join"
- Keep the "Find More Matches" refresh button

**7. Fix `createMeetingFromSuggestion` requester**

Currently it always uses `participant1.id` as requester. When `currentUser` exists, ensure `requester_id` is always `currentUser.id` and `target_id` is the other person.

---

### Technical Details

```text
File: src/components/AIMatchingPanel.tsx

Location: generateMatches() ~line 216-234
Change: After mapping suggestions, if currentUser && !isOrganizer, 
        filter to only matches involving currentUser.id

Location: generateMatches() ~line 185-195  
Change: Re-fetch registrations from Supabase for fresh participant list
        before calling the edge function

Location: filteredSuggestions ~line 330
Change: Add currentUser + !isOrganizer filter

Location: ~line 365-370
Change: Remove indentPattern array and dynamic paddingLeft style

Location: createMeetingFromSuggestion ~line 299-307
Change: Set requester_id = currentUser.id, target_id = otherPerson.id

Location: empty state ~line 340-355
Change: Updated copy and sparkle icon per spec
```

### What stays unchanged
- Organizer view (sees all matches, all participants)
- Requests tab, Participants tab, Survey tab
- Navigation, header, tab switching
- The AI matching algorithm itself
- Welcome greeting section

