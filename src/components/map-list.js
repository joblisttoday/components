const buildTemplate = () => {
	const template = document.createElement("template");

	template.innerHTML = `
		<style>
			/* box sizing */
			:host {
				box-sizing: border-box;
			}
			*, :host *:before, :host *:after {
				box-sizing: inherit;
			}
			/* hidden */
			:host([hidden]) { display: none }
			:host {
				display: flex;
				flex-direction: column;
				width: 100%;
			}
			joblist-leaflet {
				height: 100%;
				min-height: 17rem;
				flex-grow: 1;
			}
			.leaflet-marker-icon {
				/* background-color: red; */
			}
			.leaflet-popup-content	{
				margin: 0.3rem;
			}
			.leaflet-popup-content a {
				display: block;
				padding: 0.8rem;
			}
		</style>
		<joblist-leaflet></joblist-leaflet>
	`;
	return template;
};

export default class JoblistMapList extends HTMLElement {
	get longitude() {
		return parseFloat(this.getAttribute("longitude") || "10.09");
	}
	get latitude() {
		return parseFloat(this.getAttribute("latitude") || "51.505");
	}
	get zoom() {
		return parseFloat(this.getAttribute("latitude") || "4");
	}

	/* used to build the url of the marker link */
	get origin() {
		return (
			this.getAttribute("origin") ||
			"https://profiles.joblist.today/companies/{}"
		);
	}

	get markers() {
		let markers = [];
		try {
			markers = JSON.parse(this.getAttribute("markers"));
		} catch (error) {
			console.log("Error parsing markers data", error);
		}
		return markers;
	}

	/* should have been inserted with `createLeafletScripts` */
	get checkDependencies() {
		return typeof this.leaflet !== "undefined";
	}

	get leaflet() {
		return window.L;
	}

	static get observedAttributes() {
		return ["markers", "longitude", "latitude", "zoom"];
	}
	attributeChangedCallback() {
		/* restart leaflet js if any observed attr change */
		if (this.checkDependencies) {
			this.renderMarkersLayer(this.markers);
		}
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(buildTemplate().content.cloneNode(true));
	}

	async connectedCallback() {
		this.$component = this.shadowRoot.querySelector("joblist-leaflet");

		/* leaflet css */
		await this.insertStyles(this.$component);

		/* leaflet js */
		if (this.checkDependencies) {
			this.map = this.initLeaflet(this.$component);
			this.renderMarkersLayer(this.markers);
		}
	}

	async insertStyles($context) {
		/* We insert the styles with js, as otherwise the shadow dom makes
			 global styles innefetive on our component
			 <link
			 rel="stylesheet"
			 href="https://unpkg.com/leaflet@1.9.2/dist/leaflet.css"
			 integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
			 crossorigin="" /> */
		try {
			await new Promise(async (resolve) => {
				const $leafletStyles = document.createElement("link");
				$leafletStyles.rel = "stylesheet";
				$leafletStyles.href =
					"https://unpkg.com/leaflet@1.9.2/dist/leaflet.css";
				$leafletStyles.onload = resolve;
				$leafletStyles.setAttribute(
					"integrity",
					"sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=",
				);
				$leafletStyles.setAttribute("crossorigin", "");
				$context.appendChild($leafletStyles);
			});
		} catch (error) {
			console.log("Error inserting leaflet styles", error);
			return false;
		}
		return true;
	}

	initLeaflet = ($el) => {
		const map = this.leaflet
			.map($el)
			.setView([this.latitude, this.longitude], this.zoom);
		map.zoomControl.setPosition("topright");

		const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
		const mapAttribution =
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
		this.leaflet
			.tileLayer(tileUrl, {
				attribution: mapAttribution,
				position: "bottomleft",
			})
			.addTo(map);

		return map;
	};

	renderMarkersLayer = (markers) => {
		if (!markers || !this.map) return;

		if (this.layerGroupMarkers && this.map.hasLayer(this.layerGroupMarkers)) {
			this.layerGroupMarkers.clearLayers();
		}

		const iconUrl =
			"data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

		const $markers = markers.map((data) => {
			var icon = this.leaflet.icon({
				iconUrl,
				iconSize: [20, 20],
				popupAnchor: [0, -15],
			});

			if (data.longitude && data.latitude) {
				let popupText = data.text;
				if (data.slug) {
					const popupDom = `<a href="${this.buildOrigin(data.slug)}">${data.text}</>`;
					popupText = popupDom;
				}
				return this.leaflet
					.marker([data.latitude, data.longitude], { icon })
					.bindPopup(popupText);
			}
		});

		/*
			 add all markers to a markers group
			 https://leafletjs.com/reference.html#layergroup
			 https://leafletjs.com/reference.html#featuregroup
		 */

		this.layerGroupMarkers = this.leaflet
			.featureGroup($markers)
			.addTo(this.map);

		/*
			 fit the map the the markers
			 https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
		 */
		const groupBounds = this.layerGroupMarkers.getBounds();
		if (Object.keys(groupBounds).length) {
			this.map.fitBounds(this.layerGroupMarkers.getBounds());
		} else {
			this.map.fitWorld();
		}
	};
	/* build a URL from the widget origin and marker slug */
	buildOrigin(slug) {
		if (this.origin.indexOf("{}") < 0) {
			return `${this.origin}/${slug}`;
		} else {
			const address = this.origin.replace("{}", slug);
			return address;
		}
	}
}
