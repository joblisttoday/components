/**
 * @fileoverview SQLite result processing utilities
 */

/**
 * @typedef {Object} SqliteResult
 * @property {string[]} columns - Column names
 * @property {any[][]} values - Row values
 */

/**
 * Convert SQLite result format to JSON objects
 * @param {SqliteResult[]} [sqliteRes=[]] - SQLite query result
 * @returns {Object[]|undefined} Array of objects with column names as keys
 */
export const sqliteToJson = (sqliteRes = []) => {
	const data = sqliteRes[0];
	const { columns, values } = data || {};
	return values?.map((sqliteRow) => {
		return sqliteRow.reduce((acc, value, index) => {
			const key = columns[index];
			let serializedVal;
			try {
				acc[key] = JSON.parse(value);
			} catch (e) {
				acc[key] = value;
			}
			return acc;
		}, {});
	});
};
