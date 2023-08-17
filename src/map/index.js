import 'leaflet'
import MapList from './list.js'

const parsePosition = (position) => {
	if (!position.map) return null
	let mapData
	try {
		mapData = JSON.parse(position.map)
	} catch (error) {
		console.log('error parsing map data', error)
		return null
	}
	if (
		mapData
		&& mapData.type === 'Point'
		&& Array.isArray(mapData.coordinates)
		&& mapData.coordinates.length === 2
	) {
		return {
			longitude: parseFloat(mapData.coordinates[0]),
			latitude: parseFloat(mapData.coordinates[1]),
		}
	}
	return null
}

const companiesSqliteResultsToMapMarkers = (companyResults) => {
	const { columns, values: companies } = companyResults[0]
	const companyMarkers = []

	companies.forEach(companyRow => {
		const companyData = columns.reduce((acc, cur, index) => {
			if (['positions', 'tags'].includes(cur)) {
				try {
					acc[cur] = JSON.parse(companyRow[index])
				} catch(e) {}
			} else {
				acc[cur] = companyRow[index]
			}
			return acc
		}, {})

		const {title, slug, positions} = companyData
		if (!positions) return
		positions.forEach(position => {
			const mapData = parsePosition(position)
			try {
				if (mapData) {
					companyMarkers.push({
						text: title,
						slug: slug,
						...mapData,
					})
				}
			} catch(e) {}
		})
	})

	console.log('companyMarkers', companyMarkers)
	return companyMarkers
}

const companiesAlgoliaResultsToMapMarkers = (searchResults = []) => {
	const companyMarkers = []
	searchResults.forEach(result => {
		if (!result.positions) return
		result.positions.forEach(position => {
			const mapData = parsePosition(position)
			if (mapData) {
				companyMarkers.push({
					text: result.title,
					slug: result.slug,
					...mapData,
				})
			}
		})
	})
	return companyMarkers
}

const companiesFileToMapMarkers = (({ edges }) => {
	let markers = []
	edges.forEach(({ node }) => {
		markers = [...markers, ...companyFileToMapMarkers(node)]
	})
	return markers
})

const companyFileToMapMarkers = (companyNode) => {
	const { frontmatter, fields } = companyNode
	if (!frontmatter.positions) {
		/* no markers for this company */
		return []
	}
	const markers = []
	frontmatter.positions.forEach(position => {
		const mapData = parsePosition(position)
		if (mapData) {
			markers.push({
				text: frontmatter.title,
				slug: fields.slug,
				...mapData,
			})
		}
	})
	return markers
}

const companiesResultsToMapMarkers = (companies) => {
	return companiesAlgoliaResultsToMapMarkers(companies)
}

export {
	MapList,
	companiesResultsToMapMarkers,
	companiesFileToMapMarkers,
	companiesSqliteResultsToMapMarkers,
	companiesAlgoliaResultsToMapMarkers,
}
