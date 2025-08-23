// NOTE: Avoid static import to prevent bare-specifier resolution errors
// when this file is loaded directly in the browser (without a bundler).
// We lazily load RemoteStorage in initialize() with fallbacks.

/**
 * JoblistStorage - Clean remoteStorage integration for joblist.today
 * Manages favorites, notes, and resumes as simple text files
 */
export class JoblistStorage {
	constructor() {
		this.rs = null;
		this.client = null;
		this.connected = false;
		this.eventHandlers = new Map();
		
		// Simple cache to prevent repeated API calls
		this.cache = new Map();
		this.cacheTimeout = 5000; // 5 seconds
		
		// Module definition for remoteStorage v1.x
		this.module = null;
	}
	
	/**
	 * Initialize remoteStorage connection
	 */
	async initialize() {
		if (this.rs) return this.rs;

		// Try to dynamically import remotestoragejs.
		// 1) First attempt local dependency (works with bundlers like Vite)
		// 2) Fallback to global window.RemoteStorage if already present
		// 3) Fallback to CDN ESM build so direct browser usage works
		let RemoteStorageCtor = null;
		try {
			const mod = await import('remotestoragejs');
			RemoteStorageCtor = mod && (mod.default || mod.RemoteStorage || mod);
		} catch (_) {
			// no-op
		}
		if (!RemoteStorageCtor && typeof window !== 'undefined' && window.RemoteStorage) {
			RemoteStorageCtor = window.RemoteStorage;
		}
		if (!RemoteStorageCtor && typeof window !== 'undefined') {
			try {
				const mod = await import(
					'https://unpkg.com/remotestoragejs@1.2.3/dist/remotestoragejs.esm.js'
				);
				RemoteStorageCtor = mod && (mod.default || mod.RemoteStorage || mod);
			} catch (e) {
				console.warn('remoteStorage could not be loaded; using local-only mode', e);
			}
		}

		// If still unavailable, operate in local-only mode with a minimal shim
		if (!RemoteStorageCtor) {
			this.rs = {
				caching: { enable: () => {} },
				on: () => {},
				off: () => {},
				access: { claim: () => {} },
				scope: () => this._createLocalClient(),
				remote: { connected: false, userAddress: null },
				connect: async () => {},
				disconnect: async () => {},
				backend: 'local',
			};
		} else {
			this.rs = new RemoteStorageCtor({
			logging: false,
			cache: true
			});
		}
		
		// Define our joblist module for v1.x
		this.rs.access.claim('joblist', 'rw');
		this.client = this.rs.scope('/joblist/');
		
		// Enable local storage by default (works offline)
		this.rs.caching.enable('/joblist/');
		this.connected = true; // Consider local storage as "connected"
		
		// Set up event listeners
		this.rs.on && this.rs.on('connected', () => {
			this.connected = true;
			this._emit('connected');
		});
		
		this.rs.on && this.rs.on('disconnected', () => {
			this.connected = false;
			this._emit('disconnected');
		});
		
		this.rs.on && this.rs.on('sync-done', () => {
			this._emit('sync-done');
		});
		
		// Listen for changes to our data
		this.client.on && this.client.on('change', (event) => {
			console.log('Storage change detected:', event.path);
			this._emit('data-changed', event);
		});
		
		this.rs.on && this.rs.on('error', (error) => {
			this._emit('error', error);
		});
		
		return this.rs;
	}
	
	/**
	 * Connect to remoteStorage provider
	 */
	async connect(userAddress) {
		if (!this.rs) await this.initialize();
		if (this.rs.connect) {
			await this.rs.connect(userAddress);
			return;
		}
		// local-only shim: mark as connected locally
		this.connected = true;
		this._emit('connected');
	}
	
	/**
	 * Disconnect from remoteStorage
	 */
	async disconnect() {
		if (this.rs) {
			if (this.rs.disconnect) await this.rs.disconnect();
			// Reset to local storage only
			this.connected = true; // Still connected to local storage
			this._emit('disconnected');
		}
	}
	
	/**
	 * Get connection status
	 */
	isConnected() {
		return this.connected;
	}
	
	/**
	 * Get the remoteStorage widget for UI
	 */
	getWidget() {
		if (!this.rs || !this.rs.caching) return null;
		this.rs.caching.enable('/joblist/');
		return null;
	}
	
	/**
	 * Event handling
	 */
	on(event, handler) {
		if (!this.eventHandlers.has(event)) {
			this.eventHandlers.set(event, []);
		}
		this.eventHandlers.get(event).push(handler);
	}
	
	off(event, handler) {
		if (this.eventHandlers.has(event)) {
			const handlers = this.eventHandlers.get(event);
			const index = handlers.indexOf(handler);
			if (index > -1) {
				handlers.splice(index, 1);
			}
		}
	}
	
