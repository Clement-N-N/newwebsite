# Hero cutout tools

These rebuild `src/assets/hero/idt-46-stage.jpg` and `idt-46-foreground.png` from `brand-source/photography/hero-candidates/IDT-46.jpg`.

1. `pip install opencv-contrib-python-headless mediapipe==0.10.14 pillow numpy`. The mediapipe 0.10.14 wheel bundles its selfie-segmentation model.
2. Optional coarse guide: Canva *Remove background* preview PNG. Set `CANVA` in `matte.py`, or remove its use.
3. `python3 matte.py`, then `python3 export.py`.
4. If the stage crop changes, update `--stage-ar`, `--stage-anchor-x` and `--front-*` in `src/components/HomeHero.astro` from the JSON that `export.py` prints.

Paths in the scripts point at the original working session. Adjust them before running.
