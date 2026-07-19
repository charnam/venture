import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../lib/SingleInstanceRenderable/index.js";
import Random from "../../../lib/Random.js";
import PlayerData from "../../Player/PlayerData/index.js";

class EditorMarker extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "editor-marker"]
	
	constructor(editor) {
		super();
		this.editor = editor;
	}
	
	render() {
		const target = super.render();
		
		let deselectedCreateMarkerBtn;
		target.append(
			deselectedCreateMarkerBtn = new HTML.button({class: "editor-marker-deselected"},
				new HTML.i({class: "bi bi-plus"}),
				new HTML.span("You don't have any markers selected.\nCreate a marker by clicking here.")
			),
			new HTML.div({class: "editor-marker-showcount"}, "0 markers selected"),
			new HTML.div({class: "editor-marker-editactions"},
				new HTML.div({class: "editor-marker-editactions-selectaction"}),
				new HTML.div({class: "editor-marker-editactions-actionlist"}),
			)
		);
		
		deselectedCreateMarkerBtn.onclick = () => {
			this.editor.addUndo("add marker");
			const id = Random.id();
			const newMarker = this.editor.player.currentVideoData.markers[id] = {
				timestamp: this.editor.player.playback.currentTime,
				actions: []
			};
			this.editor.clearSelection();
			this.editor.select({type: "marker", video: this.editor.player.currentVideo, id});
		}
		
		return target;
	}
	
	lastPlaybackTime = null;
	lastFrameSelection = null;
	animate(target) {
		super.animate(target);
		
		const selection = this.editor.selection.filter(item => item.type == "marker");
		
		if(selection.length > 1) {
			target.classList.add("editor-marker-show-showcount");
			target.querySelector(".editor-marker-showcount").innerText = selection.length + " markers selected";
		} else {
			target.classList.remove("editor-marker-show-showcount")
		}
		
		if(selection.length == 0) {
			target.classList.add("editor-marker-show-deselected");
		} else {
			target.classList.remove("editor-marker-show-deselected");
		}
		
		if(selection.length == 1) {
			target.classList.add("editor-marker-show-editactions");
			const selectedItem = selection[0];
			const marker = this.editor.file.videos[selectedItem.video].markers[selectedItem.id];
			
			if(marker.actions.length == 0) {
				target.classList.add("editor-marker-show-editactions-selectaction")
			}
		} else {
			target.classList.remove("editor-marker-show-editactions");
		}
		
		if(this.lastFrameSelection !== selection[0] || this.lastPlaybackTime !== this.editor.player.playback.currentTime) {
			this.update();
		}
		this.lastFrameSelection = selection[0];
		this.lastPlaybackTime = this.editor.player.playback.currentTime;
	}
	
	updateRendered(target) {
		super.updateRendered(target);
		
		if(this.editor.selection?.[0] && this.editor.selection[0].type == "marker") {
			const selectedMarker = this.editor.file.videos[this.editor.selection[0].video].markers[this.editor.selection[0].id];
			
			const selectAction = target.querySelector(".editor-marker-editactions-selectaction");
			for(let possibleAction of PlayerData.actions) {
				let existing = selectAction.querySelector("[actiontype=\"" + possibleAction.type + "\"]");
				if(!existing) {
					selectAction.append(
						existing = new HTML.button({
							class: "editor-marker-editactions-selectaction-action",
							actiontype: possibleAction.type
						},
							new HTML.i({class: possibleAction.icon}),
							new HTML.span(possibleAction.name)
						)
					)
				}
				
				existing.onclick = () => {
					selectedMarker.actions.push({
						type: possibleAction.type
					})
				}
				
				if(possibleAction.canBeAdded == undefined || possibleAction.canBeAdded === true) {
					existing.removeAttribute("disabled");
				} else if(typeof possibleAction.canBeAdded == "function") {
					if(possibleAction.canBeAdded(this.editor.file, this.editor.selection[0].video, selectedMarker)) {
						existing.removeAttribute("disabled");
					} else {
						existing.setAttribute("disabled", "")
					}
				} else {
					existing.setAttribute("disabled", "");
				}
			}
			
			const actionList = target.querySelector(".editor-marker-editactions-actionlist");
			actionList.innerHTML = "";
			for(let action of selectedMarker.actions) {
				actionList.append(
					new HTML.div(JSON.stringify(action))
				)
			}
		}
	}
	
}

export default EditorMarker