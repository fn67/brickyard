# Brickyard: Product Requirements (MVP)

**Tagline:** Pixel avatars for people who hate profile pictures.

This document is the single source of truth for the MVP. It is written to be handed to Claude Design (for the UI) and Claude Code (for the build). Anything marked **Later** is out of scope for the MVP.

Reference material that ships with this file:
- `reference/prototype.html`: the working prototype. It is the reference for the pattern logic (hashing, seeded random numbers, mirroring, the twelve draw functions). The new app ports that logic; it does not copy the UI.
- The Desktop mockup image: the reference for layout and tone.

---

## 1. Summary

Brickyard turns any name or username into a pixel avatar in the style of GitHub's identicons. The person types a name, picks one of ten styles, optionally picks a colour and a background, and sees the avatar flat (2D). For the **Critter** style they can also switch to a 3D view made of blocks that they can rotate and zoom. They can copy or download the result as a PNG.

- The same name always gives the same avatar. Nothing is random between visits.
- Everything runs in the browser on the person's own machine. No accounts, no uploads, no backend.
- Minimal, calm, professional UI. Not playful or gamified.

**Name:** Brickyard. **Logo mark:** keep the small pixel-face mark from the mockup unless Claude Design proposes a better one.

---

## 2. Scope

### In the MVP
1. Name input with Shuffle.
2. Ten styles (table in section 4.2).
3. Colour choice: Auto plus ten hue swatches.
4. Background choice: Light (default), Dark, Transparent, applied everywhere.
5. Preview panel with a 2D | 3D switch. The 3D option is enabled for **Critter only**.
6. 3D view for Critter: 360° rotation, zoom, Reset view, angle presets, capture.
7. Six variations of the current style.
8. Copy PNG, and a Download menu with PNG at 512, 1024 and 2048 px.
9. In the Download menu, **Download as SVG** and **Download as STL** are shown but disabled with a "Soon" label.
10. An **app dark mode toggle** in the header (light or dark appearance for the whole app, section 4.9).

### Later (not in the MVP)
- 3D for more styles, starting with Invader and Dither (rules in section 4.2).
- Working SVG download and STL download.
- Shareable link (name, style, colour and background in the URL).
- Animation: bricks dropping in one by one, a spinning video or GIF, auto-rotate.
- Depth slider (flat to tall).
- Isometric camera preset.
- Circle crop.
- Batch mode (many names at once), saved favourites, "Surprise me".
- A "System" option on the app dark mode toggle, to go back to following the device setting.

### Removed from the earlier prototype
- Circle crop.
- Midnight style (replaced by the Dark background).
- Dots style.
- The old moon icon in the header, whose meaning was unclear. It returns as the explicit app dark mode toggle described in section 4.9.

---

## 3. Principles

1. **Deterministic.** Same name, same style, same colour setting gives the same avatar, every time and on every machine. Changing the background or the view never changes the pattern.
2. **Instant.** Typing updates the preview with no visible delay.
3. **Private.** No network requests for avatar generation. Nothing is stored on a server.
4. **One model, many views.** Each avatar is generated as data first. The 2D picture, the 3D scene and the later SVG and STL exports all draw from that same data.

---

## 4. Functional requirements

### 4.1 Name input
- A text field labelled **"Enter anything to see your avatar"**. Placeholder, shown only when the field is empty: "Username, name…". The field opens with `hello-world` already typed in. Maximum 40 characters. Leading and trailing spaces are ignored.
- The interface never uses the word "seed". That is an internal engine term. In the UI the text is always called the name.
- If the field is empty, the app uses the default seed `hello-world`.
- **Shuffle** fills the field with a random two-word, git-flavoured name (for example `quiet-fork`, `sleepy-rebase`). Word lists are in the prototype.
- Everything updates as the person types.

### 4.2 Styles

Ten styles. The 5×5 styles (Classic, Duotone, Sticker, Quilt, Aurora and the inner pattern of Frame) share the same mirrored pattern for a given name, so one name looks like the same person in different outfits. The others use their own pattern logic, as in the prototype.

| # | Style | Grid | Look | 3D |
|---|---|---|---|---|
| 1 | Classic | 5×5 | GitHub look, solid cells | Not planned |
| 2 | Duotone | 5×5 | Two hues | Not planned |
| 3 | Sticker | 5×5 | Outlined, with offset shadow | No (2D by design) |
| 4 | Invader | 8×8 | Arcade creature | Later |
| 5 | Critter | 9×9 | Creature with a face | **Yes (MVP)** |
| 6 | Quilt | 5×5 | Tonal, full square | Later |
| 7 | Dither | 12×12 | Blob | Later |
| 8 | Aurora | 5×5 | Hue sweep | Not planned |
| 9 | Kaleido | 6×6 | Four-way symmetry | Later |
| 10 | Frame | 7×7 | Stitched edge | Later |

