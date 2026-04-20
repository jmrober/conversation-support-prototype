# design.md

## Objective

Refine this conversation support component into a clean, operational, high-legibility right-rail interface for a customer support workbench.

This is not a consumer chat app.  
This is not a soft mobile messaging UI.  
This is a dense but calm support operations surface designed for fast scanning, clear status recognition, and safe action-taking under pressure.

The component lives in a constrained right rail around **400px wide**. The design should feel intentional, compact, and highly structured.

---

## Core design principles

### 1. Operational clarity over decoration
Every visual decision should improve:
- scanability
- state recognition
- participant clarity
- action confidence
- error prevention

Avoid oversized avatars, large empty hero spaces, or decorative layouts that waste vertical room.

### 2. Strong hierarchy in constrained space
The panel is narrow. The UI must use:
- a disciplined typography ramp
- clear spacing rhythm
- compact but readable metadata
- consistent alignment
- layered emphasis

### 3. One interaction model
Buttons, chips, pills, badges, and icon actions must feel like part of one system.

Do not mix random corner radii, inconsistent heights, random icon sizes, or mismatched padding.

### 4. Status should do real work
Status labels should be legible and systematized. They should help users quickly understand:
- customer vs internal
- chat vs call
- active vs waiting vs held vs wrap-up
- available vs lunch vs busy

### 5. Touch targets and click targets must be reliable
Every interactive element should feel deliberately sized for usability, not visually improvised.

---

## Layout guidance

### Component width
- Fixed right-rail layout
- Width between **360px and 400px**
- Optimize specifically for **400px**

### Vertical structure
The component should use a clear stacked layout:
1. Agent header / presence
2. Conversation list
3. Active conversation header
4. Main interaction region
5. Action bar / controls
6. Temporary layered panels when needed

### Space strategy
Reduce dead space significantly.

The current version wastes too much vertical room in the active call state with:
- oversized centered avatar
- oversized centered contact block
- oversized empty area above controls

Instead:
- bring important information upward
- use a compact active call header
- make controls feel anchored and intentional
- keep key information visible without excessive scrolling

---

## Typography ramp

Use a disciplined typography system. Do not invent ad hoc sizes.

### Type scale
- **Title / primary identity:** 24px / semibold
- **Section header:** 20px / semibold
- **Conversation name / primary row label:** 18px / semibold
- **Body / primary content:** 16px / regular or medium
- **Secondary metadata:** 14px / medium
- **Status label / chip text / eyebrow:** 12px / semibold, uppercase or tight tracking where appropriate
- **Micro metadata / timestamps:** 12px / medium

### Line height
- 24px size → 30–32px line height
- 20px size → 26–28px line height
- 18px size → 24px line height
- 16px size → 22–24px line height
- 14px size → 20px line height
- 12px size → 16px line height

### Rules
- Do not use too many font weights
- Prefer regular, medium, semibold
- Timestamps and metadata should be quieter but still readable
- Conversation names should anchor each row
- Case ids should never compete with participant names

---

## Spacing system

Use a consistent spacing rhythm. Prefer an 8px base system.

### Spacing tokens
- 4px for tight internal spacing
- 8px for compact spacing
- 12px for default internal spacing
- 16px for section padding
- 20px for larger separation
- 24px only where strong separation is needed

### Rules
- Conversation rows should feel compact but breathable
- Header paddings should align to the same system
- Buttons in control areas should share the same vertical alignment
- Avoid arbitrary spacing values

---

## Button system

Create a clear button system and apply it consistently.

### Button categories

#### 1. Primary destructive action
Example: End call

- Height: **56px minimum**
- Horizontal padding: 16–20px
- Strong filled background
- White icon + label
- Corner radius should match the rest of the system
- Should feel intentional, not oversized or novelty-red

#### 2. Secondary action button
Examples:
- Hold
- Mute
- Directory
- Transfer
- Resume

- Height: **56px minimum**
- Minimum width: **56px**
- Use consistent border, background, radius, and typography
- Icons and labels should align consistently
- If icon + text is used, spacing between them should be consistent

#### 3. Tertiary icon action
Examples:
- Status dropdown
- Back
- Search
- Overflow

- Minimum touch target: **40px to 44px**
- Icon should not float loosely
- Use a consistent hit area even if the visible icon is smaller

### Touch target rules
- Minimum touch target for all tap targets: **44x44**
- Primary call controls: **56x56 or larger**
- Do not create visually different buttons that behave the same way
- Do not mix outline, filled, soft, and ghost styles randomly

---

## Icon system

The current icon usage feels mismatched and weak. Fix that.

