import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";
import MarkerActionElementBoundsInput from "./MarkerActionInput/MarkerActionElementBoundsInput/index.js";
import PlayerData from "../../../Player/PlayerData/index.js";
import MarkerActionInput from "./MarkerActionInput/index.js";
import MarkerActionTextInput from "./MarkerActionInput/MarkerActionTextInput/index.js";

class MarkerAction extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action"]
	
	constructor(editor, action) {
		super();
		this.editor = editor;
		this.action = action;
	}
	
	get characteristics() {
		return PlayerData.actions.find(action => action.type == this.action.type);
	}
	
	render() {
		const target = super.render();
		this.update();
		return target;
	}
	
	updateRendered(target) {
		super.updateRendered(target);
		
		let keep = [];
		for(let line = 0; line < Math.max(this.characteristics.editor.length, target.children.length); line++) {
			let lineEl = target.children[line];
			const lineItems = this.characteristics.editor[line];
			
			if(!lineEl) {
				target.append(lineEl = new HTML.div({class: "marker-action-inputline"}));
			}
			if(!lineItems) {
				lineEl.remove();
				continue;
			}
			
			for(let index = 0; index < Math.max(lineEl.children.length, lineItems.length); index++) {
				let el = lineEl.children[index];
				let item = lineItems[index];
				
				let Input = MarkerActionInput;
				
				switch(this.characteristics.attributes[item?.attribute]?.type) {
					case "new_element_id":
						Input = MarkerActionTextInput;
						break;
					case "element_bounds":
						Input = MarkerActionElementBoundsInput;
						break;
					default:
						break;
				}
				
				if(!el) {
					if(item.attribute) {
						lineEl.append(new Input(this, item.attribute, console.log).render());
					} else if(item.label) {
						lineEl.append(new HTML.label({class: "marker-action-inputline-label"}, item.label))
					}
				} else if(item) {
					if(item.attribute) {
						if(el?.renderable?.id == item.attribute) {
							el.renderable.update()
						} else {
							el.replaceWith(new Input(this, item.attribute, console.log).render());
						}
					} else if(item.label) {
						if(el.tagName == "LABEL") {
							if(el.innerText != item.label) el.innerText = item.label;
						} else {
							el.replaceWith(new HTML.label({class: "marker-action-inputline-label"}, item.label));
						}
					}
				} else {
					el.remove();
				}
			}
		}
	}
	
}

export default MarkerAction