import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";
import MarkerActionElementBoundsInput from "./MarkerActionInput/MarkerActionElementBoundsInput/index.js";
import PlayerData from "../../../Player/PlayerData/index.js";
import MarkerActionInput from "./MarkerActionInput/index.js";
import MarkerActionTextInput from "./MarkerActionInput/MarkerActionTextInput/index.js";
import MarkerActionExistingElementInput from "./MarkerActionInput/MarkerActionExistingElementInput/index.js";
import MarkerActionDropdownInput from "./MarkerActionInput/MarkerActionDropdownInput/index.js";
import MarkerActionNewElementInput from "./MarkerActionInput/MarkerActionNewElementInput/index.js";

class MarkerAction extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action"]
	
	constructor(editor, marker, action, actionArray) {
		super();
		this.editor = editor;
		this.marker = marker;
		this.action = action;
		this.actionArray = actionArray;
	}
	
	get characteristics() {
		return PlayerData.actions.find(action => action.type == this.action.type);
	}
	
	render() {
		const target = super.render();
		
		target.append(
			new HTML.div({class: "marker-action-inputs"}),
			new HTML.div({class: "marker-action-buttons"})
		)
		
		this.update();
		return target;
	}
	
	updateRendered(target) {
		super.updateRendered(target);
		const buttons = target.querySelector(".marker-action-buttons");
		
		if(this.actionArray) {
			if(!buttons.querySelector(".marker-action-button-delete")) {
				let deleteButton;
				buttons.append(
					deleteButton = new HTML.button({class: "marker-action-button marker-action-button-delete"},
						new HTML.i({class: "bi bi-trash-fill"})
					)
				)
				
				deleteButton.onclick = () => {
					const thisInActionArray = this.actionArray.indexOf(this.action);
					if(thisInActionArray < 0) {
						alert("Could not remove this action, as it appears to no longer exist in the action list. Try selecting another marker, and then going back here.");
					} else {
						this.actionArray.splice(thisInActionArray, 1);
					}
				}
			}
		} else {
			buttons.querySelector(".marker-action-button-delete")?.remove?.();
		}
		
		
		const inputs = target.querySelector(".marker-action-inputs");
		
		let keep = [];
		for(let line = 0; line < Math.max(this.characteristics.editor.length, inputs.children.length); line++) {
			let lineEl = inputs.children[line];
			const lineItems = this.characteristics.editor[line];
			
			if(!lineEl) {
				inputs.append(lineEl = new HTML.div({class: "marker-action-inputline"}));
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
					case "dropdown":
						Input = MarkerActionDropdownInput;
						break;
					case "new_element_id":
						Input = MarkerActionNewElementInput;
						break;
					case "text":
						Input = MarkerActionTextInput;
						break;
					case "existing_element_id":
						Input = MarkerActionExistingElementInput;
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