### Icon rules
- Use a single icon family consistently
- Use clean, modern, neutral icons
- Recommended size:
  - 16px for inline metadata
  - 18px or 20px for row/channel/status context
  - 20px or 24px for control buttons
- Icons should align to text baselines or button centers
- Avoid emoji-like or overly soft icon styles

### Icon usage guidance

#### Conversation list
Use icons to reinforce channel and type:
- chat
- phone
- internal employee
- transfer
- held
- unread

But do not overload the row with too many visual symbols.

#### Action bar
Icons should be paired with actions clearly:
- hold
- mute
- directory
- transfer
- end call

Each should have the same visual structure and hit area.

#### Metadata
Small inline icons can support:
- inbound / outbound
- internal / customer
- active / held / waiting

Use them sparingly and systematically.

---

## Conversation list guidance

The thread list should feel sharper and more information-dense.

### Row structure
Each row should contain:
- participant name
- supporting metadata line
- latest message preview or call state
- timestamp
- unread count if applicable

### Hierarchy
Prioritize:
1. participant name
2. state and channel
3. message preview or live status
4. timestamp / unread

### Row behavior
- active row should be clearly selected
- unread and waiting states should be visually distinct
- active call should feel more urgent than a waiting chat
- internal and customer conversations must be distinguishable at a glance

### Do not
- overuse pastel chips
- stack too many badges with equal visual weight
- let case ids compete with names
- make timestamps too large or too dark

---

## Status chip system

Current chips feel inconsistent and too loud.

Create a unified chip system.

### Chip rules
- Same height across the system
- Same corner radius across the system
- Same typography treatment across the system
- Use restrained fills or subtle tonal backgrounds
- Use color purposefully, not decoratively

### Suggested chip categories
- customer
- internal
- chat
- call
- active
- waiting
- held
- consult
- wrap-up
- transferred

### Priority
Not every row needs every chip visible at once.  
Surface only the most useful ones.

The user should be able to scan the row quickly without badge overload.

---

## Active call state guidance

The active call area needs the biggest redesign.

### Current problem
The current active call view wastes space and looks like a generic contact card rather than an active support call surface.

### Better direction
The active call state should be:
- compact
- high signal
- clearly structured
- visibly "live"

### Recommended structure
- active conversation header at top
- participant identity and case info near top, not floating in the middle
- live call timer clearly visible
- inbound/outbound state visible
- call state visible
- controls anchored below in one consistent row or wrapped grid
- optional secondary details below, not centered like a profile screen

### Remove
- giant empty middle space
- oversized avatar emphasis
- weakly anchored controls
- consumer-call-screen styling

### Add
- stronger live call banner or call state zone
- clearer separation between identity and controls
- tighter information grouping
- consistent control sizing

---

## Presence and header guidance

The top header should feel cleaner and more structured.

### Agent header should include
- initials or small avatar
- agent name
- current presence state
- optional status dropdown

### Presence styling
Presence should look like a system control, not just colored text.

Examples:
- available
- busy
- lunch
- break
- away
- wrap-up

Make sure the control:
- is aligned
- has a clear touch target
- feels consistent with the rest of the component

---

## Visual style direction

Aim for:
- calm
- crisp
- intentional
- operational
- minimal but not sterile

### Avoid
- soft generic mobile UI
- oversized rounded toy-like controls
- random saturated colors
- giant empty surfaces
- decorative center alignment where it reduces usability

### Prefer
- restrained border system
- subtle background layers
- strong alignment
- modest radii
- predictable spacing
- deliberate emphasis

---

## Specific improvements to make now

1. Rework the active call view to remove excessive empty space
2. Create a real typography ramp and apply it consistently
3. Standardize all buttons with consistent heights, radii, icon sizes, and label treatment
4. Replace inconsistent icon usage with one coherent icon system
5. Tighten conversation row layout and improve information hierarchy
6. Reduce chip noise and create a more disciplined status system
7. Make timestamps and case ids quieter
8. Improve alignment and spacing across all sections
9. Make controls feel like part of one system
10. Make the panel feel purpose-built for a 400px operational rail

---

## Implementation instruction

Please refactor the current UI to follow this design system guidance.

Focus on:
- improving hierarchy
- cleaning up spacing
- standardizing controls
- improving icon consistency
- applying the typography ramp
- reducing wasted space
- making the active call state feel like a real support tool

Do not add new features yet.  
Do not change the product model.  
Do not introduce unnecessary dependencies.  
Do not redesign this as a full-page app.  
Keep it constrained to the existing right-rail component model.

At the end, provide:
- a summary of the design improvements made
- the components updated
- any assumptions you made
