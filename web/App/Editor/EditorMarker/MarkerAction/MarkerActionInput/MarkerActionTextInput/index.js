import { HTML } from "imperative-html";
import MarkerActionInput from "../index.js";

class MarkerActionTextInput extends MarkerActionInput {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-text-input"]
	
	render() {
		const target = super.render();
		let input;
		
		target.append(
			input = new HTML.input({
				type: "text",
				minlength: this.characteristics.min,
				maxlength: this.characteristics.max
			})
		);
		
		input.oninput = () => {
			this.dataValue = input.value;
			this.updateData();
		}
		
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
		const input = target.querySelector("input");
		
		if(input.value != this.dataValue) {
			input.value = this.dataValue;
		}
	}
	
}

export default MarkerActionTextInput