import { HTML } from "imperative-html";
import MarkerActionInput from "../index.js";

class MarkerActionDropdownInput extends MarkerActionInput {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-dropdown-input"]
	
	render() {
		const target = super.render();
		let input;
		
		target.append(
			input = new HTML.select({class: "marker-action-dropdown"})
		);
		
		input.onchange = () => {
			this.dataValue = this.characteristics.values[input.value].value;
			this.updateData();
		}
		
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
		const input = target.querySelector("select");
		
		input.innerHTML = "";
		for(let [index, item] of Object.entries(this.characteristics.values)) {
			input.append(
				new HTML.option({value: index}, item.label)
			);
		}
		
		if(input.value != this.dataValue) {
			input.value = Object.entries(this.characteristics.values)
				.findIndex(entry => entry[1].value == this.dataValue);
		}
	}
	
}

export default MarkerActionDropdownInput;