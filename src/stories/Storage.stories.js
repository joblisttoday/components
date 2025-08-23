import { html } from "lit-html";

export default {
	title: "RemoteStorage/Storage",
	parameters: { layout: "padded" },
};

// Storage Widget
export const StorageWidget = () => html`
	<joblist-storage-widget></joblist-storage-widget>
`;


// Favorites Manager
export const FavoritesManager = () => html`
	<joblist-favorites-manager type="both"></joblist-favorites-manager>
`;


export const FavoritesCompaniesOnly = () => html`
	<joblist-favorites-manager type="companies"></joblist-favorites-manager>
`;

export const FavoritesJobsOnly = () => html`
	<joblist-favorites-manager type="jobs"></joblist-favorites-manager>
`;

// Favorite Button
export const FavoriteButton = () => html`
	<div style="display: flex; gap: 1rem; align-items: center;">
		<span>Company:</span>
		<joblist-favorite-button
			item-id="stripe"
			item-type="company"
		></joblist-favorite-button>
	</div>
	<div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
		<span>Job:</span>
		<joblist-favorite-button
			item-id="job-123"
			item-type="job"
		></joblist-favorite-button>
	</div>
`;


// Notes Editor
export const NotesEditor = () => html`
	<div style="max-width: 500px;">
		<h3>Company Notes</h3>
		<joblist-notes-editor
			item-id="stripe"
			item-type="company"
		></joblist-notes-editor>

		<h3>Job Notes</h3>
		<joblist-notes-editor
			item-id="job-123"
			item-type="job"
		></joblist-notes-editor>
	</div>
`;


// Resume/Cover Letter Manager
export const CoverLetterManager = () => html`
	<joblist-resume-manager></joblist-resume-manager>
`;
