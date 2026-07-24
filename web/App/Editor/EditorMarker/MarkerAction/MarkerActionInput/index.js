import SingleInstanceRenderable from "../../../../../lib/SingleInstanceRenderable/index.js";
import PlayerData from "../../../../Player/PlayerData/index.js";

class MarkerActionInput extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-input"]
	
	markerAction = null;
	get characteristics() {
		return this.markerAction.characteristics.attributes[this.id];
	}
	get type() {
		return this.characteristics.type;
	}
	
	constructor(markerAction, id) {
		super();
		this.markerAction = markerAction;
		this.id = id;
	}
	
	set dataValue(value) {
		this.markerAction.action[this.id] = value;
	}
	get dataValue() {
		return this.markerAction.action[this.id];
	}
	
	get disabled() {
		return !this.updateData;
	}
	set disabled(value) {
		if(value == true) {
			delete this.updateData;
		} else {
			if(this.disabled) throw new Error("Cannot set input value 'disabled' to false after it has already been true");
		}
	}
	
	updateData() {
		
	}
}

export default MarkerActionInput;