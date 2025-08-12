/**
 * Simple Hash Router for client-side routing with URLSearchParams
 * Provides utilities for reading, updating, and listening to hash changes
 */
export class HashRouter {
    constructor() {
        this.listeners = new Set();
        this._currentParams = this.getParams();
        
        // Listen to hash changes
        window.addEventListener('hashchange', this._handleHashChange.bind(this));
        
        // Listen to popstate for browser back/forward
        window.addEventListener('popstate', this._handleHashChange.bind(this));
    }

    /**
     * Get current hash parameters as an object
     * @returns {Object} Parameters object
     */
    getParams() {
        const hash = window.location.hash.slice(1); // Remove the '#'
        return Object.fromEntries(new URLSearchParams(hash));
    }

    /**
     * Update hash parameters (replaces current hash)
     * @param {Object} params - Parameters to set
     * @param {boolean} replace - If true, replace current history entry instead of adding new one
     */
    setParams(params, replace = false) {
        const hashParams = new URLSearchParams();
        
        // Only set non-empty values
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== '') {
                hashParams.set(key, value);
            }
        });
        
        const newHash = hashParams.toString();
        
        if (replace) {
            window.location.replace('#' + newHash);
        } else {
            window.location.hash = newHash;
        }
    }

    /**
     * Update specific hash parameters (merges with existing)
     * @param {Object} params - Parameters to update
     * @param {boolean} replace - If true, replace current history entry instead of adding new one
     */
    updateParams(params, replace = false) {
        const current = this.getParams();
        const updated = { ...current, ...params };
        this.setParams(updated, replace);
    }

    /**
     * Clear all hash parameters
     */
    clearParams() {
        window.location.hash = '';
    }

    /**
     * Get a specific parameter value
     * @param {string} key - Parameter key
     * @param {string} defaultValue - Default value if parameter doesn't exist
     * @returns {string|undefined} Parameter value
     */
    getParam(key, defaultValue) {
        const params = this.getParams();
        return params[key] || defaultValue;
    }

    /**
     * Set a specific parameter
     * @param {string} key - Parameter key
     * @param {string} value - Parameter value
     * @param {boolean} replace - If true, replace current history entry instead of adding new one
     */
    setParam(key, value, replace = false) {
        this.updateParams({ [key]: value }, replace);
    }

    /**
     * Remove a specific parameter
     * @param {string} key - Parameter key to remove
     * @param {boolean} replace - If true, replace current history entry instead of adding new one
     */
    removeParam(key, replace = false) {
        const current = this.getParams();
        delete current[key];
        this.setParams(current, replace);
    }

    /**
     * Add a listener for hash changes
     * @param {Function} callback - Callback function that receives (newParams, oldParams)
     * @returns {Function} Unsubscribe function
     */
    onParamsChange(callback) {
        this.listeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Handle hash change events
     * @private
     */
    _handleHashChange() {
        const newParams = this.getParams();
        const oldParams = this._currentParams;
        
        // Check if parameters actually changed
        const hasChanged = JSON.stringify(newParams) !== JSON.stringify(oldParams);
        
        if (hasChanged) {
            this._currentParams = newParams;
            
            // Notify all listeners
            this.listeners.forEach(callback => {
                try {
                    callback(newParams, oldParams);
                } catch (error) {
                    console.error('Error in hash router callback:', error);
                }
            });
        }
    }

    /**
     * Destroy the router and remove event listeners
     */
    destroy() {
        window.removeEventListener('hashchange', this._handleHashChange.bind(this));
        window.removeEventListener('popstate', this._handleHashChange.bind(this));
        this.listeners.clear();
    }
}

// Create and export a default instance
export const hashRouter = new HashRouter();

// Helper functions for common use cases
export const getHashParams = () => hashRouter.getParams();
export const setHashParams = (params, replace) => hashRouter.setParams(params, replace);
export const updateHashParams = (params, replace) => hashRouter.updateParams(params, replace);
export const onHashParamsChange = (callback) => hashRouter.onParamsChange(callback);