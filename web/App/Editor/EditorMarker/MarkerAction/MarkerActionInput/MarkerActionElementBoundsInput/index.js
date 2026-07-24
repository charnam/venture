import { HTML } from "imperative-html";
import MarkerActionInput from "../index.js";

class MarkerActionElementBoundsInput extends MarkerActionInput {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-element-bounds-input"];
	
	render() {
		const target = super.render();
		let button;
		
		target.append(
			button = new HTML.button()
		)
		
		button.onclick = async () => {
			this.dataValue = null;
			this.update();
			this.dataValue = await this.markerAction.editor.player.editorGetBounds();
			this.updateData();
			this.update();
		}
		
		button.onmouseover = () => {
			if(this.dataValue) {
				this.markerAction.editor.player.showBounds = this.dataValue;
			}
		}
		button.onmouseout = () => {
			if(this.markerAction.editor.player.showBounds == this.dataValue) {
				delete this.markerAction.editor.player.showBounds;
			}
		}
		
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
		
		const checkVal = val => Number.isFinite(val);
		
		if(this.dataValue && checkVal(this.dataValue.x) && checkVal(this.dataValue.y) && checkVal(this.dataValue.width) && checkVal(this.dataValue.height)) {
			target.querySelector("button").innerText =
				`${this.dataValue.x.toFixed(3)},${this.dataValue.y.toFixed(3)} ${this.dataValue.width.toFixed(3)}x${this.dataValue.height.toFixed(3)}`;
		} else {
			target.querySelector("button").innerText = "Select bounds";
		}
	}
	
}

export default MarkerActionElementBoundsInput