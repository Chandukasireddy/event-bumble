

## Returning Participant Auto-Skip + Survey Tab

### Summary
Three changes: (A) Auto-detect returning participants via localStorage and skip survey, (B) Show welcome-back confirmation when an existing name is selected from dropdown, (C) Add a read-only "Survey" tab to the participant dashboard.

---

### Part A -- localStorage Auto-Skip (PublicRegister.tsx)

**After the event is fetched** (inside `fetchEvent`, after line 216), check for a localStorage key `meetspark_participant_${event.id}`. If found, parse the JSON, verify the `participantId` exists in the database for this event, and if valid, set `currentUser_${eventId}` in localStorage (for EventDetail compatibility) and `navigate(/event/${eventId})` immediately.

**After successful survey submission** (line 341-349, after setting `currentUser_${event.id}`), also set the new localStorage key:
```
localStorage.setItem(`meetspark_participant_${event.id}`, JSON.stringify({
  participantId: resultId,
  name,
  eventId: event.id,
}));
```

This means returning participants who visit `/register/${shareCode}` will never see the survey -- they go straight to their dashboard.

---

### Part B -- Welcome-Back Confirmation (PublicRegister.tsx)

Add a new state: `showWelcomeBack` (boolean, default false).

When `selectExistingRegistration` is called (line 234-239), instead of just showing a toast, set `showWelcomeBack = true` and store the selected registration.

In the form JSX (around line 546), when `showWelcomeBack && selectedExisting` is true, render a welcome-back card **replacing the form** (not alongside it):

- "[Name], welcome back!" -- 18px serif, color charcoal
- "Would you like to skip straight to your dashboard?" -- 14px sans, color #6B6B6B
- Two CTAs:
  - "Go to Dashboard" -- gold text link, sets localStorage entries and navigates to `/event/${event.id}`
  - "Re-take survey" -- gray text link, sets `showWelcomeBack = false` to reveal the form again

This appears inside the same Card container as the survey form.

---

### Part C -- Participant Survey Tab (EventDetail.tsx)

**Tab bar** (lines 305-320): After the Participants tab and before the organizer-only Survey tab, add a participant-only Survey tab:

```
{!isOrganizer && currentUser && (
  <TabsTrigger value="my-survey" ...>
    <ClipboardList className="w-4 h-4 mr-2" />
    Survey
  </TabsTrigger>
)}
```

**Tab content**: Create a new component `ParticipantSurveyView` (inline or separate file) that:

1. Fetches the participant's registration data and custom question responses from the database
2. Renders each question with the saved answer in read-only (disabled) mode
3. Shows an "Edit Answers" gold text CTA at the bottom
4. When clicked, enables all inputs for editing
5. On re-submit, updates the database and shows "Answers updated" success state, then returns to read-only

For events with default questions (no custom questions), show the default fields (Vibe, Superpower, Co-Pilot, Off-Screen Life, Bio) in read-only mode with the same edit capability.

---

### Technical Details

```text
File: src/pages/PublicRegister.tsx

1. New state: showWelcomeBack (boolean)
2. In fetchEvent (after line 216): check localStorage for 
   meetspark_participant_${eventId}, verify in DB, redirect if valid
3. In selectExistingRegistration (line 234): set showWelcomeBack = true
4. After handleSubmit success (line 341): also set meetspark_participant_ key
5. In JSX (line 546): conditional render -- if showWelcomeBack, show 
   welcome-back card instead of form

File: src/pages/EventDetail.tsx

1. Add participant-only "Survey" TabsTrigger (value="my-survey") 
   after Participants tab (line 311)
2. Add TabsContent for "my-survey" with ParticipantSurveyView component

File: src/components/ParticipantSurveyView.tsx (new file)

Props: eventId, participantId
- Fetches registration + custom questions + responses on mount
- Renders questions read-only by default
- "Edit Answers" toggles editable mode
- Re-submit updates DB, shows success, returns to read-only
- Reuses renderCustomQuestion patterns from PublicRegister
```

### What stays unchanged
- Organizer flow and organizer Survey tab (FormBuilder)
- First-time participant survey flow (identical behavior)
- AI Matching, Requests, Participants tabs
- Navigation, header, routing for organizers
- Matching algorithm

