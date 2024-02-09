import sdk, { MATRIX_ROOM_MAP, MATRIX_TYPE_JOB } from "../libs/sdk.js";
import mwc from "../libs/mwc.js";

const { general: generalRoom } = MATRIX_ROOM_MAP;

export default class MatrixSendJob extends HTMLElement {
	/* props */
	get eventType() {
		return this.getAttribute("event-type") || MATRIX_TYPE_JOB;
	}
	get profileId() {
		return this.getAttribute("profile-id") || generalRoom;
	}
	/* state */
	get api() {
		return mwc.api;
	}

	/* lifecycle */
	connectedCallback() {
		this.render();
	}
	render() {
		const $doms = [];
		if (this.api.auth) {
			$doms.push(
				this.createSend({
					eventType: this.eventType,
					profileId: this.profileId,
				}),
			);
		} else {
			$doms.push(this.createAuth(this.profileId));
		}
		this.replaceChildren(...$doms);
	}
	createSend({ eventType, profileId }) {
		const $send = document.createElement("matrix-send-event");
		$send.setAttribute("event-type", eventType);
		$send.setAttribute("profile-id", profileId);
		return $send;
	}
	createAuth(profileId) {
		const $auth = document.createElement("p");
		$auth.textContent = `Log in a matrix user, and join the room ${profileId} to be able to publish a new job there.`;
		return $auth;
	}
}
