import { HTML } from "imperative-html";
import Player from "../Player/index.js";
import SingleInstanceRenderable from "../../lib/SingleInstanceRenderable/index.js";
import EditorTimeline from "./EditorTimeline/index.js";
import EditorMarker from "./EditorMarker/index.js";
import PlayerData from "../Player/PlayerData/index.js";

class Editor extends SingleInstanceRenderable {
	setPath(path) {
		this.path = path;
		this.update();
	}
	
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "editor"];
	animateRemoveDuration = 500;
	
	player = new Player(this);
	timeline = new EditorTimeline(this)
	marker = new EditorMarker(this);
	
	selection = [];
	undoHistory = [];
	redoHistory = [];
	
	get file() {
		return this.player.data;
	}
	set file(value) {
		this.player.data = value;
	}
	blobs = {};
	
	constructor(app) {
		super();
		this.app = app;
		
		window.addEventListener("keydown", event => {
			if(this.app.displayed == this && !["INPUT", "TEXTAREA"].includes(event.target.tagName.toUpperCase())) {
				// keyboard shortcuts in editor
				if(event.key == " ") {
					if(this.player.playback.paused) {
						this.player.playback.play();
					} else {
						this.player.playback.pause();
					}
					event.preventDefault();
				}
				if(event.key == "Home") {
					this.player.playback.currentTime = 0;
					event.preventDefault();
				}
				if(event.key == "End") {
					this.player.playback.currentTime = this.player.playback.duration;
					event.preventDefault();
				}
				if(event.key == "ArrowLeft") {
					this.player.playback.currentTime -= 5;
					event.preventDefault();
				}
				if(event.key == "ArrowRight") {
					this.player.playback.currentTime += 5;
					event.preventDefault();
				}
				if(event.ctrlKey && event.key == "z") {
					this.undo();
					event.preventDefault();
				}
				if((event.ctrlKey && event.key == "y") || (event.ctrlKey && event.shiftKey && event.key.toLowerCase() == "z")) {
					this.redo();
					event.preventDefault();
				}
				
				if(event.key == "Backspace" || event.key == "Delete") {
					if(this.selection.length > 0) {
						this.addUndo("delete items");
						for(let selected of this.selection) {
							switch(selected.type) {
								case "marker":
									delete this.file.videos[selected.video].markers[selected.id];
									break;
							}
						}
						this.clearSelection();
						event.preventDefault();
					}
				}
			}
		})
	}
	
	render() {
		const target = super.render();
		
		let menuBar;
		
		let uploadVideoButton,
			exampleVideoButton;
		
		target.append(
			menuBar = new HTML.div({class: "editor-menubar"}),
			this.marker.render(),
			new HTML.div({class: "editor-player"},
				this.player.render(),
				/*
				decided against putting the preview button here
				
				new HTML.div({class: "editor-player-sidebar"},
					new HTML.button({class: "editor-player-sidebar-button"},
						new HTML.i({class: "bi bi-eye-fill"})
					),
				)
				*/
			),
			this.timeline.render(),
			
			new HTML.div({class: "editor-choose-video-buttons"},
				uploadVideoButton = new HTML.button({class: "editor-upload-video-button"},
					new HTML.i({class: "bi bi-upload"}),
					new HTML.div({class: "editor-video-button-text" }, "First,\xa0select your\xa0video...")
				),
				/*
					// TODO: Sample videos
					
					exampleVideoButton = new HTML.button({class: "editor-example-video-button"},
						new HTML.i({class: "bi bi-film"}),
						new HTML.div({class: "editor-video-button-text" }, "If\xa0you're\xa0new, try\xa0an\xa0example!")
					)
				*/
			)
		);
		
		uploadVideoButton.onclick = async () => {
			uploadVideoButton.blur();
			//const loader = new LoadingScreen()
			//loader.show();
			const uploadedProperly = await this.uploadVideo(true);
			//loader.hide();
			
			if(uploadedProperly) {
				target.classList.add("editor-hide-choose-video-buttons");
			} else {
				
			}
		}
		
		if(this.file.videos.length > 0) {
			target.classList.add("editor-hide-choose-video-buttons");
		}
		
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
	}
	
	animate(target) {
		super.animate(target);
		
		let keep = [];
		for(let index = 0; index < this.selection.length; index++) {
			const removeSelection = () => {
				this.selection.splice(index, 1);
				index--;
			}
			const item = this.selection[index];
			
			switch(item.type) {
				case "marker":
					const video = this.file.videos[item.video];
					if(!video) {
						removeSelection();
						continue;
					}
					
					for(let visible of document.querySelectorAll("[markerid=\"" + item.id + "\"]")) {
						visible.classList.add("editor-selected");
						keep.push(visible);
					}
					break;
			}
		}
		
		for(let selected of document.querySelectorAll(".editor-selected")) {
			if(!keep.includes(selected)) {
				selected.classList.remove("editor-selected");
			}
		}
	}
	
	clearSelection() {
		this.selection = [];
	}
	select(target) {
		if(!this.selection.some(test => JSON.stringify(target) == JSON.stringify(test))) {
			this.selection.push(target);
		}
	}
	
	addUndo(reason) {
		this.undoHistory.push(new PlayerData(this.file.serialize(true)));
		this.redoHistory = [];
	}
	undo() {
		if(this.undoHistory.length == 0) return;
		
		this.redoHistory.push(new PlayerData(this.file.serialize(true)));
		this.file = this.undoHistory.pop()
	}
	redo() {
		if(this.redoHistory.length == 0) return;
		
		this.undoHistory.push(new PlayerData(this.file.serialize(true)));
		this.file = this.redoHistory.pop()
	}
	
	uploadVideo(removeAll = false) {
		return new Promise(res => {
			const input = new HTML.input();
			input.type = "file";
			input.onchange = async () => {
				const file = input.files[0];
				if(file) {
					if(removeAll) {
						this.file.videos = [];
					}
					
					this.file.videos.push({
						url: URL.createObjectURL(file),
						blob: file,
						markers: {}
					});
					
					const check = () => {
						this.player.playback.removeEventListener("error", check);
						this.player.playback.removeEventListener("canplaythrough", check);
						
						res(this.player.playback.videoWidth > 0 && this.player.playback.videoHeight > 0);
					}
					
					this.player.playback.addEventListener("error", check);
					this.player.playback.addEventListener("canplaythrough", check);
				}
			}
			input.click();
		})
	}
}

export default Editor