**RevealImage** — the porcelain gallery tile from the Graphic Design grid. On hover the image zooms slowly and a caption fades up over an ink-blue protection gradient.

```jsx
<RevealImage src="/assets/vase.jpg" title="Porcelain Vases" caption="Project Cover" />
<RevealImage src="/tiles.jpg" ratio="1 / 1" tone="dark" title="Porcelain Tiles" caption="Project Covers" />
```

Pass `children` instead of `src` to use a custom media node. Motion is calm (slow zoom, no bounce).