	_emit(event, data) {
		if (this.eventHandlers.has(event)) {
			this.eventHandlers.get(event).forEach(handler => {
				try {
					handler(data);
				} catch (e) {
					console.error('Error in storage event handler:', e);
				}
			});
		}
	}
	
	/**
	 * Cache helper methods
	 */
	_getCacheKey(path) {
		return `file:${path}`;
	}
	
	_isCached(path) {
		const key = this._getCacheKey(path);
		const cached = this.cache.get(key);
		if (!cached) return false;
		return (Date.now() - cached.timestamp) < this.cacheTimeout;
	}
	
	_getFromCache(path) {
		const key = this._getCacheKey(path);
		const cached = this.cache.get(key);
		return cached ? cached.data : null;
	}
	
	_setCache(path, data) {
		const key = this._getCacheKey(path);
		this.cache.set(key, { data, timestamp: Date.now() });
	}
	
	_clearCache(path) {
		const key = this._getCacheKey(path);
		this.cache.delete(key);
	}

	// Minimal local client shim backed by localStorage for non-bundled environments
	_createLocalClient() {
		const prefix = 'joblist/';
		const toKey = (path) => `${prefix}${path}`;
		return {
			async getFile(path) {
				const v = localStorage.getItem(toKey(path));
				return v ?? '';
			},
			async storeFile(_mime, path, content) {
				localStorage.setItem(toKey(path), String(content ?? ''));
			},
			async getListing(pathPrefix) {
				const keys = Object.keys(localStorage).filter(k => k.startsWith(toKey(pathPrefix)));
				const res = {};
				for (const k of keys) {
					res[k.substring(prefix.length)] = true;
				}
				return res;
			},
			async remove(path) {
				localStorage.removeItem(toKey(path));
			},
			on() {},
			off() {},
		};
	}

	/**
	 * Favorites management
	 */
	async getFavoriteCompanies() {
		const path = 'favorites/companies.txt';
		
		// Return cached version if available
		if (this._isCached(path)) {
			const cached = this._getFromCache(path);
			// Handle case where cached data might be an array already
			if (Array.isArray(cached)) {
				return cached;
			}
			return cached && typeof cached === 'string' ? cached.trim().split('\n').filter(Boolean) : [];
		}
		
		try {
			const result = await this.client.getFile(path);
			const content = result && result.data ? result.data : result;
			const textContent = content || '';
			const favorites = textContent ? textContent.trim().split('\n').filter(Boolean) : [];
			
			// Cache the parsed result (as array, not string)
			this._setCache(path, favorites);
			
			return favorites;
		} catch (e) {
			// Cache empty array to prevent repeated requests
			this._setCache(path, []);
			return [];
		}
	}
	
	async getFavoriteJobs() {
		const path = 'favorites/jobs.txt';
		
		// Return cached version if available
		if (this._isCached(path)) {
			const cached = this._getFromCache(path);
			// Handle case where cached data might be an array already
			if (Array.isArray(cached)) {
				return cached;
			}
			return cached && typeof cached === 'string' ? cached.trim().split('\n').filter(Boolean) : [];
		}
		
		try {
			const result = await this.client.getFile(path);
			const content = result && result.data ? result.data : result;
			const textContent = content || '';
			const favorites = textContent ? textContent.trim().split('\n').filter(Boolean) : [];
			
			// Cache the parsed result (as array, not string)
			this._setCache(path, favorites);
			
			return favorites;
		} catch (e) {
			// Cache empty array to prevent repeated requests
			this._setCache(path, []);
			return [];
		}
	}
	
	async addFavoriteCompany(companyId) {
		const favorites = await this.getFavoriteCompanies();
		if (!favorites.includes(companyId)) {
			favorites.push(companyId);
			const path = 'favorites/companies.txt';
			await this.client.storeFile('text/plain', path, favorites.join('\n'));
			// Clear cache so next read gets fresh data
			this._clearCache(path);
		}
		return true;
	}
	
	async removeFavoriteCompany(companyId) {
		const favorites = await this.getFavoriteCompanies();
		const updated = favorites.filter(id => id !== companyId);
		const path = 'favorites/companies.txt';
		await this.client.storeFile('text/plain', path, updated.join('\n'));
		// Clear cache so next read gets fresh data
		this._clearCache(path);
		return true;
	}
	
	async addFavoriteJob(jobId) {
		const favorites = await this.getFavoriteJobs();
		if (!favorites.includes(jobId)) {
			favorites.push(jobId);
			const path = 'favorites/jobs.txt';
			await this.client.storeFile('text/plain', path, favorites.join('\n'));
			// Clear cache so next read gets fresh data
			this._clearCache(path);
		}
		return true;
	}
	
