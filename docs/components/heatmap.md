---
title: joblist-heatmap
---

```js
import "../src/index.js";
```

# joblist-heatmap

```js
import "../../src/index.js";
const searchParams = new URLSearchParams(window.location.search);
const slug = searchParams.get("slug")
const days = searchParams.get("days") || 365;
const $heatmap = document.querySelector("joblist-heatmap");
slug && $heatmap.setAttribute("slug", slug);
days && $heatmap.setAttribute("days", days);
```

<joblist-heatmap></joblist-company-heatmap>

## Usage

Use the `slug` (of value `company.slug`) and `days` (Number of days)
attributes and URL search parameters to display, the content for a
specific company.

```
<joblist-heatmap></joblist-company-heatmap>
```
