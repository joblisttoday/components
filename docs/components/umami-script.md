---
title: joblist-umami-script
---
```js
import joblist from "../src/index.js";
```
# joblist-umami-script

Insert this element on a page (only once in the page), so
https://umami.is can track the analytics from visits of the live web
pages of the project.

Accepts attributes `website-id` and `zone` to build the `src` URL of
the umami script (and other required attributes).

> Note: the analytics of the projects are public (link on the
> homepage), and umami should respect user's privacy.

In joblist website cases, the same script should be copied from the
homepage, to track the same site (ID) across domains.

```html
<joblist-umami-script
  website-id="479fa5c4-e9c9-4d8d-85c6-9a88c886dd24"
></joblist-umami-script>
```

<joblist-umami-script website-id="479fa5c4-e9c9-4d8d-85c6-9a88c886dd24"></joblist-umami-script>
