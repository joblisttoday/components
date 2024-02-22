---
title: map
sidebar: false
footer: false
---

```js
import joblist from "../src/index.js";
```

```js
const { sdk, map } = joblist;
const { companiesResultsToMapMarkers } = map;
```

```js
(async ({
		$search = document.querySelector("joblist-search"),
		$map = document.querySelector("joblist-map-list"),
} = {}) => {
		const handleSearch = ({ detail }) => {
				const { companies, query } = detail;
				if (!query) {
						$map.setAttribute("markers", JSON.stringify(allMarkers));
				} else if (query && companies) {
						/* @TODO there are no position on jobs yet */
						delete detail.jobs;
						const itemMarkers = companiesResultsToMapMarkers(companies);
						$map.setAttribute("markers", JSON.stringify(itemMarkers));
				} else if (!companies) {
						$map.removeAttribute("results");
				}
		};
		await sdk.initialize();
		const allCompanies = await sdk.getAllCompaniesData();
		const allMarkers = companiesResultsToMapMarkers(allCompanies);
		$search.addEventListener("search", handleSearch);
		$map.setAttribute("markers", JSON.stringify(allMarkers));
})();
```

<joblist-search></joblist-search>
<joblist-map-list latitude="" longitude="" zoom="3" origin="https://profiles.joblist.today/companies"></joblist-map-list>
