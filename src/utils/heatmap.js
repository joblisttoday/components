import {
	format,
	startOfDay,
	endOfDay,
	eachDayOfInterval,
	getYear,
	getDate,
} from "date-fns";

// Function to generate an array of dates between startDate and endDate
export const getDatesBetween = (startDate, endDate) => {
	const dates = eachDayOfInterval({ start: startDate, end: endDate });
	return dates.map((date) => format(date, "yyyy-LL-dd"));
};

// Function to serialize an item with date properties
const serializeItem = (item, date) => ({
	...item,
	date,
	year: getYear(date),
	dow: Number(format(date, "i")),
	woy: Number(format(date, "II")),
});

// Function to generate missing dates based on API results and specified number of days
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
