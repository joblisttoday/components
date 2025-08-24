/**
 * @fileoverview Date utilities for heatmap data processing
 */

import {
	format,
	startOfDay,
	endOfDay,
	eachDayOfInterval,
	getYear,
	getDate,
} from "date-fns";

/**
 * @typedef {Object} HeatmapItem
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {number} total - Total count for this date
 * @property {number} year - Year
 * @property {number} dow - Day of week (1-7)
 * @property {number} woy - Week of year
 */

/**
 * Generate an array of dates between startDate and endDate
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string[]} Array of date strings in YYYY-MM-DD format
 */
export const getDatesBetween = (startDate, endDate) => {
	const dates = eachDayOfInterval({ start: startDate, end: endDate });
	return dates.map((date) => format(date, "yyyy-LL-dd"));
};

// Function to serialize an item with date properties
const serializeItem = (item, dateObj) => ({
	...item,
	year: getYear(dateObj),
	dow: Number(format(dateObj, "i")),
	woy: Number(format(dateObj, "II")),
});

/**
 * Generate missing dates based on API results and specified number of days
 * @param {HeatmapItem[]} apiResults - Existing API results with dates
 * @param {number} numberOfDays - Number of days to go back from current date
 * @returns {Promise<HeatmapItem[]>} Complete array of dates with totals
 */
export const generateMissingDates = async (apiResults, numberOfDays) => {
	const currentDate = new Date();
	const startDate = startOfDay(currentDate);
	startDate.setDate(startDate.getDate() - numberOfDays);

	const endDate = endOfDay(currentDate);

	const allDates = getDatesBetween(startDate, endDate);

	const result = allDates.map((date) => {
		const existingItem = apiResults.find((item) => item.date === date);
		const emptyDate = { date, total: 0 };
		return serializeItem(existingItem || emptyDate, new Date(date));
	});

	return result;
};
