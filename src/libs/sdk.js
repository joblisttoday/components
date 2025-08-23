/**
 * Core SDK constants and utilities for Matrix integration
 * @module sdk
 */

export const MATRIX_TYPE_JOB = "today.joblist.job";
export const MATRIX_ROOM_FILTER_JOB = {
	types: [MATRIX_TYPE_JOB],
};
export const MATRIX_ROOM_MAP = {
	general: "#general.boards.joblist.today:matrix.org",
};