Notes:
- Only Critter has a 3D view in the MVP, because it is the only style that reads as a character. The engine must make it easy to add more styles later by supplying a height rule per style.
- Only the Critter card carries a small "3D" badge. Claude Design decides how it looks.
- Each card shows the name, the grid and a short note ("Light", "Two hues", "Arcade", and so on) as in the mockup.

**Critter 3D rule (MVP):** the body cells are 1 unit tall. Eyes (white blocks) and the mouth (dark blocks) are raised by 0.25 so they stand out. Each pupil is a small dark block on top of its eye.

**Height rules for later styles** (initial values, tune by eye): Invader all cells 1 unit; Dither a dome, 3 units in the centre falling to 1 at the edge; Quilt tone becomes height (darkest 1.5, middle 1, lightest 0.5); Kaleido a stepped pyramid, rising toward the centre in 0.5 steps; Frame edge cells 0.75 and the inner pattern 1.5. Classic, Duotone and Aurora would only be thick tiles, so they are not planned.

### 4.3 Colour
- Control with **Auto** plus ten swatches. Hues in degrees: 0, 28, 48, 100, 160, 190, 215, 250, 285, 320.
- **Auto** means the colour comes from the name (default).
- A swatch overrides only the hue. Saturation and lightness stay in each style's designed range, so every choice looks good.
- The pattern never changes when the colour changes.
- The facts list in the Preview panel shows "Colour: Auto" or "Hue 215°".
- Duotone and Kaleido move their second colour with the chosen hue.

### 4.4 Background
- Segmented control: **Light | Dark | Transparent**. Default is **Light**.
- It applies to everything at once: all style cards, the large preview, the size previews, the variations, the 3D scene, and every export.
- Each style defines a light palette and a dark palette. Light: pale or neutral background, cells at roughly 40 to 56% lightness. Dark: near-black background (about `#0d1117`), cells at roughly 60 to 66% lightness.
- Invader and Aurora are dark by design today, so they need a proper light palette. Quilt fills the whole square, so for Dark its tones shift instead.
- **Transparent:** no background is drawn. The preview shows a checkerboard so transparency is visible. PNG exports keep the transparent background. In 3D there is no floor or backdrop.

### 4.5 Preview panel (left)
- Header with the title and the **2D | 3D** switch.
- Large preview of the current avatar.
- Three small size previews: 56, 48 and 20 px.
- Facts: Style, Grid, Name. The Name row shows exactly what is in the name field. There is no Colour row; the Colour control itself shows the current choice.
- Background control and Colour control. Claude Design decides exactly where they sit.
- **Copy PNG** (primary) and **Download** (menu).
- **Variations:** six small avatars in the current style, with the heading "Variations" and the line "Not quite right? Try another." (no "seed" wording). They are the name itself, then the name with `:1`, `:2` and so on added. Selecting one puts that text in the name field (for example `hello-world:3`) and shows a small note such as "Using variation 3", so the added `:3` makes sense. If the name already ends in `:number`, that suffix is dropped before making the variations.

### 4.6 2D view
- Shows the flat avatar at the chosen background.
- The same data as the 3D view, drawn on a canvas.

### 4.7 3D view (Critter only)
- The 3D view is available only when the **Critter** style is selected. For every other style the **2D | 3D** switch is disabled and a short note says "3D is available for Critter."
- Selecting another style while in 3D returns to 2D.
- The avatar is built from blocks: plain **matte boxes** (flat colour, soft lighting, a soft shadow on the ground). No studs, no bevels, no shine.
- **Rotate** 360° by dragging. **Zoom** with the mouse wheel or a pinch. **No panning**: the avatar always stays centred.
- **Reset view** returns to the default angle.
- **Angle presets:** Front, ¾, Top, Side.
- Keyboard: when the 3D view has focus, arrow keys rotate and plus/minus zoom.
- **No auto-rotate and no animation** in the MVP.
- On touch screens: one finger rotates, two fingers zoom.
- If the device cannot do 3D, the app stays in 2D and shows a short message next to the switch.
- The camera is perspective. The scene background follows the Background control.