	async removeFavoriteJob(jobId) {
		const favorites = await this.getFavoriteJobs();
		const updated = favorites.filter(id => id !== jobId);
		const path = 'favorites/jobs.txt';
		await this.client.storeFile('text/plain', path, updated.join('\n'));
		// Clear cache so next read gets fresh data
		this._clearCache(path);
		return true;
	}
	
	/**
	 * Notes management
	 */
	async getCompanyNote(companyId) {
		const path = `notes/companies/${companyId}.txt`;
		
		// Return cached version if available
		if (this._isCached(path)) {
			const cached = this._getFromCache(path);
			return cached || '';
		}
		
		try {
			const result = await this.client.getFile(path);
			const content = result && result.data ? result.data : result;
			const noteText = (typeof content === 'string' ? content : '') || '';
			
			// Cache the result
			this._setCache(path, noteText);
			
			return noteText;
		} catch (e) {
			// Cache empty string to prevent repeated requests
			this._setCache(path, '');
			return '';
		}
	}
	
	async setCompanyNote(companyId, note) {
		const noteText = typeof note === 'string' ? note : String(note);
		const path = `notes/companies/${companyId}.txt`;
		await this.client.storeFile('text/plain', path, noteText);
		// Clear cache so next read gets fresh data
		this._clearCache(path);
		return true;
	}
	
	async getJobNote(jobId) {
		const path = `notes/jobs/${jobId}.txt`;
		
		// Return cached version if available
		if (this._isCached(path)) {
			const cached = this._getFromCache(path);
			return cached || '';
		}
		
		try {
			const result = await this.client.getFile(path);
			const content = result && result.data ? result.data : result;
			const noteText = (typeof content === 'string' ? content : '') || '';
			
			// Cache the result
			this._setCache(path, noteText);
			
			return noteText;
		} catch (e) {
			// Cache empty string to prevent repeated requests
			this._setCache(path, '');
			return '';
		}
	}
	
	async setJobNote(jobId, note) {
		const noteText = typeof note === 'string' ? note : String(note);
		const path = `notes/jobs/${jobId}.txt`;
		await this.client.storeFile('text/plain', path, noteText);
		// Clear cache so next read gets fresh data
		this._clearCache(path);
		return true;
	}
	
	/**
	 * Cover letter management
	 */
	async getCoverLetters() {
		try {
			const files = await this.client.getListing('cover-letters/');
			const letters = {};
			
			if (files) {
				for (const filename of Object.keys(files)) {
					if (filename.endsWith('.txt')) {
						const name = filename.replace('.txt', '');
						try {
							letters[name] = await this.client.getFile(`cover-letters/${filename}`);
						} catch (e) {
							// Skip files that can't be read
						}
					}
				}
			}
			
			// Ensure default cover letter exists
			if (!letters.default) {
				letters.default = '';
			}
			
			return letters;
		} catch (e) {
			return { default: '' };
		}
	}
	
	async getCoverLetter(name = 'default') {
		try {
			const result = await this.client.getFile(`cover-letters/${name}.txt`);
			const content = result && result.data ? result.data : result;
			return (typeof content === 'string' ? content : '') || '';
		} catch (e) {
			return '';
		}
	}
	
	async setCoverLetter(name = 'default', content) {
		const letterText = typeof content === 'string' ? content : String(content);
		await this.client.storeFile('text/plain', `cover-letters/${name}.txt`, letterText);
		return true;
	}
	
	async deleteCoverLetter(name) {
		if (name === 'default') return false; // Don't delete default
		await this.client.remove(`cover-letters/${name}.txt`);
		return true;
	}
	
	/**
	 * Settings management
	 */
	async getSettings() {
		try {
			const result = await this.client.getFile('preferences/settings.txt');
			const content = result && result.data ? result.data : result;
			const settings = {};
			if (content && typeof content === 'string') {
				content.split('\n').forEach(line => {
					const [key, ...valueParts] = line.split('=');
					if (key && valueParts.length) {
						settings[key.trim()] = valueParts.join('=').trim();
					}
				});
			}
			return settings;
		} catch (e) {
			return {};
		}
	}
	
	async setSetting(key, value) {
		const settings = await this.getSettings();
		settings[key] = value;
		const content = Object.entries(settings)
			.map(([k, v]) => `${k}=${v}`)
			.join('\n');
		await this.client.storeFile('text/plain', 'preferences/settings.txt', content);
		return true;
	}
}

// Global singleton instance
let globalStorage = null;

export function getJoblistStorage() {
	if (!globalStorage) {
		globalStorage = new JoblistStorage();
	}
	return globalStorage;
}
