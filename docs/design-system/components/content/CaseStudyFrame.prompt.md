**CaseStudyFrame** — presents a case-study cover image as a mounted hand-scroll (卷轴): the scroll art is the frame, your image sits in its inner writable area. Copy `assets/scroll-frame.png` into your project and point `src` at it.

```jsx
<CaseStudyFrame image="/covers/nimbus.jpg" alt="Nimbus Banking cover" />
<CaseStudyFrame placeholder="Drop case study cover here" />
```

Leave `image` unset to show a dashed placeholder (`placeholder` prop customizes the label). `ratio` should match the scroll art's own proportions (default `1200 / 620`) so the frame never distorts.