### 4.8 Copy and download
- **Copy PNG** copies the current view as a square 460 px image. In 2D that is the flat avatar. In 3D it is the current camera angle.
- **Download menu**
  - Download as PNG: 512, 1024, 2048 px (works in the MVP). The file name uses the seed, style and size (for example `hello-world-classic-1024.png`). In 3D it is the current angle.
  - Download as SVG: visible, disabled, labelled "Soon".
  - Download as STL: visible, disabled, labelled "Soon".
- Transparent background gives a PNG with an alpha channel.
- If the clipboard is blocked, show a short message with the alternative (use Download).

### 4.9 App dark mode toggle
- A single icon button in the header, top right, about 40 px square, on desktop and on phones. It shows a moon when the app is light and a sun when the app is dark.
- Tapping it switches the whole app between light and dark appearance immediately, with no reload.
- On the first visit the app follows the person's system setting. After the person taps the toggle, their choice is saved in the browser and used on later visits.
- The correct appearance is applied before the first paint, so there is no flash of the wrong theme when the page loads.
- Tooltip and accessible name: "Switch app to dark mode" or "Switch app to light mode".
- It is independent of the avatar **Background** control (section 4.4). It changes the panels, text, buttons, preview frame and checkerboard. It does not change the avatar, its pattern, the 3D scene background or any export.
- Every screen and state is designed and checked in both appearances.
- Two states only in the MVP. A "System" option is Later.

---

### 4.10 Phone layout

- One screen, no vertical page scrolling, designed for a visible area of about 390 × 650 and also 360 × 600.
- Three tabs under the preview: **Style**, **Variations**, **Colour**. Colour contains the colour swatches and the Background control.
- The area above the tab bar keeps one fixed height on every tab, so nothing jumps when switching.
- Smaller style thumbnails than on desktop. The 3D chips sit on the preview. Size previews and facts are hidden or behind a "Details" control.
- Download opens as a bottom sheet. The layout also works with the keyboard open, and in light and dark app appearance.
- The exact look is in the Claude Design file (see CLAUDE.md for the link).

## 5. Non-functional requirements

- **Runs locally** as a normal web app in the browser. No backend.
- **Responsive:** desktop and phone widths (about 400 px). No horizontal page scroll. On phones the panels stack.
- **App appearance:** follows the system light or dark setting on the first visit, and can be switched with the header toggle (section 4.9). This is separate from the avatar Background control.
- **Accessibility:** every control is reachable by keyboard with a visible focus state; avatar images have text alternatives (for example "Avatar for hello-world in the Classic style"); text meets contrast requirements in both appearances; respect "reduce motion".
- **Performance:** the preview and ten cards update within one frame or two while typing. Only one 3D scene exists at a time, in the preview panel. The cards are always flat.
- **Browser support:** current Chrome, Edge, Firefox and Safari.

---

## 6. Technical approach

- **Stack:** Vite, React, TypeScript. Three.js through `@react-three/fiber` and `@react-three/drei` (rotate and zoom controls). Plain CSS, or another approach if Claude Design proposes one. Vitest for tests. No Next.js (no server needed).
- **Avatar engine (pure TypeScript, no UI code):**
  `generateAvatar(seed, { style, hue, background }) → AvatarModel`
  where the model holds: grid width and height, the background colour (or none), and a list of cells with `x`, `y`, `height`, `color` and an optional `kind` (for example `eye`, `pupil`, `mouth`).
  Hashing and the seeded random number generator are ported from the prototype so existing avatars stay identical.
- **Renderers, all reading the same model:** a canvas renderer for 2D, a Three.js renderer for 3D (instanced boxes), and, later, an SVG writer and an STL exporter.
- **Adding 3D to another style later** means giving that style a height rule so its cells have heights. No renderer changes should be needed.
- **App theming:** all UI colours are CSS variables defined for both appearances. The chosen appearance is stored in the browser, and applied before first paint (for example as an attribute on the root element set by a tiny inline script). Avatar colours and the 3D scene background do not use these variables; they follow the Background control.
- **Tests (must exist from the start):** same inputs give identical output; the background and hue options never change which cells are filled; every style produces a valid model for a set of sample names, including empty, very long and non-English names.
- **Later notes:** STL stores shape only and no colour. A coloured 3D file would need GLB or 3MF.

---

## 7. Design brief for Claude Design

