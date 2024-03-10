const TEXT_LANG = ["en"];
const TEXT_DEFAULT_LANG = TEXT_LANG[0];
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

export class TextManager {
	constructor() {
		this.language = TEXT_DEFAULT_LANG;
		this.textDict = new Map(TEXT_DICT);
	}
	setLanguage(lang = TEXT_DEFAULT_LANG) {
		this.language =
			TEXT_LANG.find((language) => {
				return language === lang;
			}) || TEXT_DEFAULT_LANG;
	}
	getText(name) {
		return this.textDict.get(name) || "";
	}
}
const manager = new TextManager();

const text = (name) => {
	return manager.getText(name);
};

export default text;
