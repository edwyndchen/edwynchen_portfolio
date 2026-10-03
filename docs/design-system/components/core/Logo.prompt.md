**Logo** — Edwyn Chen's brand marks, rendered as inline SVG so any `color` applies (cobalt, ink, ivory reversal). Do not redraw these paths.

```jsx
<Logo variant="wordmark" size={44} color="var(--blue-700)" />
<Logo variant="mark" size={40} />
<Logo variant="medallion" size={36} color="var(--seal-500)" />
```

`variant`: `mark` (single gate glyph, default), `medallion` (four-petal), `wordmark` (full lockup). `size` is height for wordmark/medallion, square for mark.
