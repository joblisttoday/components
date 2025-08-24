/**
 * @fileoverview Text localization and translation utilities
 */

/** @type {string[]} Supported languages */
const TEXT_LANG = ["en"];
/** @type {string} Default language */
const TEXT_DEFAULT_LANG = TEXT_LANG[0];
/** @type {Array<[string, string]>} Text dictionary mapping keys to labels */
const TEXT_DICT = [
	["company_url", "homepage"],
	["job_board_url", "careers"],
	["wikipedia_url", "wikipedia"],
	["linkedin_url", "linkedin"],
	["twitter_url", "twitter"],
	["youtube_url", "youtube"],
	["facebook_url", "facebook"],
	["instagram_url", "instagram"],
];

/**
 * Text localization manager
 */
export class TextManager {
	constructor() {
		/** @type {string} Current language */
		this.language = TEXT_DEFAULT_LANG;
		/** @type {Map<string, string>} Text dictionary */
		this.textDict = new Map(TEXT_DICT);
	}
	
	/**
	 * Set the current language
	 * @param {string} [lang] - Language code to set
	 */
	setLanguage(lang = TEXT_DEFAULT_LANG) {
		this.language =
			TEXT_LANG.find((language) => {
				return language === lang;
			}) || TEXT_DEFAULT_LANG;
	}
	
	/**
	 * Get localized text for a key
	 * @param {string} name - Text key to look up
	 * @returns {string} Localized text or empty string if not found
	 */
	getText(name) {
		return this.textDict.get(name) || "";
	}
}
const manager = new TextManager();

/**
 * Get localized text for a key using the default text manager
 * @param {string} name - Text key to look up
 * @returns {string} Localized text or empty string if not found
 */
const text = (name) => {
	return manager.getText(name);
};

export default text;
