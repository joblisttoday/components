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
	get origin() {
		return this.getAttribute("origin") || "https://matrix.to/#";
	}
	/* helpers */
	get roomOrigin() {
		return `${this.origin}/${this.profileId}`;
	}
	/* state */
	roomId = null;
	joinedRoom = false;
	get api() {
		return mwc.api;
	}

	/* events */
	onAuth(event) {
		this.render();
	}
	async onJoin({ detail }) {
		const { room_id } = detail;
		if (room_id) {
			this.roomId = room_id;
			try {
				const { chunk } = await this.api.getRoomMembers(this.roomId);
				this.joinedRoom = this.api.isUserJoinRoom(chunk);
			} catch (error) {
				console.info("Could not get room memberships", error);
			}
		}
		this.render();
	}

	/* lifecycle */
	constructor() {
		super();
		this.api.addEventListener("auth", this.onAuth.bind(this));
	}
	async connectedCallback() {
		const profile = this.api.checkMatrixId(this.profileId);
		if (profile.roomId) {
			this.roomId = profile.roomId;
		} else {
			try {
				const res = await this.api.getRoomId(profile);
				this.roomId = res.room_id;
			} catch (error) {
				console.info("Could not get room id", error);
			}
		}
		if (this.roomId) {
			try {
				const { chunk } = await this.api.getRoomMembers(this.roomId);
				this.joinedRoom = this.api.isUserJoinRoom(chunk);
			} catch (error) {
				console.info("Could not get room memberships", error);
			}
		}
		this.render();
	}
	disconnectedCallback() {
		this.api.removeEventListener("auth", this.onAuth);
	}
	render() {
		const $doms = [];
		if (this.api.auth && this.roomId) {
			if (this.joinedRoom) {
				$doms.push(
					this.createSend({
						eventType: this.eventType,
						profileId: this.roomId,
					}),
				);
			} else {
				$doms.push(
					this.createJoin({
						roomId: this.roomId,
						profileId: this.profileId,
						roomOrigin: this.roomOrigin,
					}),
				);
			}
		} else {
			$doms.push(this.createAuth(), this.createAuthMessage(this.profileId));
		}
		this.replaceChildren(...$doms);
	}
	createSend({ eventType, profileId }) {
		const $send = document.createElement("matrix-send-event");
		$send.setAttribute("event-type", eventType);
		$send.setAttribute("profile-id", profileId);
		return $send;
	}
	createAuth() {
		const $auth = document.createElement("matrix-auth");
		return $auth;
	}
	createAuthMessage(profileId) {
		const $authMessage = document.createElement("p");
		$authMessage.textContent = `Log in a matrix user, and join the room ${profileId} to be able to publish a new job there.`;
		return $authMessage;
	}
	createJoin({ roomId, profileId, roomOrigin }) {
		const $joinRoom = document.createElement("matrix-join-room");
		$joinRoom.setAttribute("room-id", roomId);
		$joinRoom.addEventListener("join", this.onJoin.bind(this));

		const $join = document.createElement("joblist-matrix-send-jobs-join");
		const $roomHref = document.createElement("a");
		$roomHref.setAttribute("href", roomOrigin);
		$roomHref.textContent = profileId;
		$join.replaceChildren($joinRoom, " ", $roomHref, " ", "to publish jobs.");
		return $join;
	}
}
