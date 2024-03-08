const ICONS_DICT = [
	["company_url", "www"],
	["job_board_url", "careers"],
	["wikipedia_url", "wiki"],
	["linkedin_url", "ln"],
	["twitter_url", "x"],
	["youtube_url", "yt"],
	["facebook_url", "fb"],
	["instagram_url", "in"],
];

class IconManager {
	constructor() {
		this.iconMap = new Map(ICONS_DICT);
	}

	getIcon(name) {
		return this.iconMap.get(name) || "";
	}
}
const manager = new IconManager();

const icon = (name) => {
	return manager.getIcon(name);
};

export default icon;
