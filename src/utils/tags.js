const getAllCompaniesTags = (companies) => {
	const allTags = []
	companies.forEach(({tags}) => {
		tags && tags.forEach(tag => {
			if (allTags.indexOf(tag) === -1) {
				allTags.push(tag)
			}
		})
	})
	return allTags
}

export {
	getAllCompaniesTags
}
