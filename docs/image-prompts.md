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
