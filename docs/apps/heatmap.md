```js
// import "../../src/index.js";
```

```js
const searchParams = new URLSearchParams(window.location.search);
const slug = searchParams.get("slug")
const days = searchParams.get("days") || 365;
const $heatmap = document.querySelector("joblist-heatmap");
slug && $heatmap.setAttribute("slug", slug);
days && $heatmap.setAttribute("days", days);
```

<joblist-heatmap></joblist-company-heatmap>
