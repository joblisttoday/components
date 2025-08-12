/* the list of providers we know how to parse */
const providersList =  {
	'recruitee.com': 'recruitee',
	'greenhouse.io': 'greenhouse',
	'workable.com': 'workable',
	'bamboohr.com': 'bamboohr',
	'bamboohr.co.uk': 'bamboohr',
	'personio.de': 'personio'
}

/* how to parse for the hostname inside a provider url */
const providerMethods = {
  recruitee: (url) => {
		const pregex = /(\w+)(?:\.recruitee\.com)/g
		const result = pregex.exec(url)
		if (!result) {
			console.info('Could not find id from Workable URL')
		}
		return result[1]
	},
  greenhouse: (url) => {
		const pregex = /(?:boards\.greenhouse\.io\/)(\w+)/g
		const result = pregex.exec(url)
		if (!result) {
			console.info('Could not find id from Greenhouse URL')
			return
		}
		return result[1]
	},
  personio: (url) => {
		const pregex = /([\w-]+)(?:-jobs\.personio\.de)/g
		const result = pregex.exec(url)
		if (!result) {
			console.info('Could not find id from Personio URL')
			return
		}
		return result[1]
	},

	/* not implemented, since no API connection yet (needs auth) */
	workable: (url) => {
		console.log('workable', url)
	},
  bamboohr: (url) => {
		console.log('bamboohr', url)
	},
}

/* find info in a provider url */
const findId = (url, provider, extractMethod) => {
	if(!provider) return null

	if (typeof extractMethod !== 'function') return null

	const extractedId = extractMethod(url)

	if (!extractedId) return null

	return extractedId
}

const findProvider = (url, providersList) => {
	let hostId;
	try {
		hostId = extractHostId(new URL(url).host)
	} catch(error) {
		console.info('Cannot find provider from url', url, error)
	}

	// from the hostId, find the provider id
	// and fallback to file.
	const hostExsists = providersList[hostId]
	if (hostExsists) {
		return providersList[hostId]
	}
	return undefined
}

const extractHostId = (host) => {
	const els = host.split('.')
	// the top domain name and its extension
	return els
		.slice(els.length - 2, els.length)
		.join('.')
}

// enforces the presence of a `host` in the url
const normalizeUrl = (url) => {
	// triiim it one last time
	url = url.trim()
	if (!url.startsWith('http')) {
		url = `https://${url}`
	}
	return url
}

const find = (inputUrl) => {
	// 0. normalize url, so it can be parsed homogenously
	const url = normalizeUrl(inputUrl)
	let id;

	// 1. detect which provider's url it is
	const provider = findProvider(url, providersList)

	if (!provider) {
		console.info('Could not detect a known provider: %s', url)
	} else {
		// 2. find a media/hostname `id` served by this provider
		id = findId(url, provider, providerMethods[provider])
		if (!id) {
			console.info('Could not detect id from provider: %s; url: %s', provider, url)
		}
	}

	// 3. return a result object
	return { url, provider, id }
}

export {
	find as parseProviderUrl
}
