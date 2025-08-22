import { getJoblistStorage } from '../services/storage.js';

/**
 * Custom web component for favoriting/unfavoriting companies and jobs
 * @class JoblistFavoriteButton
 * @extends HTMLElement
 */
export default class JoblistFavoriteButton extends HTMLElement {
	/**
	 * Constructor to initialize component state
	 */
	constructor() {
		super();
		/** @type {Object|null} Storage service instance */
		this.storage = null;
		/** @type {boolean} Current favorite status */
		this.isFavorited = false;
	}
	
	/**
	 * Gets the item ID to favorite
	 * @returns {string} The item ID
	 */
	get itemId() {
		return this.getAttribute('item-id');
	}
	
	/**
	 * Gets the item type (company or job)
	 * @returns {string} The item type
	 */
	get itemType() {
		return this.getAttribute('item-type'); // 'company' or 'job'
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
		if (!this.itemId || !this.itemType) {
			console.warn('FavoriteButton requires item-id and item-type attributes');
			return;
		}
		
		this.storage = getJoblistStorage();
		await this.storage.initialize();
		
		// Check if item is already favorited
		await this.checkFavoriteStatus();
		
		// Listen for storage changes (less frequent to prevent loops)
		this.storage.on('sync-done', () => {
			this.checkFavoriteStatus();
		});
		
		this.render();
		this.addEventListener('click', this.handleClick.bind(this));
	}
	
	/**
	 * Checks if the current item is favorited
	 */
	async checkFavoriteStatus() {
		// Prevent multiple simultaneous checks
		if (this.checkingStatus) return;
		this.checkingStatus = true;
		
		try {
			if (this.itemType === 'company') {
				const favorites = await this.storage.getFavoriteCompanies();
				this.isFavorited = favorites.includes(this.itemId);
			} else if (this.itemType === 'job') {
				const favorites = await this.storage.getFavoriteJobs();
				this.isFavorited = favorites.includes(this.itemId);
			}
		} catch (e) {
			// Storage not connected, assume not favorited
			this.isFavorited = false;
		} finally {
			this.checkingStatus = false;
		}
		
		if (this.querySelector('.favorite-btn')) {
			this.updateButton();
		}
	}
	
	/**
	 * Handles click events to toggle favorite status
	 * @param {Event} e - Click event
	 */
	async handleClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		if (!this.storage.isConnected()) {
			this._emit('storage-required');
			return;
		}
		
		try {
			if (this.isFavorited) {
				if (this.itemType === 'company') {
					await this.storage.removeFavoriteCompany(this.itemId);
				} else if (this.itemType === 'job') {
					await this.storage.removeFavoriteJob(this.itemId);
				}
				this.isFavorited = false;
				this._emit('favorite-removed', { id: this.itemId, type: this.itemType });
			} else {
				if (this.itemType === 'company') {
					await this.storage.addFavoriteCompany(this.itemId);
				} else if (this.itemType === 'job') {
					await this.storage.addFavoriteJob(this.itemId);
				}
				this.isFavorited = true;
				this._emit('favorite-added', { id: this.itemId, type: this.itemType });
			}
			
			this.updateButton();
		} catch (e) {
			console.error('Error toggling favorite:', e);
		}
	}
	
	/**
	 * Renders the favorite button
	 */
	render() {
		this.innerHTML = `
			<button type="button" class="favorite-btn" title="${this.isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
				<span class="favorite-icon">${this.isFavorited ? '⭐' : '☆'}</span>
				<span class="favorite-text">${this.isFavorited ? 'Favorited' : 'Favorite'}</span>
			</button>
		`;
		
	}
	
	/**
	 * Updates button appearance based on favorite status
	 */
	updateButton() {
		const btn = this.querySelector('.favorite-btn');
		const icon = this.querySelector('.favorite-icon');
		const text = this.querySelector('.favorite-text');
		
		if (btn && icon && text) {
			btn.title = this.isFavorited ? 'Remove from favorites' : 'Add to favorites';
			btn.classList.toggle('favorited', this.isFavorited);
			icon.textContent = this.isFavorited ? '⭐' : '☆';
			text.textContent = this.isFavorited ? 'Favorited' : 'Favorite';
		}
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