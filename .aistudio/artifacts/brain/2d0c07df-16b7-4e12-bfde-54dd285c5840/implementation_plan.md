# UI Navigation Unification & Total Graphics Sparkline-First Layout

Update the on-task popup button positions, unify all Next and Skip buttons across the application to a cohesive charcoal grey style, and restructure the right-hand Total graphics so that column sparklines appear above the Title, Ratio, and Goal.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed with the user during Phase 1 interactive clarification:
> - **Next & Skip Button Styling**: All Next and Skip buttons across the entire application share a uniform charcoal grey background with white text (`#6b7280` / `#ffffff`, pill radius `999px`, font-weight 700).
> - **Total Graphics Hierarchy**: For all three summary graphics (Total Whole Group OTR, Total Small Group OTR, and Total Instructional Feedback), the column sparklines (with minute markers and tallies) are repositioned to the top of the card, followed by the Title, Ratio/Rate metric, and Goal at the bottom.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Engagement Modal Button Switch**: On the "Students On Task" / Engagement Check modal, places the **Skip** button on the left and the **Record** button on the right.
  2. **Unified Action Buttons**: Standardizes all Next and Skip buttons (timer screen Next, modal Skip, questions Next/Skip, CharacterStrong Next/Skip) to use the charcoal grey with white text styling.
  3. **Sparkline-First Total Graphics**: In the results graphic, inverts each right-hand panel so the timeline and column sparkline render first at the top, leading into the section title, big ratio stat, and grey goal text below.
- **Target Audience**: Observers and educators who need consistent navigation button affordances and faster visual scanning of timeline sparklines before reading aggregate ratios.
- **Key Value**: Consistency in button layout reduces accidental taps; placing sparklines first creates an immediate visual anchor connecting the left-hand timeline data to the right-hand totals.

---

## 2. User Experience & Visual Design

### 1. Engagement Check Modal (Students On Task)
- **Button Row Layout**:
  - Left: **Skip** button (charcoal grey `#6b7280`, white text `#ffffff`, border-radius `999px`, font-weight 700).
  - Right: **Record** button (accent/primary button, disabled until total students $> 0$).

### 2. Universal Next & Skip Button Styling
The following buttons will share identical visual styling (`background-color: #6b7280; color: #ffffff; border: none; font-weight: 700; border-radius: 999px;`):
- Observation screen: `#nextBtn`
- Engagement modal: `#engSkipBtn`
- Questions screen: `#questionsNextBtn`, `#questionsSkipBtn`, `#questionsSkipBtnHeader`
- CharacterStrong screen: `#csNextBtn`, `#csSkipBtn`, `#csSkipBtnHeader`

### 3. Sparkline-First Total Graphics Layout
Inside each of the three right-hand panels (Whole Group OTR, Small Group OTR, Instructional Feedback):
```
┌────────────────────────────────────────────────────────┐
│  1'         2'         3'         4'                   │  (Minute header)
│  3          0          2          4                    │  (Top tallies)
│ ┌───┐                 ┌───┐      ┌───┐                 │  (Positive / OTR bars)
│ └───┘                 └───┘      └───┘                 │
│ ────────────────────────────────────────────────────── │  (Baseline rule)
│                       ┌───┐      ┌───┐                 │  (Negative bars - IF only)
│  0          0          1          2                    │  (Bottom tallies - IF only)
│                                                        │
│        TOTAL WHOLE GROUP OPPORTUNITIES TO RESPOND      │  (Title)
│                    2.5 / min  ·  15 total              │  (Ratio / Rate stat)
│                        Goal: 3–5 / min                 │  (Goal in grey text)
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Left-to-Right Button Progression**:
  - *Chosen Approach*: Skip on the left, Record / Primary Action on the right.
  - *Why*: In standard dialog design, secondary/dismissive actions ("Cancel", "Skip") sit on the left, while primary destructive/commit actions ("Submit", "Record") sit on the right.
- **Decision 2: Sparkline Above Title and Metrics**:
  - *Chosen Approach*: Render minute markers, column bars, and baseline at the top of the panel, with the panel title and summary metrics beneath.
  - *Why*: Allows the eye to scan horizontally across the timeline from the left-hand component sparklines straight into the right-hand total sparklines on the exact same vertical plane.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      screen-run HTML Template                   │
│                                                                 │
│  <div id="engagementModal">                                     │
│    <div class="modal-content">                                  │
│      <!-- Inputs: Total Students & Off Task Students -->        │
│      <div style="display:flex; gap:10px; margin-top:16px;">     │
│        <button id="engSkipBtn">Skip</button>   (Left)           │
│        <button id="engRecordBtn">Record</button> (Right)        │
│      </div>                                                     │
│    </div>                                                       │
│  </div>                                                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Universal CSS Class: .btn-nav-charcoal             │
│   background-color: #6b7280; color: #fff; border-radius: 999px  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              renderResultsCompositeSVG() Restructuring          │
│                                                                 │
│  For each panel (Whole Group, Small Group, Feedback):           │
│   1. Timeline minute markers (`1'`, `2'`) at panel top          │
│   2. Column bars, segment dividers & tallies                    │
│   3. Horizontal baseline rule                                   │
│   4. Panel Title text (font-size 11, font-weight 800)           │
│   5. Big Ratio / Rate & Total Count                             │
│   6. Goal in grey text (`fill: #64748b`)                        │
└─────────────────────────────────────────────────────────────────┘
```

### File Changes
- **`index.html`**:
  - **CSS**: Define a reusable rule for all Next and Skip buttons ensuring consistent `#6b7280` charcoal background, white text, 999px border-radius, and hover state.
  - **HTML**:
    - Reorder `#engSkipBtn` before `#engRecordBtn` in `#engagementModal`.
    - Apply uniform charcoal styling to `#engSkipBtn`, `#questionsSkipBtn`, `#questionsSkipBtnHeader`, `#questionsNextBtn`, `#csSkipBtn`, `#csSkipBtnHeader`, and `#csNextBtn`.
  - **JavaScript (`renderResultsCompositeSVG`)**:
    - Update `Whole Group Total OTR`: render timeline header, baseline, and columns at the top; place title, rate, and goal below.
    - Update `Small Group Total OTR`: render timeline header, baseline, and columns at the top; place title, rate, and goal below.
    - Update `Total Instructional Feedback`: render timeline header, dual-directional bars, baseline, and positive/negative tallies at the top; place title, ratio, and goal below.
