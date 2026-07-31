import { HTML } from "imperative-html";
import Random from "../../../../../../lib/Random.js";
import MarkerActionTextInput from "../MarkerActionTextInput/index.js";
import VideoState from "../../../../../Player/VideoState/index.js";

class MarkerActionNewElementInput extends MarkerActionTextInput {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-new-element-input"];
	
	// super.render() already calls update() once for us, so we don't need to
	// write a custom render() here. yay!!!
	
	updateRendered(target) {
		super.updateRendered(target);
		
		if(!this.dataValue) {
			const defaultState = VideoState.findDefaultStateAtTimestamp(this.markerAction.editor.player, this.markerAction.editor.player.currentVideo, this.markerAction.editor.player.playback.duration);
			
			const input = target.querySelector("input");
			let i = 1;
			while(defaultState.elements["element" + i]) i++;
			
			this.dataValue = "element" + i;
			this.update();
		}
	}
}

export default MarkerActionNewElementInput;