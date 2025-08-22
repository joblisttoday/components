/**
 * Leaflet.js loader utility for loading Leaflet maps
 * @module LeafletLoader
 */

/**
 * Loads Leaflet library from CDN if not already loaded
 * @returns {Promise<void>} Promise that resolves when Leaflet is loaded
 */
export async function loadLeaflet() {
	// Check if Leaflet is already loaded
	if (typeof window.L !== 'undefined') {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		// Load CSS first
		const cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
		cssLink.crossOrigin = '';
		
		// Load JS after CSS
		cssLink.onload = () => {
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
			script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
			script.crossOrigin = '';
			
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load Leaflet JS'));
			
			document.head.appendChild(script);
		};
		
		cssLink.onerror = () => reject(new Error('Failed to load Leaflet CSS'));
		document.head.appendChild(cssLink);
	});
}

/**
 * Gets the Leaflet instance, loading it if necessary
 * @returns {Promise<object>} Promise that resolves to the Leaflet L object
 */
export async function getLeaflet() {
	await loadLeaflet();
	return window.L;
}

export default { loadLeaflet, getLeaflet };