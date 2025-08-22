import { getJoblistStorage } from '../services/storage.js';

/**
 * Resume/Cover letter manager component for managing multiple cover letter variations.
 * Provides a comprehensive interface for creating, editing, saving, and deleting different
 * cover letter versions that can be synchronized across devices via remoteStorage.
 * 
 * @class JoblistResumeManager
 * @extends HTMLElement
 * @fires JoblistResumeManager#cover-letter-saved - Emitted when a cover letter is successfully saved
 * @fires JoblistResumeManager#cover-letter-deleted - Emitted when a cover letter is successfully deleted
 */
export default class JoblistResumeManager extends HTMLElement {
	/**
	 * Creates an instance of JoblistResumeManager.
	 * Initializes the component with default state values.
	 */
	constructor() {
		super();
		/** @type {JoblistStorage|null} The storage service instance */
		this.storage = null;
		/** @type {Object<string, string>} Collection of cover letters keyed by name */
		this.coverLetters = {};
		/** @type {string} Currently selected cover letter name */
		this.currentCoverLetter = 'default';
		/** @type {boolean} Whether the component is in editing mode */
		this.editing = false;
	}
	
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Initializes storage connection and loads existing cover letters.
	 * 
	 * @async
	 */
	async connectedCallback() {
		this.storage = getJoblistStorage();
		await this.storage.initialize();
		
		// Load existing cover letters
		await this.loadCoverLetters();
		
		// Listen for storage changes (less frequent to prevent loops)  
		this.storage.on('sync-done', () => {
			this.loadCoverLetters().then(() => {
				this.render();
			});
		});
		
		this.render();
	}
	
	/**
	 * Loads all cover letters from storage.
	 * If storage is not available, initializes with default empty cover letter.
	 * 
	 * @async
	 */
	async loadCoverLetters() {
		try {
			this.coverLetters = await this.storage.getCoverLetters();
			if (!this.coverLetters.default) {
				this.coverLetters.default = '';
			}
		} catch (e) {
			// Storage not connected
			this.coverLetters = { default: '' };
		}
	}
	
	/**
	 * Saves a cover letter to storage and updates local state.
	 * Emits a 'cover-letter-saved' event on successful save.
	 * 
	 * @async
	 * @param {string} name - The name/identifier for the cover letter
	 * @param {string} content - The cover letter content
	 */
	async saveCoverLetter(name, content) {
		try {
			await this.storage.setCoverLetter(name, content);
			this.coverLetters[name] = content;
			this.render();
			this._emit('cover-letter-saved', { name, content });
		} catch (e) {
			console.error('Error saving cover letter:', e);
		}
	}
	
	/**
	 * Deletes a cover letter from storage and local state.
	 * Cannot delete the 'default' cover letter. Emits a 'cover-letter-deleted' event on success.
	 * 
	 * @async
	 * @param {string} name - The name of the cover letter to delete
	 * @returns {void} Returns early if attempting to delete 'default'
	 */
	async deleteCoverLetter(name) {
		if (name === 'default') return; // Can't delete default
		
		try {
			await this.storage.deleteCoverLetter(name);
			delete this.coverLetters[name];
			if (this.currentCoverLetter === name) {
				this.currentCoverLetter = 'default';
			}
			this.render();
			this._emit('cover-letter-deleted', { name });
		} catch (e) {
			console.error('Error deleting cover letter:', e);
		}
	}
	
	/**
	 * Creates a new cover letter variation.
	 * Prompts the user for a name and creates an empty cover letter.
	 * Automatically switches to edit mode for the new cover letter.
	 */
	createNewCoverLetter() {
		const name = prompt('Enter name for new cover letter variation:');
		if (name && name.trim() && !this.coverLetters[name.trim()]) {
			const cleanName = name.trim().replace(/[^a-zA-Z0-9-_]/g, '');
			if (cleanName) {
				this.coverLetters[cleanName] = '';
				this.currentCoverLetter = cleanName;
				this.editing = true;
				this.render();
			}
		}
	}
	
	/**
	 * Handles selection of a different cover letter.
	 * Switches the current cover letter and exits edit mode.
	 * 
	 * @param {string} name - The name of the cover letter to select
	 */
	handleCoverLetterSelect(name) {
		this.currentCoverLetter = name;
		this.editing = false;
		this.render();
	}
	
