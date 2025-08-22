import { getJoblistStorage } from '../services/storage.js';

/**
 * Custom web component for editing and saving notes about companies or jobs
 * @class JoblistNotesEditor
 * @extends HTMLElement
 */
export default class JoblistNotesEditor extends HTMLElement {
	/**
	 * Constructor to initialize component state
	 */
	constructor() {
		super();
		/** @type {Object|null} Storage service instance */
		this.storage = null;
		/** @type {string} Current note content */
		this.noteContent = '';
		/** @type {boolean} Whether currently saving */
		this.saving = false;
		/** @type {number|null} Timeout ID for auto-save */
		this.saveTimeout = null;
	}
	
	/**
	 * Gets the item ID to save notes for
	 * @returns {string} Item ID
	 */
	get itemId() {
		return this.getAttribute('item-id');
	}
	
	/**
	 * Gets the item type (company or job)
	 * @returns {string} Item type
	 */
	get itemType() {
		return this.getAttribute('item-type'); // 'company' or 'job'
	}
	
	/**
	 * Gets the placeholder text for the textarea
	 * @returns {string} Placeholder text
	 */
	get placeholder() {
		const type = this.itemType === 'company' ? 'company' : 'job application';
		return this.getAttribute('placeholder') || `Write notes about this ${type}...`;
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
		if (!this.itemId || !this.itemType) {
			console.warn('NotesEditor requires item-id and item-type attributes');
			return;
		}
		
		this.storage = getJoblistStorage();
		await this.storage.initialize();
		
		// Load existing note only once
		await this.loadNote();
		
		// Only listen for sync events, not data changes (to prevent loops)
		this.storage.on('sync-done', () => {
			// Only reload if we haven't loaded before or if user isn't actively typing
			if (!this.saveTimeout) {
				this.loadNote();
			}
		});
		
		this.render();
	}
	
	/**
	 * Loads existing note from storage
	 */
	async loadNote() {
		// Prevent loading if already in progress
		if (this.loadingNote) return;
		this.loadingNote = true;
		
		try {
			if (this.itemType === 'company') {
				this.noteContent = await this.storage.getCompanyNote(this.itemId);
			} else if (this.itemType === 'job') {
				this.noteContent = await this.storage.getJobNote(this.itemId);
			}
		} catch (e) {
			// Storage not connected or other error
			this.noteContent = '';
		} finally {
			this.loadingNote = false;
		}
	}
	
	/**
	 * Saves note content to storage
	 * @param {string} content - Note content to save
	 */
	async saveNote(content) {
		if (this.saving) return;
		
		this.saving = true;
		this.updateSaveStatus('Saving...');
		
		try {
			if (this.itemType === 'company') {
				await this.storage.setCompanyNote(this.itemId, content);
			} else if (this.itemType === 'job') {
				await this.storage.setJobNote(this.itemId, content);
			}
			
			this.noteContent = content;
			this.updateSaveStatus('Saved');
			this._emit('note-saved', { id: this.itemId, type: this.itemType, content });
			
			// Clear save status after 2 seconds
			setTimeout(() => {
				this.updateSaveStatus('');
			}, 2000);
			
		} catch (e) {
			console.error('Error saving note:', e);
			this.updateSaveStatus('Save failed');
		} finally {
			this.saving = false;
		}
	}
	
	/**
	 * Handles textarea input events with auto-save
	 * @param {Event} e - Input event
	 */
	handleInput(e) {
		const content = e.target.value;
		
		// Clear existing timeout
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		
		// Show "typing" status
		this.updateSaveStatus('Typing...');
		
		// Auto-save after 1 second of no typing
		this.saveTimeout = setTimeout(() => {
			if (this.storage.isConnected()) {
				this.saveNote(content);
			}
		}, 1000);
	}
	
	/**
	 * Updates the save status display
	 * @param {string} status - Status text to display
	 */
	updateSaveStatus(status) {
		const statusElement = this.querySelector('.save-status');
		if (statusElement) {
			statusElement.textContent = status;
			statusElement.className = `save-status ${status.toLowerCase().replace(/[^a-z]/g, '')}`;
		}
	}
	
	/**
	 * Renders the notes editor interface
	 */
	render() {
		// Don't re-render if already rendered and content hasn't changed
		if (this.lastRenderedContent === this.noteContent && this.querySelector('.notes-editor')) {
			return;
		}
		
		this.lastRenderedContent = this.noteContent;
		
		if (!this.storage.isConnected()) {
			this.innerHTML = `
				<div class="notes-disconnected">
					<p>Connect storage to save notes</p>
					<joblist-storage-widget></joblist-storage-widget>
				</div>
			`;
			return;
		}
		
		this.innerHTML = `
			<div class="notes-editor">
				<div class="notes-header">
					<label class="notes-label">
						Notes ${this.itemType === 'company' ? 'about company' : 'for job application'}
					</label>
					<span class="save-status"></span>
				</div>
				<textarea 
					class="notes-textarea" 
					placeholder="${this.placeholder}"
					rows="6"
				>${this.noteContent}</textarea>
				<div class="notes-footer">
					<small class="notes-help">
						Notes are automatically saved as you type and synced across devices
					</small>
				</div>
			</div>
		`;
		
		// Add event listener
		const textarea = this.querySelector('.notes-textarea');
		textarea.addEventListener('input', this.handleInput.bind(this));
		
	}
	
	/**
	 * Emits custom events
	 * @param {string} event - Event name
	 * @param {Object} data - Event data
	 */
	_emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			detail: data,
			bubbles: true
		}));
	}
}