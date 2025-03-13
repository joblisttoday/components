import "leaflet";

const parsePosition = (position) => {
	if (!position.map) return null;
	let mapData;
	if (typeof position.map === "string") {
		try {
			mapData = JSON.parse(position.map);
		} catch (error) {
			console.log("error parsing map data", error);
			return null;
		}
	} else if (typeof position.map === "object") {
		mapData = position;
	}
	if (
		mapData &&
		mapData.type === "Point" &&
		Array.isArray(mapData.coordinates) &&
		mapData.coordinates.length === 2
	) {
		return {
			longitude: parseFloat(mapData.coordinates[0]),
			latitude: parseFloat(mapData.coordinates[1]),
		};
	}
	return null;
};

const companiesSqliteResultsToMapMarkers = (companyResults) => {
	const { columns, values: companies } = companyResults[0];
	const companyMarkers = [];

	companies.forEach((companyRow) => {
		const companyData = columns.reduce((acc, cur, index) => {
			if (["positions", "tags"].includes(cur)) {
				try {
					acc[cur] = JSON.parse(companyRow[index]);
				} catch (e) {}
			} else {
				acc[cur] = companyRow[index];
			}
			return acc;
		}, {});

		const { title, id, positions } = companyData;
		if (!positions) return;
		positions.forEach((position) => {
			const mapData = parsePosition(position);
			try {
				if (mapData) {
					companyMarkers.push({
						text: title,
						id: id,
						...mapData,
					});
				}
			} catch (e) {}
		});
	});
	return companyMarkers;
};

const companiesAlgoliaResultsToMapMarkers = (searchResults = []) => {
	const companyMarkers = [];
	searchResults.forEach((result) => {
		if (!result.positions) return;
		result.positions.forEach((position) => {
			const mapData = parsePosition(position);
			if (mapData) {
				companyMarkers.push({
					text: result.title,
					id: result.id,
					...mapData,
				});
			}
		});
	});
	return companyMarkers;
};

const companiesFileToMapMarkers = ({ edges }) => {
	let markers = [];
	edges.forEach(({ node }) => {
		markers = [...markers, ...companyFileToMapMarkers(node)];
	});
	return markers;
};

const companyFileToMapMarkers = (companyNode) => {
	const { frontmatter, fields } = companyNode;
	if (!frontmatter.positions) {
		/* no markers for this company */
		return [];
	}
	const markers = [];
	frontmatter.positions.forEach((position) => {
		const mapData = parsePosition(position);
		if (mapData) {
			markers.push({
				text: frontmatter.title,
				id: fields.id,
				...mapData,
			});
		}
	});
	return markers;
};

const companiesResultsToMapMarkers = (companies) => {
	return companiesAlgoliaResultsToMapMarkers(companies);
};

const companyToMapMarkers = (company) => {
	const { positions, title, id, total_jobs } = company;

	if (!positions || positions.length === 0) {
		/* no markers for this company */
		return [];
	}
	// For each map position, include the precomputed total_jobs count.
	const markers = positions.map((position) => {
		const mapData = parsePosition(position);
		if (mapData) {
			console.log("total_jobs", total_jobs);
			return {
				text: title,
				id: id,
				total_jobs,
				...mapData,
			};
		}
	});
	return markers.filter(Boolean);
};

const companiesToMapMarkers = (companies = []) => {
	return companies.reduce((acc, company) => {
		acc.push(...companyToMapMarkers(company));
		return acc;
	}, []);
};

export {
	companiesResultsToMapMarkers,
	companiesFileToMapMarkers,
	companiesSqliteResultsToMapMarkers,
	companiesAlgoliaResultsToMapMarkers,
	companyToMapMarkers,
	companiesToMapMarkers,
};
