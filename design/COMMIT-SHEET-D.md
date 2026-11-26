# COMMIT-SHEET D: "Picker" (type-led peak)

Rejected so far (round 3): screenshot-led peaks (icon launch zoom, home-screen grid, flipping card with year ruler); verdict "still not enough wow". Avoid each. Kept: hero sentence with icons, gallery label, Funnel Display + Atkinson, light page, ledger, contact.

## 1. Peak
The project list is a giant iOS picker wheel made of type. Project names set at about 11vw in Funnel Display sit on a 3D cylinder (rotateX per row, perspective), and scroll turns the wheel at 1:1 with a detent at each row. The row in the selection band gets full weight (variable wght 400 → 760) and full ink, while rows curving away thin out, tilt and fade, exactly like UIPickerView. Beside the band, a small caption block shows the selected project's year, caption, one real number from history.json (e.g. commits, version) and the link. The secret game is one row of the wheel: its name is a redaction bar the width of a word, and its caption is the approved line.

## 2. Color
Lit page oklch(0.975 0.004 165), ink 0.23. One accent: the selected row's small app icon and the selection band hairlines in Juan's mint oklch(0.80 0.13 165) (text-safe green 0.45 for any small text). Tier: restrained. Background L ≈ 0.97. Not lavender, not cream, not the portfolio reflex of giant white type on black.

## 3. Type
Funnel Display variable (400–800, as loaded by the shell) is the subject: the wheel rows, set at roughly 9–12vw, letter-spacing -0.04em. Atkinson Hyperlegible Next for the caption block. The type is the signature, so it is exempt from the 6rem heading ceiling (stated here on purpose).

## 4. Grid break
The wheel's rows run off both edges of the viewport (left-aligned names longer than the screen are allowed to clip at the right edge on phones), with the caption block tucked into the right four columns inside the selection band.

## 5. Motion budget
(1) scroll-scrub: the wheel (rotateX per row + font weight on the visible rows, the one written exception), the caption swap per detent; (2) the shared hero load entrance; (3) the shared OneRM hairline draw.

## 6. Reflex check
a) Type-led portfolio: enormous name as hero, a marquee of skills, a numbered project index (01 CalAutoX, 02 OneRM) with an image following the cursor on hover.
b) Avoiding that: tiny raw-HTML brutalist list, Times New Roman, blue links.
c) Ours: a physical control he builds every day (the iOS picker), rendered in display type at poster size and driven by scroll, so the list of work is itself the wow.

## 7. House tells broken
1. Wordmark-as-hero → the hero is a sentence; the big type is the work, not the name.
2. Near-black → lit page.
3. Mono service type → none.
