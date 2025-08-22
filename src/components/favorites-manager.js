import { getJoblistStorage } from '../services/storage.js';

/**
 * Custom web component for managing and displaying favorite companies and jobs
 * @class JoblistFavoritesManager
 * @extends HTMLElement
 */
export default class JoblistFavoritesManager extends HTMLElement {
	/**
	 * Constructor to initialize component state
	 */
	constructor() {
		super();
		/** @type {Object|null} Storage service instance */
		this.storage = null;
		/** @type {Array} Array of favorite company IDs */
		this.favoriteCompanies = [];
		/** @type {Array} Array of favorite job IDs */
		this.favoriteJobs = [];
		/** @type {string} Display type - 'companies', 'jobs', or 'both' */
		this.type = 'both';
	}
	
	/**
	 * Gets the view type from attribute
	 * @returns {string} The view type (companies, jobs, or both)
	 */
	get viewType() {
		return this.getAttribute('type') || 'both';
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
		this.storage = getJoblistStorage();
		await this.storage.initialize();
		
		// Listen for storage changes (less frequent)
		this.storage.on('sync-done', () => {
			this.loadFavorites().then(() => {
				this.render();
			});
		});
		
		this.type = this.viewType;
		await this.loadFavorites();
		this.render();
	}
	
	/**
	 * Loads favorites from storage
	 */
	async loadFavorites() {
		// Prevent loading if already in progress
		if (this.loadingFavorites) return;
		this.loadingFavorites = true;
		
		try {
			if (this.type === 'companies' || this.type === 'both') {
				this.favoriteCompanies = await this.storage.getFavoriteCompanies();
			}
			if (this.type === 'jobs' || this.type === 'both') {
				this.favoriteJobs = await this.storage.getFavoriteJobs();
			}
		} catch (e) {
			console.log('Could not load favorites:', e.message);
		} finally {
			this.loadingFavorites = false;
		}
	}
	
	/**
	 * Adds an item to favorites
	 * @param {string} id - Item ID
	 * @param {string} type - Item type (company or job)
	 */
	async addToFavorites(id, type) {
		try {
			if (type === 'company') {
				await this.storage.addFavoriteCompany(id);
				this.favoriteCompanies.push(id);
			} else if (type === 'job') {
				await this.storage.addFavoriteJob(id);
				this.favoriteJobs.push(id);
			}
			this.render();
			this._emit('favorite-added', { id, type });
		} catch (e) {
			console.error('Error adding to favorites:', e);
		}
	}
	
	/**
	 * Removes an item from favorites
	 * @param {string} id - Item ID
	 * @param {string} type - Item type (company or job)
	 */
	async removeFromFavorites(id, type) {
		try {
			if (type === 'company') {
				await this.storage.removeFavoriteCompany(id);
				this.favoriteCompanies = this.favoriteCompanies.filter(fid => fid !== id);
			} else if (type === 'job') {
				await this.storage.removeFavoriteJob(id);
				this.favoriteJobs = this.favoriteJobs.filter(fid => fid !== id);
			}
			this.render();
			this._emit('favorite-removed', { id, type });
		} catch (e) {
			console.error('Error removing from favorites:', e);
		}
	}
	
	/**
	 * Checks if an item is favorited
	 * @param {string} id - Item ID
	 * @param {string} type - Item type (company or job)
	 * @returns {boolean} True if item is favorited
	 */
	isFavorite(id, type) {
		if (type === 'company') {
			return this.favoriteCompanies.includes(id);
		} else if (type === 'job') {
			return this.favoriteJobs.includes(id);
		}
		return false;
	}
	
	/**
	 * Renders the favorites manager interface
	 */
	render() {
		const showCompanies = this.type === 'companies' || this.type === 'both';
		const showJobs = this.type === 'jobs' || this.type === 'both';
		
		let html = '<joblist-favorites-manager>';
		
		if (!this.storage.isConnected()) {
			html += `
				<div>
					<p>Connect storage to save favorites</p>
					<joblist-storage-widget></joblist-storage-widget>
				</div>
			`;
		} else {
			if (showCompanies && this.favoriteCompanies.length > 0) {
				html += `
					<section>
						<h3>Favorite Companies (${this.favoriteCompanies.length})</h3>
						<ul>
							${this.favoriteCompanies.map(id => `
								<li data-id="${id}" data-type="company">
									<a href="https://joblist.today/${id}">${id}</a>
									<button type="button" title="Remove from favorites">×</button>
								</li>
							`).join('')}
						</ul>
					</section>
				`;
			}
			
			if (showJobs && this.favoriteJobs.length > 0) {
				html += `
					<section>
						<h3>Favorite Jobs (${this.favoriteJobs.length})</h3>
						<ul>
							${this.favoriteJobs.map(id => `
								<li data-id="${id}" data-type="job">
									<span>${id}</span>
									<button type="button" title="Remove from favorites">×</button>
								</li>
							`).join('')}
						</ul>
					</section>
				`;
			}
			
			if (this.favoriteCompanies.length === 0 && this.favoriteJobs.length === 0) {
				html += `
					<div>
						<p>No favorites yet. Add some by clicking ⭐ on companies or jobs!</p>
					</div>
				`;
			}
		}
		
		html += '</joblist-favorites-manager>';
		this.innerHTML = html;
		
		// Add event listeners
		this.querySelectorAll('button').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const item = e.target.closest('li');
				const id = item.dataset.id;
				const type = item.dataset.type;
				this.removeFromFavorites(id, type);
			});
		});
		
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