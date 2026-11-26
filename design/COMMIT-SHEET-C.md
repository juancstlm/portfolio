# COMMIT-SHEET C: "Every commit" (data peak)

Rejected so far (round 3): screenshot-led peaks (icon launch zoom, home-screen grid, flipping card with year ruler); verdict "still not enough wow". Avoid each. Kept: hero sentence with icons, gallery label, Funnel Display + Atkinson, light page, ledger, contact.

## 1. Peak
A pinned, full-bleed plot of all 3,785 commits Juan has made since 2018, one hairline per day, coloured by project. Scroll moves a cursor through seven years at 1:1. Quiet years pass as near-empty paper, the Tesla years go flat, then 2026 rises into a dense wall. The readout (date, project, running total) is computed exactly at each scroll position. Launches appear as labelled markers with the app's icon as the cursor reaches them. At the far right edge, one dark series begins on 2026-10-27, labelled only "Something new".

## 2. Color
Page stays lit: oklch(0.975 0.004 165), ink 0.23. Each project gets one line colour sampled from its own icon/UI (OneRM teal, Atlas green, ADS mint-grey, CalAutoX orange, WSIGTE red, this site ink-2, other projects light grey, the secret game near-black ink). Tier: full-palette, but only inside the plot; everything around it stays ink on paper. Background L target ≈ 0.95 across the scene. Not lavender, not cream, not the dev-tool reflex of a dark terminal heat map.

## 3. Type
Funnel Display for the readout's big numbers (tabular figures, set at display size, rendered directly with no tween) and year labels; Atkinson Hyperlegible Next for axis labels and milestone captions. No mono.

## 4. Grid break
The plot runs edge to edge, outside the 12-column container, and is taller than the text column: it fills the pinned viewport, while the readout sits in a narrow column over the plot's quiet early years.

## 5. Motion budget
(1) scroll-scrub: cursor, plot reveal, readout, milestone markers (one ScrollTrigger); (2) the shared hero load entrance; (3) the shared OneRM hairline draw. Nothing else animates.

## 6. Reflex check
a) Developer portfolio data: a GitHub contribution heat-map grid in green, a stat row (commits / repos / stars), a language pie chart.
b) Avoiding that: a dark "terminal" dashboard with mono numbers and glowing sparklines.
c) Ours: a lit, editorial seismograph of real daily commits, where the rhythm of the career (quiet years, Tesla gap, 2026 wall, the secret starting) is the story. No grid of squares and no stat row.

## 7. House tells broken
1. Near-black → lit paper page.
2. Mono service type → none; numbers are Funnel Display tabular.
3. Glow as depth → flat hairlines, no glow.