- Start from the attached Desktop mockup: header with name, tagline and the name field; a Preview panel on the left; a Styles panel on the right.
- Tone: calm, minimal, professional. Neutral surfaces, thin borders, one accent colour (the indigo of the mockup), small corner radii. The avatars are the colourful part.
- Changes from the mockup:
  1. Replace "Identicon Lab" and its subtitle with **Brickyard** and the tagline. No second line and no helper text.
  2. Remove the old moon icon and the Circle crop checkbox. (The moon returns as the app dark mode toggle in item 11.)
  3. Add the **Colour** control and the **Background** control (Light, Dark, Transparent).
  4. Ten styles instead of twelve. Claude Design chooses the grid. Suggestion: 5 columns × 2 rows on desktop, 2 columns on phones.
  5. Add the "3D" badge on the Critter card only.
  6. The **2D | 3D** switch is active when Critter is selected (no longer "Soon") and disabled with a note for every other style. When 3D is on, show the 3D controls (Reset view, angle presets, a short hint such as "Drag to rotate, scroll to zoom").
  7. Show a checkerboard behind the preview when Background is Transparent.
  8. **Download** becomes a menu: PNG sizes, then SVG and STL shown as disabled "Soon" items.
  9. Six variations, as in the mockup, with the plain wording described in section 4.5.
  10. The name field is labelled "Enter anything to see your avatar", with the placeholder "Username, name…". The word "seed" appears nowhere in the interface; the facts list shows "Name".
  11. Add the app dark mode toggle (section 4.9) at the top right of the header, on desktop and phone.
- Make 3D easy to find, since it only works for one style. For example, Critter could be the style shown when the app first opens, or the note near the switch could be visible from the start. Claude Design decides.
- Claude Design decides placement, spacing and the visual treatment of every new control.

---

## 8. Acceptance checklist

- [ ] Typing `hello-world` always gives the same avatar in every style, after a reload and on another machine.
- [ ] Changing the Background changes colours only. The filled cells stay the same.
- [ ] Changing the Colour changes the hue only. The filled cells stay the same.
- [ ] Auto returns to the name's own colour.
- [ ] All ten styles render in Light and Dark. Invader and Aurora are readable in Light.
- [ ] Transparent shows a checkerboard in the preview and gives a PNG with transparency.
- [ ] The 3D switch works for Critter. For the other nine styles it is disabled and shows "3D is available for Critter."
- [ ] In 3D: drag rotates, wheel or pinch zooms, there is no pan, Reset view works, all four presets work.
- [ ] Copy PNG and Download PNG at 512, 1024 and 2048 px match what is on screen, including the 3D angle.
- [ ] SVG and STL items are visible, disabled, and labelled "Soon".
- [ ] There is no circle crop. The only moon or sun control is the app dark mode toggle in the header.
- [ ] The toggle switches the whole app between light and dark immediately, without a reload.
- [ ] On a first visit the app matches the system setting. After tapping the toggle, the choice survives a reload.
- [ ] Reloading in dark mode shows no flash of the light theme.
- [ ] Toggling the app appearance never changes the avatar, the avatar Background setting, the 3D scene background or any exported image.
- [ ] Works at 400 px width with no horizontal scroll, and with keyboard only.
- [ ] Empty, 40-character and non-English names all produce an avatar without errors.

---

## 9. Decisions log

| Topic | Decision |
|---|---|
| Name | Brickyard |
| Tagline | Pixel avatars for people who hate profile pictures. |
| Platform | New local web app built with Claude Code |
| Styles | Ten: Classic, Duotone, Sticker, Invader, Critter, Quilt, Dither, Aurora, Kaleido, Frame |
| Removed styles | Midnight (now the Dark background), Dots |
| Background | Light (default), Dark, Transparent; applies everywhere |
| Colour | Auto plus ten hue swatches; hue only |
| 3D | Critter only in the MVP. 360° rotate and zoom, no pan; matte plain blocks, no studs |
| 3D for other styles | Later, starting with Invader and Dither |
| 3D export | STL later; PNG capture now |
| Depth slider | Not included |
| Auto-rotate and animation | Not in the MVP |
| Isometric preset | Not in the MVP (read as "no" to the last question) |
| Circle crop | Removed |
| App dark mode | Header toggle (moon or sun icon), two states, follows the system on first visit, choice remembered, independent of the avatar Background control |
| UI layout | Decided by Claude Design, starting from the mockup |
| Variations | Kept, six of them. Heading "Variations", line "Not quite right? Try another.", and a "Using variation N" note (section 4.5) |
| Facts list | Style, Grid, Name. No Colour row |
| Size previews | 56, 48 and 20 px |
| Auto colour swatch | No text label (intentional); keep a tooltip and an accessible name |
| Primary button | None (intentional) |
| Style card notes | Cards show the name and grid only |
| Colour and Background controls | Kept in separate places (intentional) |
| Name field label | "Enter anything to see your avatar"; placeholder "Username, name…"; starting value "hello-world" |
| Word "seed" | Never shown in the interface; the UI says "Name" |
