# umami-script

Insert this element on a page (only once in the page), so
https://umami.is can track the analytics from visits of the live web
pages of the project.

Accepts attributes `website-id` and `zone` to build the `src` URL of
the umami script (and other required attributes).

> Note: the analytics of the projects are public (link on the
> homepage), and umami should respect user's privacy.

In joblist website cases, the same script should be copied from the
homepage, to track the same site (ID) across domains.
