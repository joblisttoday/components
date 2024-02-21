```js
import "../../src/index.js";
```

```js
const $search = document.querySelector('joblist-search')
const $results = document.querySelector('joblist-results')
$search.addEventListener('search', ({detail}) => {
	if (detail.companies || detail.jobs) {
		$results.setAttribute('results', JSON.stringify(detail))
	} else {
		$results.removeAttribute('results')
	}
})
```

<joblist-search></joblist-search>
<joblist-results></joblist-results>
