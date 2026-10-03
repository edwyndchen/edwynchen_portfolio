**Button** — the primary porcelain action; cobalt fill by default, seal red for rare emphasis, outline/ghost for quiet secondary actions. Use the `arrow` prop for "explore / view" wayfinding links.

```jsx
<Button variant="primary" arrow>Explore More</Button>
<Button variant="secondary" href="#work">View Work</Button>
<Button variant="seal" size="lg">Get in touch</Button>
<Button variant="ghost" size="sm">Let's talk</Button>
```

Variants: `primary` (cobalt), `secondary` (cobalt outline), `ghost`, `seal` (red), `inverse` (for navy sections). Sizes `sm | md | lg`. Press settles 1px — no bounce. Pass `href` to render an anchor.
