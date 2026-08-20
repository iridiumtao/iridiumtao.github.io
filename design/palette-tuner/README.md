# Palette tuner

A throwaway-grade design tool kept because the palette question will come back.
It renders the site's real mobile layout at 390px, using the real Open Huninn
subset, the real copy from `data/portfolio.json`, and two real project images
(one white-background diagram, one photograph), then lets you drive the colour
tokens with sliders and watch the result.

Nothing here is part of the site build. Next only scans `pages/`, so this
directory never reaches the static export.

## Run it

```bash
python3 -m http.server 4322
```

from the **repo root**, then open
<http://localhost:4322/design/palette-tuner/index.html>.

It has to be served rather than opened as `file://` — browsers block `woff2`
loads from `file://`, so the typeface silently falls back and the preview stops
being representative.

To share it as a single file that opens anywhere:

```bash
node design/palette-tuner/build.mjs --inline
```

writes `index.inline.html` (~760 KB, gitignored).

## Rebuild after editing

`index.html` is generated. Edit the sources, then:

```bash
node design/palette-tuner/build.mjs
```

| file | role |
|---|---|
| `shell.html` | page skeleton and the control panel markup; `__CSS__` / `__COLOR__` / `__APP__` / `__FONT__` are the injection points |
| `tuner.css` | panel chrome plus a faithful copy of the live `.we` mobile rules |
| `color.js` | OKLCH <-> sRGB, WCAG contrast, the contrast solver, OKLab deltaE |
| `tuner.app.js` | state, token derivation, AI-proximity panel, hold-to-compare |
| `build.mjs` | concatenates the above into `index.html` |

## What the controls do

- **底色 ground** - lightness / chroma / hue in OKLCH. Chroma is the muddiness
  axis: mid lightness with high chroma is what reads as "earthy".
- **奶茶濃度 surfaces** - how milky the cards, chips and rules are. Once the page
  goes near-white this is where the milk-tea colour actually lives, because milk
  tea as *text* on white is 1.7-3.0:1 and fails AA outright.
- **accent** - family buttons plus hue/chroma. Wood and milk-tea accents sit
  inside the flagged hue range by definition, so chroma below ~0.086 is the only
  axis that keeps them clear of it.
- **按住比較現況配色** - hold to render the palette currently live on
  chun-ju.irilia.app; release to return. Sliders are not disturbed.

## Two things that are load-bearing

**Text depth is solved, not chosen.** Every text token binary-searches for the
OKLCH lightness that hits its required contrast against the current ground, so
no slider position can produce an inaccessible palette. Verified at four extreme
positions: index 4.60-4.64, meta 5.20-5.22, body 7.21-7.28, prose 9.42-9.50.

**The AI-proximity check is region-based, not hex-based.** The bands are the
measured OKLCH envelope of the colour sets flagged in the design skill, and
membership in a band is the verdict; deltaE to the nearest member is supporting
detail. Two corrections that came out of testing and must not be undone:

- Hue is ignored below chroma 0.02. Hue is numerically unstable for
  near-neutrals, and without this guard `#fbf7f2` reported "safe" on a
  13-degree hue wobble despite being deltaE 0.003 from a flagged cream, i.e.
  the same colour.
- A deltaE under 0.012 overrides the band outright. Reproducing one of the
  listed colours puts you in the region whatever the envelope says.

deltaE calibration: 0.003 is "the same colour", 0.008 still reads as the same
family, 0.25 is indigo against clay.

## Limitation

A 0/3 score means "not that specific stock palette". It does not mean "does not
look machine-made" - near-white plus grey text plus soft corners is a different
default, and this tool cannot see it. That judgement needs eyes on the preview.
