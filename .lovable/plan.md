

## Bug Fix: AI Matching Tab — Filtering, Deduplication, and Alignment

### Summary
Three targeted fixes to `src/components/AIMatchingPanel.tsx`. No refactoring, no new UI elements, no changes to other tabs or organizer view.

---

### Bug Fix 1 — Remove third-party matches

**Root cause:** The `filteredSuggestions` filter at line 358 correctly checks `involvesUser`, but matches restored from localStorage may bypass the generation-time filter. Additionally, the render path at line 502-528 still shows an "organizer-style" card (`Name1 x Name2`) for any match that slips through where `isYourMatch` is false.

**Fix:**
- Strengthen the `filteredSuggestions` filter to always exclude non-currentUser matches for participants (this already exists but we ensure it runs on cached data too).
- In the render loop, for non-organizer participants, skip rendering entirely if `isYourMatch` is false (never show the `Participant1 x Participant2` card layout for participants). This acts as a safety net.

---

### Bug Fix 2 — Deduplicate matches by other participant

**Root cause:** The AI matching engine returns multiple scored suggestions for the same pair. No deduplication exists.

**Fix:**
Add deduplication logic after `filteredSuggestions` is computed. Group by the OTHER participant's ID, keep only the highest-scored entry per person, then sort descending by score.

```text
Location: After line 370 (filteredSuggestions computation)

Logic:
1. For each suggestion, determine otherId (the non-currentUser participant)
2. Use a Map<otherId, MatchSuggestion> keeping only highest score
3. Convert back to array, sort by score descending
```

---

### Bug Fix 3 — Left-align all match cards

**Fix in AIMatchingPanel.tsx:**
- Ensure match card containers use `items-start` and `justify-start` (not center)
- The "Request to Meet" CTA stays right-aligned on desktop (via `md:flex-row` with the button on the right side) — this is already correct
- Verify no stray center-alignment classes on name rows, badge rows, or description text

**ParticipantCard.tsx:** Already left-aligned — no changes needed. The card uses `items-start` and `justify-between` which is correct per the spec.

---

### Technical Details

**File: `src/components/AIMatchingPanel.tsx`**

**Change 1 — Deduplication after filteredSuggestions (after line 370):**
```typescript
// Deduplicate: keep only highest-scored match per other participant
const deduplicatedSuggestions = (() => {
  if (!currentUser || isOrganizer) return filteredSuggestions;
  const bestByOther = new Map<string, MatchSuggestion>();
  for (const s of filteredSuggestions) {
    const otherId = s.participant1.id === currentUser.id 
      ? s.participant2.id 
      : s.participant1.id;
    const existing = bestByOther.get(otherId);
    if (!existing || s.compatibility_score > existing.compatibility_score) {
      bestByOther.set(otherId, s);
    }
  }
  return Array.from(bestByOther.values()).sort(
    (a, b) => b.compatibility_score - a.compatibility_score
  );
})();
```

**Change 2 — Replace all `filteredSuggestions` references in JSX with `deduplicatedSuggestions`:**
- Line 441: `deduplicatedSuggestions.length > 0`
- Line 451: `deduplicatedSuggestions.map(...)`
- Line 537: `deduplicatedSuggestions.length === 0`

**Change 3 — Safety guard in render loop (line 460-529):**
For non-organizer participants, if `!isYourMatch`, skip rendering entirely (return null) instead of showing the two-person organizer card. This prevents any leaked third-party match from ever displaying.

**Change 4 — Left-alignment classes:**
- Match card outer div (line 463): ensure `items-start` not `items-center`
- Name/score row (line 465): `justify-start` (already has `flex items-center`)
- Badge row (line 476): already `flex flex-wrap` — correct
- Description (line 489): already left-aligned — correct

### What stays unchanged
- Organizer view (no filtering, no deduplication, sees all matches)
- Requests tab, Participants tab, Survey tab
- Navigation, header, tab switching
- The AI matching algorithm/edge function
- Welcome greeting and "Find More Matches" button
- ParticipantCard component (already correctly aligned)

