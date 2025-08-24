/**
 * @fileoverview Utilities for working with company tags
 */

/**
 * @typedef {Object} Company
 * @property {string[]} [tags] - Array of company tags
 */

/**
 * Extract all unique tags from a list of companies
 * @param {Company[]} companies - Array of company objects
 * @returns {string[]} Array of unique tags
 */
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
