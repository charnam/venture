import { HTML } from "imperative-html";
import Random from "../../../../../../lib/Random.js";
import MarkerActionTextInput from "../MarkerActionTextInput/index.js";
import VideoState from "../../../../../Player/VideoState/index.js";

class MarkerActionExistingElementInput extends MarkerActionTextInput {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-existing-element-input"];
	
	render() {
		const target = super.render();
		const input = target.querySelector("input");
		
		const boxId = "LIST-"+Random.id();
		
		input.setAttribute("list", boxId);
		
		const list = new HTML.datalist({id: boxId});
		target.append(list);
		
		this.update();
		return target;
	}
	
	lastCurrentTime = null;
	animate(target) {
		super.animate(target);
		
		const videoTime = this.markerAction.editor.player.playback.currentTime;
		if(videoTime !== this.lastCurrentTime) {
			this.update();
			this.lastCurrentTime = videoTime;
		}
	}
	
	updateRendered(target) {
		super.updateRendered(target);
		
		const list = target.querySelector("datalist")
		// update() is fired once before the datalist is added in super.render()
		if(list) {
			list.innerHTML = "";
			
			const defaultState = VideoState.findDefaultStateAtTimestamp(this.markerAction.editor.player, this.markerAction.editor.player.currentVideo, this.markerAction.marker.timestamp)
			for(let id of Object.keys(defaultState.elements)) {
				list.append(new HTML.option({value: id}));
			}
		}
	}
}

export default MarkerActionExistingElementInput;