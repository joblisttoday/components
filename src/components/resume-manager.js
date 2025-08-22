import { getJoblistStorage } from '../services/storage.js';

/**
 * Cover letter manager component
 * Manage multiple cover letter variations
 */
export default class JoblistResumeManager extends HTMLElement {
	constructor() {
		super();
		this.storage = null;
		this.coverLetters = {};
		this.currentCoverLetter = 'default';
		this.editing = false;
	}
	
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
	
	handleCoverLetterSelect(name) {
		this.currentCoverLetter = name;
		this.editing = false;
		this.render();
	}
	
	handleEdit() {
		this.editing = true;
		this.render();
		// Focus on textarea after render
		setTimeout(() => {
			const textarea = this.querySelector('.cover-letter-textarea');
			if (textarea) textarea.focus();
		}, 0);
	}
	
	handleSave() {
		const textarea = this.querySelector('.cover-letter-textarea');
		if (textarea) {
			this.saveCoverLetter(this.currentCoverLetter, textarea.value);
			this.editing = false;
		}
	}
	
	handleCancel() {
		this.editing = false;
		this.render();
	}
	
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
	
	_emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			detail: data,
			bubbles: true
		}));
	}
}