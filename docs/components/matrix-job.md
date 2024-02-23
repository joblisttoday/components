---
title: joblist-matrix-job
---
```js
import joblist from "../src/index.js";
```

# joblist-matrix-job

Display a job event as returned from a matrix room.

Used with `@scltib/mwc` register custom event template for
`today.joblist.job` display template, accepting the `event` attribute
as a JSON stringified Object.

```html
<joblist-matrix-job
				event='{"content":{"description":"Looking for someone to discuss features and implementations of joblist.today and related websites. Objectives are to make it a nice place to explore available jobs and companies recruiting worldwide, and a creative place and system to provide resources to do so. Matrix + static web + inclusive coop-skill-crafting, get in touch!","title":"Curious collaborator","url":"https://joblist.today"},"origin_server_ts":1707465877963,"room_id":"!pNBegNHVdEdLkDUEbM:matrix.org","sender":"@ugp:matrix.org","type":"today.joblist.job","unsigned":{"age":1917882},"event_id":"$a9Sv7LoQjFh9SOeTsuurUnA9VCs3i6jOuNehr-tOqjI","user_id":"@ugp:matrix.org","age":1917882}'
></joblist-matrix-job>
```

<joblist-matrix-job event='{"content":{"description":"Looking for someone to discuss features and implementations of joblist.today and related websites. Objectives are to make it a nice place to explore available jobs and companies recruiting worldwide, and a creative place and system to provide resources to do so. Matrix + static web + inclusive coop-skill-crafting, get in touch!","title":"Curious collaborator","url":"https://joblist.today"},"origin_server_ts":1707465877963,"room_id":"!pNBegNHVdEdLkDUEbM:matrix.org","sender":"@ugp:matrix.org","type":"today.joblist.job","unsigned":{"age":1917882},"event_id":"$a9Sv7LoQjFh9SOeTsuurUnA9VCs3i6jOuNehr-tOqjI","user_id":"@ugp:matrix.org","age":1917882}'></joblist-matrix-job>
