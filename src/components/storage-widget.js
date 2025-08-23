import { getJoblistStorage } from '../services/storage.js';

/**
 * Storage connection widget component for managing remoteStorage connections.
 * Provides UI for connecting to remoteStorage providers, displays connection status,
 * and handles both local and remote storage states with sync capabilities.
 * 
 * @class JoblistStorageWidget
 * @extends HTMLElement
 */
export default class JoblistStorageWidget extends HTMLElement {
	/**
	 * Creates an instance of JoblistStorageWidget.
	 * Initializes storage connection state properties.
	 */
	constructor() {
		super();
		/** @type {JoblistStorage|null} The storage service instance */
		this.storage = null;
		/** @type {boolean} Current connection status */
		this.connected = false;
	}
	
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Initializes storage service and sets up connection event listeners.
	 */
	async connectedCallback() {
		this.storage = getJoblistStorage();
		await this.storage.initialize();
		
		// Listen for connection changes
		this.storage.on('connected', () => {
			this.connected = true;
			this.render();
		});
		
		this.storage.on('disconnected', () => {
			this.connected = this.storage.isConnected();
			this.render();
		});
		
		this.connected = this.storage.isConnected();
		this.render();
	}
	
	/**
	 * Renders the storage widget UI based on connection state.
	 * Shows connection status and controls, or connection form if disconnected.
	 * Displays different UI for local vs remote storage connections.
	 */
	render() {
		if (this.connected) {
			// Check if connected to remote provider or just local storage
			const userAddress = this.storage.rs && this.storage.rs.remote && this.storage.rs.remote.userAddress;
			const hasRemoteConnection = this.storage.rs && this.storage.rs.remote && this.storage.rs.remote.connected;
			const backendType = hasRemoteConnection ? (this.storage.rs.backend || 'remote') : 'local';
			
			this.innerHTML = `
				<joblist-storage-status>
					<div>
						<span>✅ Storage connected</span>
						${userAddress ? `<br><small>User: ${userAddress}</small>` : '<br><small>User: local browser storage</small>'}
						<br><small>Type: ${backendType}</small>
					</div>
					${hasRemoteConnection ? `<button type="button">Disconnect Remote</button>` : ''}
				</joblist-storage-status>
			`;
			
			const disconnectBtn = this.querySelector('button');
			if (disconnectBtn) {
				disconnectBtn.addEventListener('click', () => {
					this.storage.disconnect();
				});
			}
		} else {
			this.innerHTML = `
				<joblist-storage-connect>
					<div>
						<p>Upgrade to remote storage to sync across devices:</p>
						<ul>
							<li>🔄 Sync favorites, notes, and cover letters across devices</li>
							<li>🔒 Own your data with remoteStorage providers</li>
							<li>📱 Access from any browser</li>
						</ul>
						<p><small>Currently using local browser storage (works offline, no sync)</small></p>
					</div>
					<form>
						<input 
							type="email" 
							placeholder="your-storage@provider.com"
							name="storage-address"
							required
						/>
						<button type="submit">Connect Remote Storage</button>
					</form>
					<details>
						<summary>Get a remoteStorage account</summary>
						<div>
							<p>remoteStorage lets you own your data and sync across devices:</p>
							<ul>
								<li><a href="https://5apps.com" target="_blank">5apps.com</a> - Free tier available</li>
								<li><a href="https://remotestorage.io/get/" target="_blank">More providers</a></li>
							</ul>
						</div>
					</details>
				</joblist-storage-connect>
			`;
			
			// Handle form submission
			this.querySelector('form').addEventListener('submit', (e) => {
				e.preventDefault();
				const address = this.querySelector('input[name="storage-address"]').value.trim();
				if (address) {
					this.storage.connect(address);
				}
			});
		}
		
	}
}