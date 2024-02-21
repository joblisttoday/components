---
title: board-provider
---
```js
// import joblist from "../../src/index.js";
```
# board-provider
```js
import joblist from "../../src/index.js";
```

```js
const exampleProviderHostnames = {
		ashby: "beeper",
		greenhouse: "neuralink",
		lever: "1password",
		personio: "abletonag",
		recruitee: "bitfinex",
		workable: "dribbble",
		smartrecruiters: "omio1",
		matrix: "!HcTGSUjzCOArAeiGzL:matrix.org",
};

(() => {
		const $boards = Object.entries(joblist.providers).map(
				([_providerTag, provider]) => {
						const $board = document.createElement("joblist-board");
						$board.setAttribute("provider-name", provider.id);
						$board.setAttribute(
								"provider-hostname",
								exampleProviderHostnames[provider.id],
						);
						return $board;
				},
		);
		document.querySelector("joblist-layout").append(
				...$boards.map(($board) => {
						const $details = document.createElement("details");
						const $summary = document.createElement("summary");
						$summary.textContent = $board.getAttribute("provider-name");
						$details.append($summary, $board);
						return $details;
				}),
		);
})();

```

<joblist-layout></joblist-layout>
