# Image prompts

_All artwork for the porcelain portfolio. Append the STYLE block to every prompt. Model and approval status recorded per batch._

## STYLE block (append to every prompt) — APPROVED 2026-10-03

Model: **Seedream 5.0 Pro** (`seedream_v5_pro`, 2k). Always pass the approved hero job `7fe457e1-a346-44db-a466-2c1e0affc431` as an `image_references` media so every image matches its hand.

```
Traditional blue-and-white Chinese porcelain underglaze brushwork: confident cobalt brush strokes with tapering ends, flat layered cobalt washes in three tones from deep cobalt (#1F3FA8) to pale periwinkle (#A9B8E6), hand-painted feel, on a plain warm white background (#FBFAF7). Blue only, no text, no signature, no watermark, no frame, not a photo of a plate or vase.
```

Flora variant (gold allowed only on wattle): use the waratah sprig (`3cd0ab56-cc8e-4d87-8f6f-ea4314fadcd2`) as the style reference. Clean botanical brushwork, one plant species per image (waratah and wattle never on the same stem).

## Avoid (negative prompt, or bake into the prompt if no negative field)

```
purple, teal, neon, gradient, glossy 3D render, photograph, watercolour bleed, blurry, Japanese motifs, Mount Fuji, cherry blossom, text, watermark, frame, drop shadow, cluttered
```

## Batch 0: style test

