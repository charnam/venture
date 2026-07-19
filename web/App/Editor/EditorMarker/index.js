import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../lib/SingleInstanceRenderable/index.js";
import Random from "../../../lib/Random.js";

class EditorMarker extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "editor-marker", "editor-marker-deselected"]
	
	constructor(editor) {
		super();
		this.editor = editor;
	}
	
	render() {
		const target = super.render();
		
		let deselectedCreateMarkerBtn;
		target.append(
			deselectedCreateMarkerBtn = new HTML.button({class: "editor-marker-deselected-msg"},
				new HTML.i({class: "bi bi-plus"}),
				new HTML.span("You don't have any markers selected.\nCreate a marker by clicking here.")
			),
			new HTML.div({class: "editor-marker-showcount-text"}, "0 markers selected")
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
	
	animate(target) {
		super.animate(target);
		
		const selection = this.editor.selection.filter(item => item.type == "marker");
		
		if(selection.length > 1) {
			target.classList.add("editor-marker-showcount");
			target.querySelector(".editor-marker-showcount-text").innerText = selection.length + " markers selected";
		} else {
			target.classList.remove("editor-marker-showcount")
		}
		
		if(selection.length == 0) {
			target.classList.add("editor-marker-deselected");
		} else {
			target.classList.remove("editor-marker-deselected");
		}
		
		if(selection.length == 1) {
			target.classList.add("editor-marker-edit-actions");
		}
	}
	
	updateRendered(target) {
		super.updateRendered(target);
	}
	
}

export default EditorMarker