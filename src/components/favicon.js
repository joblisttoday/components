export const JOBLIST_FAVICON_SVG = `
	<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
			 width="480.000000pt" height="480.000000pt" viewBox="0 0 480.000000 480.000000"
			 preserveAspectRatio="xMidYMid meet">
		<metadata>
			Created by potrace 1.11, written by Peter Selinger 2001-2013
		</metadata>
		<g transform="translate(0.000000,480.000000) scale(0.100000,-0.100000)"
			 fill="#000000" stroke="none">
			<path d="M3396 4499 c-26 -4 -76 -10 -110 -14 -33 -3 -72 -8 -86 -10 -14 -3
				-47 -7 -75 -10 -27 -3 -66 -7 -85 -10 -19 -3 -57 -7 -85 -10 -27 -3 -66 -7
				-85 -10 -19 -2 -59 -7 -89 -11 -30 -3 -61 -7 -70 -9 -9 -1 -43 -6 -76 -9 -33
				-3 -76 -8 -95 -11 -50 -7 -107 -14 -165 -20 -27 -3 -61 -8 -75 -10 -14 -2 -50
				-7 -80 -10 -30 -3 -89 -10 -130 -15 -41 -5 -97 -12 -125 -15 -27 -3 -84 -10
				-126 -16 -42 -5 -98 -12 -125 -14 -27 -3 -64 -7 -82 -10 -18 -3 -54 -7 -80
				-10 -26 -3 -63 -8 -82 -10 -19 -3 -51 -7 -70 -10 -19 -2 -56 -7 -82 -10 -99
				-11 -145 -16 -213 -25 -38 -5 -99 -12 -135 -16 -36 -4 -67 -10 -70 -14 -3 -5
				-5 -871 -5 -1927 l0 -1918 1453 -3 1452 -2 0 1930 0 1930 -150 0 -150 0 0 155
				0 155 -27 -2 c-16 -1 -50 -6 -77 -9z m-16 -209 l0 -90 -697 1 c-384 1 -678 5
				-653 9 41 7 78 12 195 25 98 12 135 16 210 26 133 16 148 18 200 24 28 3 84
				10 126 16 41 5 95 11 119 14 23 2 59 7 79 9 20 3 79 10 131 16 52 6 105 13
				118 15 13 2 53 7 90 11 37 3 69 8 71 10 10 9 11 0 11 -86z m0 -1885 l0 -1675
				-32 -1 c-18 0 -42 -2 -53 -4 -22 -4 -86 -12 -180 -20 -33 -3 -71 -8 -85 -10
				-14 -2 -54 -7 -90 -10 -36 -4 -76 -9 -90 -10 -14 -2 -54 -6 -90 -9 -36 -4 -81
				-9 -100 -11 -47 -7 -93 -12 -165 -19 -33 -4 -78 -8 -100 -11 -22 -2 -67 -7
				-100 -10 -33 -3 -73 -8 -90 -10 -16 -3 -57 -7 -90 -10 -33 -3 -71 -7 -85 -10
				-14 -2 -56 -7 -95 -10 -38 -4 -81 -8 -94 -10 -14 -3 -54 -7 -90 -10 -36 -3
				-77 -8 -91 -10 -14 -2 -47 -7 -75 -9 -27 -3 -70 -8 -95 -10 -25 -3 -70 -8
				-100 -11 -30 -3 -91 -10 -135 -15 -44 -5 -109 -12 -145 -15 -36 -4 -71 -8 -77
				-10 -10 -4 -13 361 -13 1800 l0 1805 1180 0 1180 0 0 -1675z m300 -135 l0
				-1810 -827 0 c-454 0 -824 2 -822 4 2 2 38 6 79 10 41 3 86 8 100 10 22 4 90
				11 195 22 140 14 225 23 315 34 41 5 104 12 140 15 36 3 76 7 90 10 14 2 54 7
				90 10 36 4 79 8 95 10 73 9 124 15 185 20 36 4 90 10 120 13 l55 7 3 1728 2
				1727 90 0 90 0 0 -1810z"/>
			<path d="M2493 3442 l-23 -3 -1 -812 c-1 -790 -2 -847 -13 -952 -19 -175 -94
				-257 -249 -272 -99 -9 -169 16 -233 81 -65 67 -84 120 -100 274 l-6 67 -207
				-23 c-283 -32 -253 -18 -250 -110 9 -320 161 -562 413 -657 110 -42 207 -55
				366 -51 255 7 410 65 551 205 114 114 163 214 196 396 14 78 17 210 19 973 2
				683 0 882 -9 883 -37 3 -436 3 -454 1z"/>
		</g>
	</svg>
`;

const template = document.createElement("template");
template.innerHTML = JOBLIST_FAVICON_SVG;

export default class JoblistFavicon extends HTMLElement {
	get color() {
		return this.getAttribute("color") || this.randomColor;
	}
	get randomColor() {
		return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`
	}
	get href() {
		return this.getAttribute("href");
	}
	connectedCallback() {
		this.style.setProperty("--c-svg", this.color);
		const svg = template.content.cloneNode(true);
		this.render(svg);
	}
	render(svg) {
		if (this.href) {
			const anchor = this.createAnchor(this.href);
			anchor.replaceChildren(svg);
			this.replaceChildren(anchor);
		} else {
			this.replaceChildren(svg);
		}
	}
	createAnchor(href) {
		const anchor = document.createElement("a");
		anchor.setAttribute("href", href);
		return anchor;
	}
}
