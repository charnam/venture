import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";
import MarkerAction from "../MarkerAction/index.js";

class MarkerActionList extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-list"]
	
	constructor(editor, marker, actions) {
		super();
		this.editor = editor;
		this.marker = marker;
		this.actions = actions;
	}
	
	render() {
		const target = super.render();
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
		
		for(let index in this.actions) {
			const action = this.actions[index];
			const child = target.children[index];
			if(child?.renderable?.action == action) {
				child.renderable.update();
			} else {
				const markerAction = new MarkerAction(this.editor, this.marker, action, this.actions);
				if(child) {
					child.replaceWith(markerAction.render());
				} else {
					target.append(markerAction.render());
				}
			}
		}
	}
}

export default MarkerActionList;