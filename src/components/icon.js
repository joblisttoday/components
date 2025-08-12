import { icons, createElement } from 'lucide';

// Map of social providers to Lucide icon names (PascalCase)
const SOCIAL_ICON_MAP = {
	'twitter': 'Twitter',
	'x': 'Twitter', // Use Twitter icon for X
	'linkedin': 'Linkedin',
	'facebook': 'Facebook',
	'instagram': 'Instagram',
	'youtube': 'Youtube',
	'github': 'Github',
	'wikipedia': 'FileText',
	'website': 'Globe',
	'company': 'Building',
	'job-board': 'Briefcase',
	'link': 'ExternalLink',
	'url': 'Link',
	'search': 'Search',
	'menu': 'Menu',
	'home': 'Home',
	'users': 'Users',
	'building': 'Building',
	'map': 'Map',
	'chart': 'BarChart3',
	'edit': 'Edit',
	'file': 'File',
	'trash': 'Trash2',
	'issue': 'Bug',
	'settings': 'Settings',
	'plus': 'Plus',
	'code': 'Code',
	'database': 'Database',
	'tag': 'Tag',
	'hash': 'Hash',
	'hashtag': 'Hash',
	'gitlab': 'GitBranch',
	'message-circle': 'MessageCircle',
	'newspaper': 'Newspaper'
};

export default class JoblistIcon extends HTMLElement {
	static get observedAttributes() {
		return ['icon', 'title', 'class'];
	}

	get icon() {
		return this.getAttribute('icon') || '';
	}

	get iconTitle() {
		return this.getAttribute('title') || '';
	}

	get className() {
		return this.getAttribute('class') || '';
	}

	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	attributeChangedCallback() {
		this.render();
	}

	toPascalCase(str) {
		return str
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
	}

	render() {
		// Clear existing content
		this.innerHTML = '';

		// Create container
		const container = document.createElement('i');
		container.className = `icon ${this.className}`;
		if (this.iconTitle) {
			container.title = this.iconTitle;
		}

		// Get the icon name (map social providers to icon names)
		const iconName = SOCIAL_ICON_MAP[this.icon.toLowerCase()] || this.toPascalCase(this.icon);
		const lucideIcon = icons[iconName];

		if (lucideIcon) {
			// Use Lucide's createElement to create the SVG directly
			const svg = createElement(lucideIcon);
			svg.setAttribute('width', '24');
			svg.setAttribute('height', '24');
			svg.style.display = 'block';
			
			const iconDiv = document.createElement('div');
			iconDiv.className = 'icon-svg';
			iconDiv.appendChild(svg);
			container.appendChild(iconDiv);
		} else {
			// Fallback to text
			container.textContent = this.icon;
			console.warn(`Icon not found: ${iconName}`);
		}

		// Add any child content via slot
		const slot = document.createElement('slot');
		container.appendChild(slot);

		this.appendChild(container);
	}
}

// Register the custom element
customElements.define('joblist-icon', JoblistIcon);