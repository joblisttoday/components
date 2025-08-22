import { html } from 'lit';

export default {
  title: 'Components/Storage',
  parameters: {
    docs: {
      description: {
        component: 'Components for managing user data including favorites, notes, and cover letters with remoteStorage integration.',
      },
    },
  },
};

// Storage Widget
export const StorageWidget = () => html`
  <joblist-storage-widget></joblist-storage-widget>
`;
StorageWidget.parameters = {
  docs: {
    description: {
      story: 'Connection widget for remoteStorage providers. Shows connection status and allows users to connect/disconnect.',
    },
  },
};

// Favorites Manager
export const FavoritesManager = () => html`
  <joblist-favorites-manager type="both"></joblist-favorites-manager>
`;
FavoritesManager.parameters = {
  docs: {
    description: {
      story: 'Manage favorite companies and jobs. Supports filtering by type.',
    },
  },
};

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
    <joblist-favorite-button item-id="stripe" item-type="company"></joblist-favorite-button>
  </div>
  <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
    <span>Job:</span>
    <joblist-favorite-button item-id="job-123" item-type="job"></joblist-favorite-button>
  </div>
`;
FavoriteButton.parameters = {
  docs: {
    description: {
      story: 'Star button for adding/removing items from favorites.',
    },
  },
};

// Notes Editor
export const NotesEditor = () => html`
  <div style="max-width: 500px;">
    <h3>Company Notes</h3>
    <joblist-notes-editor item-id="stripe" item-type="company"></joblist-notes-editor>
    
    <h3>Job Notes</h3>
    <joblist-notes-editor item-id="job-123" item-type="job"></joblist-notes-editor>
  </div>
`;
NotesEditor.parameters = {
  docs: {
    description: {
      story: 'Rich text editor for adding notes to companies and jobs.',
    },
  },
};

// Resume/Cover Letter Manager
export const CoverLetterManager = () => html`
  <joblist-resume-manager></joblist-resume-manager>
`;
CoverLetterManager.parameters = {
  docs: {
    description: {
      story: 'Manage multiple cover letter variations for different job applications.',
    },
  },
};