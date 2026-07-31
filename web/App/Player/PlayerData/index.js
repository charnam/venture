import * as zip from "@zip.js/zip.js";
import { HTML } from "imperative-html";
import PlayerElement from "../VideoState/PlayerElement/index.js";
import VideoState from "../VideoState/index.js";

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
				id: null,
				bounds: {x: -0.1, y: -0.1, width: 0.2, height: 0.2}
			},
			
			execute: (state, attributes) => {
				if(!state.elements[attributes.id]) {
					let element = state.elements[attributes.id] = new PlayerElement(state);
					element.setBounds(attributes.bounds, state.timestamp);
				}
			}
		},
		{
			type: "element_visibility",
			
			name: "Hide/show element",
			icon: "bi bi-dash-square-dotted",
			
			editor: [
				[{attribute: "visible"}, {label: " element"}],
				[{label: "named "}, {attribute: "id"}]
			],
			
			attributes: {
				id: {type: "existing_element_id"},
				visible: {type: "dropdown", values: [
					{label: "Show", value: true},
					{label: "Hide", value: false}
				]}
			},
			
			defaults: {
				id: "",
				visible: false
			},
			
			execute: (state, attributes) => {
				const element = state.elements[attributes.id];
				if(element) {
					element.setExists(attributes.value, state.timestamp);
				}
			}
		},
		{
			type: "element_animate",
			
			name: "Adjust element",
			icon: "bi bi-bezier2",
			
			attributes: {
				id: {type: "existing_element_id"},
				bounds: {type: "element_bounds"}
			},
			
			editor: [
				[{label: "Move element"}],
				[{label: "named "}, {attribute: "id"}],
				[{label: "to "}, {attribute: "bounds"}]
			],
			
			defaults: {
				id: "",
				bounds: {x: 0, y: 0, width: 0, height: 0}
			},
			
			execute: (state, attributes) => {
				const element = state.elements[attributes.id]
				if(element) {
					element.setBounds(attributes.bounds, state.timestamp);
				}
			}
		},
		{
			type: "skip",
			
			name: "Skip to...",
			icon: "bi bi-fast-forward-fill",
			
			attributes: {
				marker: {type: "marker", anyVideo: true}
			},
			
			editor: [
				[{label: "Skip to marker: "}, {attribute: "marker"}]
			],
			
			defaults: {
			},
			
			execute: (state, attributes, settings = {}) => {
				if(!settings?.isPreLoading) {
					const id = attributes.marker?.id;
					const videoId = attributes.marker?.video;
					if(state.videoId == videoId) {
						const marker = state.video.markers[id];
						if(marker) {
							state.timestamp = marker.timestamp;
						}
					} else {
						// TODO: switch to other video
						//state.player.
					}
				}
			}
		},
		{
			type: "element_event",
			
			name: "Set element actions",
			icon: "bi bi-mouse",
			
			attributes: {
				id: {type: "existing_element_id"},
				actions: {type: "actions"}
			},
			
			execute: (state, attributes) => {
				
			}
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
	
	static validateActions(actions) {
		if(!Array.isArray(actions)) return false;
		
		for(let action of actions) {
			const actionParams = this.actions.find(test => test.type == action.type);
			if(!actionParams) {
				return false;
			}
			
			for(let [param_id, param_details] of Object.entries(actionParams.attributes)) {
				const usedParam = action[param_id];
				switch(param_details.type) {
					case "new_element_id":
						if(typeof usedParam !== "string") return false;
						break;
					case "existing_element_id":
						if(typeof usedParam !== "string") return false;
						break;
					case "dropdown":
						if(!Array.isArray(usedParam?.values)) return false;
						
						for(let value of usedParam.values) {
							if(!value?.label || value?.value == undefined)
								return false;
						}
						
						break;
					case "element_bounds":
						if(!usedParam) return false;
						
						if(
							typeof usedParam.x !== "number" ||
							typeof usedParam.y !== "number" ||
							typeof usedParam.width !== "number" ||
							typeof usedParam.height !== "number"
						) {
							return false;
						}
						break;
					
					// unknown action type
					default:
						return false;
				}
			}
		}
		
		return true;
	}
	
	version = 1;
	
	id = "local";
	title = "My Venture";
	videos = [];
	
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