	/**
	 * Enters edit mode for the current cover letter.
	 * Focuses the textarea after rendering.
	 */
	handleEdit() {
		this.editing = true;
		this.render();
		// Focus on textarea after render
		setTimeout(() => {
			const textarea = this.querySelector('.cover-letter-textarea');
			if (textarea) textarea.focus();
		}, 0);
	}
	
	/**
	 * Saves the current cover letter content and exits edit mode.
	 * Gets content from the textarea element.
	 */
	handleSave() {
		const textarea = this.querySelector('.cover-letter-textarea');
		if (textarea) {
			this.saveCoverLetter(this.currentCoverLetter, textarea.value);
			this.editing = false;
		}
	}
	
	/**
	 * Cancels editing and reverts to display mode without saving changes.
	 */
	handleCancel() {
		this.editing = false;
		this.render();
	}
	
	/**
	 * Renders the component UI based on current state.
	 * Shows different interfaces for connected/disconnected storage and edit/display modes.
	 */
	render() {
		if (!this.storage.isConnected()) {
			this.innerHTML = `
				<div class="cover-letter-disconnected">
					<p>Connect storage to manage cover letters</p>
					<joblist-storage-widget></joblist-storage-widget>
				</div>
			`;
			return;
		}
		
		const coverLetterNames = Object.keys(this.coverLetters);
		const currentContent = this.coverLetters[this.currentCoverLetter] || '';
		
		this.innerHTML = `
			<div class="cover-letter-manager">
				<div class="cover-letter-header">
					<div class="cover-letter-selector">
						<label for="cover-letter-select">Cover Letter:</label>
						<select id="cover-letter-select" class="cover-letter-select">
							${coverLetterNames.map(name => 
								`<option value="${name}" ${name === this.currentCoverLetter ? 'selected' : ''}>${name}</option>`
							).join('')}
						</select>
						<button type="button" class="new-cover-letter-btn">+ New</button>
					</div>
					<div class="cover-letter-actions">
						${this.editing ? `
							<button type="button" class="save-btn">Save</button>
							<button type="button" class="cancel-btn">Cancel</button>
						` : `
							<button type="button" class="edit-btn">Edit</button>
							${this.currentCoverLetter !== 'default' ? `
								<button type="button" class="delete-btn">Delete</button>
							` : ''}
						`}
					</div>
				</div>
				
				<div class="cover-letter-content">
					${this.editing ? `
						<textarea 
							class="cover-letter-textarea" 
							placeholder="Enter your cover letter content..."
							rows="20"
						>${currentContent}</textarea>
					` : `
						<div class="cover-letter-display">
							${currentContent ? `
								<pre class="cover-letter-text">${currentContent}</pre>
							` : `
								<div class="cover-letter-empty">
									<p>No content yet. Click "Edit" to add your cover letter.</p>
								</div>
							`}
						</div>
					`}
				</div>
				
				<div class="cover-letter-footer">
					<small class="cover-letter-help">
						Create different cover letter versions for different job types (e.g., frontend, backend, fullstack)
					</small>
				</div>
			</div>
		`;
		
		// Add event listeners
		this.querySelector('.cover-letter-select').addEventListener('change', (e) => {
			this.handleCoverLetterSelect(e.target.value);
		});
		
		this.querySelector('.new-cover-letter-btn').addEventListener('click', () => {
			this.createNewCoverLetter();
		});
		
		if (this.editing) {
			this.querySelector('.save-btn').addEventListener('click', () => {
				this.handleSave();
			});
			
			this.querySelector('.cancel-btn').addEventListener('click', () => {
				this.handleCancel();
			});
		} else {
			this.querySelector('.edit-btn').addEventListener('click', () => {
				this.handleEdit();
			});
			
			const deleteBtn = this.querySelector('.delete-btn');
			if (deleteBtn) {
				deleteBtn.addEventListener('click', () => {
					if (confirm(`Delete cover letter "${this.currentCoverLetter}"?`)) {
						this.deleteCoverLetter(this.currentCoverLetter);
					}
				});
			}
		}
		
	}
	
	/**
	 * Emits a custom event with the provided data.
	 * 
	 * @private
	 * @param {string} event - The event name to emit
	 * @param {Object} data - The data to include in the event detail
	 */
	_emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			detail: data,
			bubbles: true
		}));
	}
}