- **T1 mountains:** A sweeping range of tall jagged Chinese mountain peaks in the style of Song dynasty shan shui landscape painting, layered ridges, mist gaps between ridges, wide panoramic composition with peaks across the full width, the base fading into blank white. [STYLE]
- **T2 corner ornament:** A square corner ornament for a porcelain plate border: a Chinese scrolling vine pattern where the flowers are a waratah and a banksia and the leaves are eucalyptus gum leaves, with three small golden wattle blossom clusters (#B8862B, the only non-blue colour), filling the top-left corner and trailing along the top and left edges, the rest blank white. [STYLE]

## Decisions from style tests (Ed, 2026-10-03)

- Round 1 (engraved, T1/T2): Seedream preferred over Nano Banana (which drew a physical plate). Ed asked to see brush strokes.
- Round 2 (T3–T6): porcelain brush style chosen (T6 the favourite). Melbourne 108 and Eureka removed: too busy, and the model drew Eureka instead of 108.
- Round 3 (T7–T10): **Hero = T7 option A** (`7fe457e1-a346-44db-a466-2c1e0affc431`): Arts Centre Spire left, Flinders Street Station right, mountains and cloud scrolls, tram on an arched bridge. Only those two landmarks, no other buildings.
- Corner ornaments rejected ("won't work on a webpage"). Flora appears as free-floating spot illustrations instead. **Style = the waratah sprig (T9).** Each plant separate: waratah, wattle, banksia, gum leaves as their own pieces.

## Batch 1 (hero) — approved approach, 2026-10-03

Final hero = approved option A (`7fe457e1`) split into depth layers via Seedream edits, not regenerated: far range (`66bbdbe7`), peaks (`1f44e585`), Melbourne without mountains (`99f59d83`), tram (`8b3d4601`), clouds n1–n7 with tails trailing left (`764a9c9e`, `bd2f1582`, `9eae2eaf`, `7291d28c`, `938aa88b`, `356d8276`, `c3c2ede5`). Editable full-size sources live in `art/hero-source/`; Ed edits them and runs `node art/hero-source/build.mjs` (solid white fill under shapes, softened cloud outlines, outputs to `public/hero/`).

## Batch 2 (flora + covers) — approved by Ed, 2026-10-03

- Flora, one species each: waratah `268ebda7`, wattle `85f775bc`, banksia `8b663646`, gum branch `2b8b9cd0`.
- Covers: form guide horse `cc3601d9`, EonX lattice `be5eec04`, Pay By Account coin `29e8a24f`, Punters pattern-book page `a8b707a0` (re-roll; v1 `b1bd6669` rejected: physical tiles with shadows and a Japanese-looking wave).

## Portrait (About transition) — approved by Ed, 2026-10-04

Final: pose 2 "dramatic descent" (`ff95fb9b`, Nano Banana, refs: Ed's illustration `b8e16570`, porcelain style `7df1eddf`, Chang'e painting `e40be9ce`), generated as a small centred figure so nothing touches the frame. Background removed (`432db29d`), recoloured to the hero blues with `node art/portrait/recolor.mjs <in> <out> 1.3`, mirrored horizontally (Ed: "flipped the wrong side"), trimmed, saved as `public/images/ed-porcelain.webp`. Earlier rejected attempts are kept in `art/portrait/`.

## About cloud walls, 2026-10-04

Right wall repainted with short tails (Ed: "the long tail overlaps the character"). Seedream 5.0 Pro edits of the previous `public/hero/cloud-wall-right.webp` (uploaded `ec12a5c2`): first pass `0030af98` (option B of 2, shorter tails), second pass from it `244dd672` (option C, middle wisp ends in a small curl; D `35934fe4` rejected for black outline artefacts). Raw file `art/about/cloud-wall-right-short-tails.png`, cropped (left 34px, so the leftmost billow keeps the old 0.326 position and `--inner` stays 0.43) and resized to 1600px wide.

## Hero clouds v2, 2026-10-04

Seedream 5.0 Pro off hero `7fe457e1`: long bands `ad6aa391`, `830e3949`, `6ed7d08d`, `d36e8854` (v1-v4) and soft billows `013a9e09`, `926136df`, `dbe8516e`, `e2e5916c` (v5-v8). Run through `art/hero-source/build.mjs` (softened to the pale washes). Ed then asked for more swirls back: the hero mixes v-clouds with old n2, n3, n5, n6, n7.

## About costume change, 2026-10-04

Nano Banana 2 off Ed's final portrait (uploaded `a41400c8`). Festival wear with pig mask and piglet: options `be1fd420` (A), `7c462015` (B, used). Aquarius water bearer: `df71be7d` (A), `3bc67e93` (B, used). Backgrounds removed (`7a4a395a`, `d9093623`), recoloured with `node art/portrait/recolor.mjs <in> <out> 1.3`, framed on the portrait's 1100x1538 canvas: `public/images/ed-pig.webp`, `public/images/ed-water.webp`.

## Contact scroll range, 2026-10-04

`public/hero/contact-range.webp`: the hero's peaks and outer peaks layers combined and lifted 62% towards paper-100 (no new generation).

## About costume change v2 and scroll rods, 2026-10-05

Ed: three completely different outfits and poses. Nano Banana 2 off portrait `a41400c8`: Tang-style festival jacket with pig mask and piglet `c3f27e06` (A), `86f5f69a` (B, used, cutout `9e5c738b`); Song-style layered robe pouring a vase over the shoulder `98c46691` (A), `4fe8a026` (B, used, cutout `26974e28`). Recoloured (`recolor.mjs … 1.3`) and centred on the portrait's 1100x1538 canvas.
Scroll rods, Seedream 5.0 Pro: `fd318044` (A), `c494b96d` (B, used), sliced into `public/scroll/rod-{left,mid,right}.webp`.
Hero clouds v3 (more swirls), Seedream off `7fe457e1`: xiangyun `9e43e9ac`, `f2874f32`, `1b4c06ad`, `4a097d4c` (s1-s4), ruyi `8ea99bb1`, `1ad95269`, `b21d1457`, `8f5c35ca` (r1-r4). Built by `npm run hero`; the scroll's pale copies by `npm run range`.

## Round 3 fixes, 2026-10-05 (sources in `art/round3/`)

- Pig outfit, ribbon over both arms: Nano Banana 2 edit of the old pig (`86f5f69a`): `1e8faed7` (A, ribbon unchanged), `45d0028d` (B, used). Cutout `47960fdf`.
- Aquarius, one stream only: Nano Banana 2 edit of the old water bearer (`4fe8a026`): `86450536` (A, used), `4f6cb69a` (B, second stream kept). Cutout `d8b37b29`.
- Both framed and recoloured by `node art/round3/frame.mjs` (cobalt ramp, depth 1.3, fitted into the old outfit's box). Wind maps (only ribbon and water move): hand-traced body polygons in `art/round3/wind-maps.mjs`. Red-fill mask attempts (`6bf18c7d`, `17d3f7e7`) and layer splits (`f5b2cefa`, `b5bcae14`) didn't work.
- Scroll, painted in the art's style (Seedream 5.0 Pro off `7fe457e1`): rods `cab11f7b` (A, plain caps), `21d920e4` (B, lotus caps, used); ranges `6bf76ef8` (A, low and gentle, used), `89740acc` (B, bolder); clouds `344977b3` (three xiangyun, used as a–c), `b17db4f6` (lower band used as d). Built by `npm run scroll`.
- Hero clouds moved onto the mountains' cobalt ramp in `build.mjs` (shared `art/portrait/cobalt.mjs`), outlines softened less (0.5); the hand-cropped right wall recoloured by `art/about/recolor-wall.mjs`.

## Round 4, 2026-10-05 (sources in `art/round4/`, all Seedream 5.0 Pro off `7fe457e1`)

- Scroll painting with the clouds painted in: `5154b1a6` (A), `e4d4fa4b` (B, used). Built into `public/scroll/range.webp` by `npm run scroll`.
- Workshop header lattices: cracked ice `a958b870`, key fret `e649cf14`, begonia and circles `6c293bd6` (live for now), octagons and plum blossom `d6980391`. Pale cobalt copies in `public/workshop/`; compare on `/lab/`.
- Contact seal (follows the pointer): lion-knob chop `4a46b4da` (used), tasselled cylinder `35a516ef`. Cut out to `public/scroll/seal.webp`.
- The stamp impression is Ed's Logo Mark Secondary in `--seal-500`, drawn in `src/components/SealStamp.astro` (no generation).

## Round 5, 2026-10-05 (sources in `art/round5/`)

- Hanfu repaint, ribbon over both arms and a soft hem (Nano Banana 2 edit of the live hanfu): `22e47cbd` (A), `2d94d515` (B, used: swirling rounded hem). Cutout `380b7eb4`, framed with `frame.mjs … 45` (45px extra margin). Wind map traced in `wind-maps.mjs`.
- Seal standing on its face: `925e4262` (Nano Banana 2, used), `86402235` (Seedream, three-quarter view).
- Lab tests (Seedream off `7fe457e1`): mist fill `9e6abde9`, mist bank `64331fda`; lattice doors with a blank moon window `3b9e91ba` (A), `42fd5830` (B). Ed's secondary mark is overlaid in the window in code.

## Round 6, 2026-10-05 (sources in `art/round6/`)

- Hanfu, new shawl over both shoulders and a softer centre hem, edited from the round-4 hanfu: `d2b4f2da` (A, used; cutout `8608d83b`, framed full width with 16px margins so it matches the other outfits' size), `e6cad3fa` (B).
- Aquarius with both feet and outlined hands: `aa36c05a` (A, used; cutout `c2ccd1e0`), `7aea8957` (B).
- Foreshortened seal (lion towards the viewer, face down): `ec7943ad` (Nano Banana 2, used), `6f16da45`.
- Paint-the-scroll: river scenes `d760f1ac`, `0643fce4` (used); flying pigs `09ea2d8e` (plum blossom, used), `786b1a66`. The mountains scene is the round-4 scroll painting. Skeletons are edge-traced from the paintings by `npm run scroll`.
- Landing doors: Doors B `42fd5830` (`public/intro/doors.webp`).

## Round 7, 2026-10-05 (sources in `art/round7/`)

- Door B cleaned up (real mitred lattice corners): `478d7619` (A, used), `04a99b42` (B, plain realistic joinery with a carved apron).
- Hanfu with a high floating shawl and smaller sleeves (edit of `d2b4f2da`): `ad59d72a` (A, came with a stray frame), `1abc5bd6` (B, used; cutout `1850f94d`).
- Flying pig in the hanfu's style, realistic: `32ce0df1` (used), `73ba981e` (hatched).
- Scroll scenes: Twelve Apostles `60822054`, `ec60f5dc` (used); Wilsons Promontory `6960a3f4` (used), `d59e534b`.
- Foreshortened brush, leaning right: `ec91ebcb`, `5333eddd` (used).
- The pig outfit was re-framed smaller (`frame.mjs … 80`) to match the others; its wind trace was mapped by the same scale and offset.

## Round 8, 2026-10-05 (sources in `art/round8/`)

- Seal at a gentle 30° view: `a72c3c02`, `355ed3f1` (used). Brush leaning 30° right: `0c498bfe` (bamboo), `1731582b` (used, blue).
- Scenes in the hero's bold cobalt with cloud scrolls (off hero `7fe457e1`): Twelve Apostles `ad2d8bef`, `65939bca` (used); Wilsons Promontory `486d92a6` (used), `853d088c`.
- Flying pig drawn from the About piglet (ref `45d0028d`): `f4bc4623` (used), `e4d4a018`.

## Round 9, 2026-10-05 (sources in `art/round9/`, contact sheet `art/round9/sheet.png`)

- References uploaded: current scroll pig `a6dfc031`, hanfu figure `0360fb58`. Nano Banana 2.
- Flying pig options (from the scroll pig): crane wings `c8aead0b`, riding a ruyi cloud `e181000d`, lifted by lanterns `f0952aa1`, feitian ribbons `7720bace`, lucky-bat wings `2ff02a21`. Ed first picked the cloud (`e181000d`), then switched to the crane wings (`c8aead0b`, flood-fill cutout `art/round9/pig-cut.mjs`, recoloured 1.3, `public/scroll/pig.webp`). An unused crane-pig regeneration: `b32ddeb2`.
- Hanfu with two shawl ends (edits of `0360fb58`): A, hip tail removed `8c16f4b1`; B, arm streamer removed (hip tail redrawn) `bfbe0ee4`. Ed picked A, with the ribbon higher: edits of A, updraft `cf3e1472` (used), celestial `ecc358a8` (grew extra ends).
- Pointing hand (from the hanfu's hands): with sleeve `537e7e30`, plain manicule `1e785172` (Ed's pick, cutout `9d873e98`, recoloured `recolor.mjs … 1.3`, `public/about/hand.webp`).

## Round 10, 2026-10-06 (Seedream 5.0 Pro off `7fe457e1`, 2 options each; A of each live for Ed's review, sources in `art/round10/`)

- Punters cover, specimen page of six keylined panels (Aa, colour ramp, layout grid, lattice pattern tile, buttons and toggle, spacing scale): `54ae5f68-b375-409b-9577-21992faa5ea4`, `f80b8517-e2ea-4b6a-ae29-14c463b79d21`.
- EonX cover, the same mix as an asymmetric bento sheet (Aa with weights, three colour ramps, grid, button/input/checkbox, cloud-scroll pattern, spacing bars, four line icons): `0ffe01ae-2194-4202-a7ce-2505b2d534f5`, `ed6c353e-bd1b-4b81-9e52-fb2d3febda7c`.
- Ruyi sceptre wand (Ed's pick), cloud head top left, to be cut out to `public/about/ruyi.webp`: `7a87d048-bb93-4d71-8c48-60b31d2d6657`, `051e9b45-b347-44a2-9822-07f3205dc1d3`.
- Ed's picks: Punters A, EonX B (its gibberish button labels removed by a Seedream edit, `6da3f945` used, `1b47e2f2` alt), ruyi A (B has a shadow wash). Traditional star wands to compare: `c295b590` (A), `bd0159bb` (B, faint glow along the rod). Ruyi cut with `art/round9/pig-cut.mjs`, recoloured (`recolor.mjs … 1.3`), cropped to the paint, 400px: `public/about/ruyi.webp`.

## Round 10b, 4k upscales (Higgsfield bytedance upscale, 4k), 2026-10-06

- Hanfu (flattened `ed-porcelain-before-brighten`): `c98c40ee` -> `art/round10/upscale/hanfu-4k.png` (2941x4096).
- Hero layers: the full 3120px sources failed; each split into L/R 1680px halves (240px overlap) instead. Melbourne `dec9d944` / `8eb7a508`, far `432ed31a` / `2287a094`, peaks `f5c42780` / `20e46190`, peaks-front `93e72ccd` / `953ce6c8`. Stitched by `art/round10/hero-4k.mjs`.

## Round 11, 2026-10-06

- Coffee faces, Nano Banana Pro off a head-and-shoulders crop of the HD hanfu (uploaded `1fbe9b10`): drained `f232b494` (A) / `c3d0ea80` (B, live), tired `30501caa` / `2bda7f20` (B), okay `31e358ba` / `07542b54` (B), buzzing `a6b715ca` / `4c2d8273` (B). Options sheet `art/round11/faces-options.png`.
- EonX cover fix, Seedream 5.0 Pro edit of `6da3f945`: `5ff641d0` (A, used, stray line then painted out) / `0b8ec66f` (B).
- Coffee faces v2 (Ed: use his photos as the basis), Nano Banana Pro with three face crops of Ed's photos (`65488aa6` red envelopes, `ae54959f`, `bc238223`; sources `art/round11/face-ref-*.jpg`) plus the porcelain hanfu crop `1fbe9b10` for style: drained `926a1627` (A, live) / `b5407cf2`, tired `266db0cc` / `c22a5d1e` (B, live), okay `c3ccf379` (A, live) / `a06b7c86`, buzzing `bd5f87ad` (A, live) / `17242570`. Built by `art/round11/faces-build.mjs` (paper whitened; `PICK` per state). Sheet `art/round11/faces-v2-options.png`.
- Coffee frames v3 (Ed: three stages, white background, no yawn, always front-facing, same outfit, smooth transitions): frame 4 = `c3ccf379` (the v2 okay A), and Nano Banana Pro expression-only edits of it: 1 `8c6acdb2`, 2 `a46f4ec7`, 3 `bb56eb6e`, 5 `cbccbcdf`, 6 `4ed49fe9`, 7 `7b48a7e7`. Strip `art/round11/frames-v3.png`.
- Round 11c: coffee cup cursor, Seedream off `7fe457e1`: `66bcd69d` (A, used; cut and recoloured by `art/round10/wand-cut.mjs`) / `e1f4f55a`. In-between face frames (Nano Banana Pro edits of `c3ccf379`): 1b `8d14e8a4`, 2b `defb9764`, 3b `cc292f2c`, 4b `058576ce`, 5b `fcb39122`, 6b `1edf2c60` (dropped). Lattice windows: tall `58862060` / `6e462897` (too tall to span the screen), low transom off `6e462897`: `6d82f3da` (A, used) / `9f1eda45`.
- Simpler lattice (Ed), Seedream edits of `6d82f3da`: `693ba277` (A, plain frames) / `788ff241` (B, a thin bar near each pane's edges, used).
