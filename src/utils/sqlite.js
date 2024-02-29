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
