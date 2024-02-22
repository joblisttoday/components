---
sidebar: false
footer: false
---

```js
import joblist from "../src/index.js";
view(joblist)
```

```js
const searchParams = new URLSearchParams(window.location.search);
const slug = searchParams.get("slug")
const days = searchParams.get("days") || 365;
const $heatmap = document.querySelector("joblist-heatmap");
if ($heatmap) {
  slug && $heatmap.setAttribute("slug", slug);
  days && $heatmap.setAttribute("days", days);
}
```

<joblist-heatmap></joblist-company-heatmap>
