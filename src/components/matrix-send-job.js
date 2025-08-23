/**
 * Matrix send-job helper component.
 * Shows login/join actions and a send form once user is ready in the target room.
 * @class MatrixSendJob
 * @extends HTMLElement
 */
import { MATRIX_ROOM_MAP, MATRIX_TYPE_JOB } from "../libs/sdk.js";
import mwc from "../libs/mwc.js";

const { general: generalRoom } = MATRIX_ROOM_MAP;

export default class MatrixSendJob extends HTMLElement {
	/* props */
	/** @returns {string} Matrix event type to send */
	get eventType() {
		return this.getAttribute("event-type") || MATRIX_TYPE_JOB;
	}
	/** @returns {string} Target profile/room alias or id */
	get profileId() {
		return this.getAttribute("profile-id") || generalRoom;
	}
	/** @returns {string} Base origin for matrix.to links */
	get origin() {
		return this.getAttribute("origin") || "https://matrix.to/#";
	}
	/* helpers */
	/** @returns {string} Fully qualified matrix.to link for the target profile */
	get roomOrigin() {
		return `${this.origin}/${this.profileId}`;
	}
	/* state */
	roomId = null;
	joinedRoom = false;
	/** @returns {any} Matrix Web Client API */
	get api() {
		return mwc.api;
	}

	/* events */
	/** Refresh UI when auth state changes */
	onAuth(event) {
		this.render();
	}
	/**
	 * @param {{detail:{room_id?:string}}} param0
	 */
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
	/** Render depending on auth/room state */
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
	/**
	 * @param {{eventType:string,profileId:string}} param0
	 * @returns {HTMLElement}
	 */
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
	/**
	 * @param {string} profileId
	 * @returns {HTMLParagraphElement}
	 */
	createAuthMessage(profileId) {
		const $authMessage = document.createElement("p");
		$authMessage.textContent = `Log in a matrix user, and join the room ${profileId} to be able to publish a new job there.`;
		return $authMessage;
	}
	/**
	 * @param {{roomId:string,profileId:string,roomOrigin:string}} param0
	 * @returns {HTMLElement}
	 */
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
