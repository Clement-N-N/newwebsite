# Photography source files

Original, unedited photographs supplied by Impact Axis. Keep original filenames. Web-ready crops and sizes are produced from these through `astro:assets`. Never edit or overwrite the files here.

For each photograph, record its source folder (by name, not link, because the repository is public), its original filename, and whether consent for publication has been confirmed.

## `hero-candidates/`

Homepage hero shortlist, chosen from the Drive folders **GWF Photos** (Goodwill Fellowship 2026, IDT-series, Sony ILCE-6700, 6192 × 4128) and **GWF Photos More** (DSC-series). 190 of the 192 photographs in the two folders were reviewed; *IDT-87.jpg* (a group photo) and one DSC file were not. The *Headshots* subfolder was not reviewed because headshots do not suit a hero.

| File | Source folder | Bytes (unchanged) | Consent confirmed | Notes |
| ---- | ------------- | ----------------- | ----------------- | ----- |
| `IDT-46.jpg` | GWF Photos | 1,128,730 | **Pending** | **Used in the homepage hero.** A fellow speaking mid-sentence, holding her notes, with the cohort behind her. |
| `IDT-56.jpg` | GWF Photos | 893,737 | Pending | Alternative. A fellow presenting with an open-hand gesture against a clean wall. Easiest cutout, calmer expression. |
| `IDT-41.jpg` | GWF Photos | 1,105,285 | Pending | Alternative. A fellow presenting beside The Hive banner, hand gesturing. The branding ties it to The Hive programme. |

## Derived assets and edits

### `src/assets/hero/idt-46-stage.jpg` (from `IDT-46.jpg`)

- Crop only: x 1300–5900, y 700–4128 of the original (4600 × 3428). The top edge of the crop is the photo window's frame line.
- No exposure, colour, retouching or content changes. Skin tones and the documentary character are unchanged.

### `src/assets/hero/idt-46-foreground.png` (from `IDT-46.jpg`)

- A transparent band of the same participant, from above her crown to about 420px below the frame line (1239 × 820). It is placed over the stage at exactly the same scale, so only the crown visibly crosses the frame.
- How the matte was made:
  1. **Canva: used.** The original was imported into the Impact Axis Canva account and run through Canva's *Remove background*. The full-resolution Canva result (3872 × 2581) could not be exported to the build environment, because the environment's network policy blocks `canva.com` and `media.canva.com`. Only Canva's 200 × 133 preview matte came back, and it was used as one of two coarse guides.
  2. **Local tools (Python):** MediaPipe selfie segmentation (the model bundled in the pip package) gave the second coarse guide. Where both guides agree, a trimap was built; OpenCV GrabCut resolved the rest at half resolution, and a guided filter refined the edge at full resolution. The edge was then choked slightly to remove a light fringe from the wall behind, and the lower edge of the band was feathered.
- No pixels were painted, generated or altered. The cutout's colour pixels are the original's.
- Scripts: `tools/hero-matte/`. The geometry is recorded in `HomeHero.astro` (`--stage-ar`, `--front-*`).

## `why-we-exist/`

| File | Source folder | Bytes (unchanged) | Consent confirmed | Notes |
| ---- | ------------- | ----------------- | ----------------- | ----- |
| `IDT-34.jpg` | GWF Photos | 1,611,277 | **Pending** | **Used in the homepage Why We Exist section.** Four fellows leaning over shared worksheets, writing and discussing. The fellow on the left also appears in the hero photograph (IDT-46), a different shot. |

- `src/assets/why/idt-34.jpg` is a byte-identical copy (same SHA-256). There are no exposure, colour or content edits.
- Crops are CSS only (`object-fit: cover`): 1:1 at `object-position: 38% 40%` on phones, and 3:2 at `50% 35%` from 640px.
- Canva was not used. The photograph needed no correction, its treatment matches the unedited hero, and full-resolution Canva exports are blocked by this environment's network policy.
