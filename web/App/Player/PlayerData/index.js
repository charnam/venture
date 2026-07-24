import * as zip from "@zip.js/zip.js";
import { HTML } from "imperative-html";
import PlayerElement from "../PlayerState/PlayerElement/index.js";

class PlayerData {
	static actions = [
		{
			type: "element_create",
			
			name: "Create element",
			icon: "bi bi-plus-square-dotted",
			
			editor: [
				[{label: "Define an element"}],
				[{label: "named "}, {attribute: "id"}],
				[{label: "at "}, {attribute: "bounds"}]
			],
			
			attributes: {
				id: {type: "new_element_id"},
				bounds: {type: "element_bounds"}
			},
			
			defaults: {
				id: "element1",
				bounds: {x: -0.1, y: -0.1, width: 0.2, height: 0.2}
			},
			
			execute: (state, attributes) => {
				let element = state.elements[attributes.id] = new PlayerElement(state);
				
				
				
			},
			
			canBeAdded: (file, video, marker) => {
				if(file.getPossibleElementsAt(marker.video, marker.timestamp).length > 7) {
					return false;
				}
				
				return true;
			},
			canBeNested: false
		},
		{
			type: "element_remove",
			
			name: "Remove element",
			icon: "bi bi-dash-square-dotted",
			
			editor: [
				[{label: "Remove element "}, {attribute: "id"}]
			],
			
			attributes: {
				id: {type: "existing_element_id"}
			},
			
			canBeAdded: (file, video, marker) => {
				if(file.getPossibleElementsAt(video, marker.timestamp).length > 0) {
					return true;
				}
				
				return false;
			},
			canBeNested: false
		},
		{
			type: "element_animate",
			
			name: "Animate element",
			icon: "bi bi-bezier2",
			
			attributes: {
				id: {type: "existing_element_id"}
			},
			
			canBeAdded: (file, video, marker) => {
				if(file.getPossibleElementsAt(video, marker.timestamp).length > 0) {
					return true;
				}
				
				return false;
			},
			canBeNested: false
		},
		{
			type: "skip",
			
			name: "Skip to...",
			icon: "bi bi-fast-forward-fill",
			
			attributes: {
				video: {type: "video", allowCurrent: true},
				time: {type: "float", min: 0, max: 60*60*60, value: 0}
			}
		},
		{
			type: "add_event",
			
			name: "Element event"
		},
		{
			type: "pause_until",
			
			name: "Pause",
			icon: "bi bi-pause-fill",
			
			attributes: {
				until: {type: "user_event"}
			}
		},
	];
	static actionValidation = {
		type: "array",
		items: {
			type: "any",
			of: this.actions
		}
	};
	
	version = 1;
	
	id = "local";
	title = "My Venture";
	videos = [];
	
	getPossibleElementsAt(video, timestamp) {
		let elements = [];
		if(this.videos[video]) {
			for(let marker of Object.values(this.videos[video].markers).sort((a, b) => a.timestamp - b.timestamp)) {
				
			}
		}
		return elements;
	}
	
	constructor(json = {}) {
		try {
			if(typeof json == "string") {
				json = JSON.parse(json);
			}
		} catch(err) {
			throw new Error("Invalid player data, got " + json);
		}
		
		this.id = json?.id ?? "local";
		
		this.title = json?.title ?? "Untitled";
		this.videos = json?.videos?.map(video => ({
			url: video?.url,
			blob: video?.blob,
			markers: Object.fromEntries(
				Object.entries(video?.markers ?? {}).map(([id, marker]) => [id, {
					timestamp: marker?.timestamp ?? 0,
					actions: marker?.actions?.map(action => ({
						type: action?.type,
						attributes: structuredClone(action?.attributes) ?? {}
					})) ?? []
				}]) ?? []
			)
		})) ?? [];
		this.version = json.version;
		
		// I love input validation :)
		if(!Array.isArray(this.videos)) {
			this.videos = [];
		}
		for(let video of this.videos) {
			for(let marker of Object.values(video.markers)) {
				if(!Array.isArray(marker.actions))
					marker.actions = [];
			}
		}
		
		// Project data version update code would go here,
		// but we're only on version 1, so we don't really
		// need anything
		switch(this.version) {
		}
	}
	
	async toFile() {
		const serialized = this.serialize();
		
		const zipFile = new zip.BlobWriter();
		const zipWriter = new zip.ZipWriter(zipFile);
		
		await zipWriter.add("videos/", null, { directory: true });
		for(let id in this.videos) {
			const videoData = this.videos[id];
			
			if(videoData.blob) {
				await zipWriter.add("videos/" + id, new zip.BlobReader(videoData.blob));
			} else {
				await zipWriter.add("videos/" + id, new zip.HttpReader(videoData.url));
			}
		}
		
		await zipWriter.add("playerData.json", new zip.TextReader(
			JSON.stringify(serialized, null, 4)
		));
		const data = await zipWriter.close();
		
		const a = new HTML.a({href: URL.createObjectURL(data), download: this.title + ".vn1"});
		document.body.append(a);
		a.click();
		a.remove();
	}
	static async fromFile(blob) {
		const reader = new zip.BlobReader(blob);
		
		// TODO
	}
	
	// keepURLs is used for editor undo history,
	// otherwise URLs and Blob objects are ommitted (making this safe to save to a file, or send somewhere)
	serialize(keepURLs) {
		return {
			version: this.version,
			id: this.id,
			title: this.title,
			videos: this.videos.map(video => {
				const out = {
					markers: video.markers
				};
				
				if(keepURLs) {
					if(video.url) {
						out.url = video.url;
					}
					if(video.blob) {
						out.blob = video.blob;
					}
				}
				
				return out;
			})
		}
	}
	static fromSerialized(json) {
		return new PlayerData(json);
	}
}

export default PlayerData;