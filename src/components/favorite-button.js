import { getJoblistStorage } from '../services/storage.js';

/**
 * Favorite button component
 * Add/remove items from favorites with a star button
 */
export default class JoblistFavoriteButton extends HTMLElement {
	constructor() {
		super();
		this.storage = null;
		this.isFavorited = false;
	}
	
	get itemId() {
		return this.getAttribute('item-id');
	}
	
	get itemType() {
		return this.getAttribute('item-type'); // 'company' or 'job'
	}
	
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
	
	render() {
		this.innerHTML = `
			<button type="button" class="favorite-btn" title="${this.isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
				<span class="favorite-icon">${this.isFavorited ? '⭐' : '☆'}</span>
				<span class="favorite-text">${this.isFavorited ? 'Favorited' : 'Favorite'}</span>
			</button>
		`;
		
	}
	
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
	
	_emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			detail: data,
			bubbles: true
		}));
	}
}