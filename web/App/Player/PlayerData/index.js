import * as zip from "@zip.js/zip.js";
import { HTML } from "imperative-html";

class PlayerData {
	
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
						attributes: structuredClone(action?.attributes) ?? []
					})) ?? []
				}]) ?? []
			)
		})) ?? [];
		this.version = json.version;
		
		// I love input validation :)
		if(!Array.isArray(this.videos))
			this.videos = [];
		
		for(let video of this.videos) {
			for(let marker of Object.values(video.markers)) {
				if(!Array.isArray(marker.actions))
					marker.actions = [];
			}
		}
		
		// Project data version update code would go here,
		// but we're already on version 1, so we don't really
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