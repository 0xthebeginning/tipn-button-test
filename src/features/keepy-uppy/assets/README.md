# Keepy-Uppy assets

The MVP ships with **zero binary assets**: GameCanvas draws a built-in
vector Super Inu and soccer ball, so the game runs immediately.

To swap in real art, drop PNGs at these paths in the repo's `public/`
directory (paths are defined in `../engine/constants.ts` → `ASSET_PATHS`):

```
public/assets/keepy-uppy/super-inu.png    # transparent bg, roughly square,
                                          # dog facing forward, feet at the
                                          # bottom edge (anchored to ground)
public/assets/keepy-uppy/soccer-ball.png  # transparent bg, square, ball
                                          # filling the frame
```

The sprite loader probes those URLs at runtime — if a file exists it is
used, otherwise the vector fallback draws. No code change needed.

If you'd rather bundle the sticker via static import (next/image style
imports from this folder), change the loader in
`components/GameCanvas.tsx` to take imported `StaticImageData` instead of
URL strings — it's the only file that touches assets.
