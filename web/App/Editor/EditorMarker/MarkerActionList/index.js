import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";
import MarkerAction from "../MarkerAction/index.js";

class MarkerActionList extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "marker-action-list"]
	
	constructor(editor, markerActions) {
		super();
		this.editor = editor;
		this.markerActions = markerActions;
	}
	
	render() {
		const target = super.render();
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
		
		for(let index in this.markerActions) {
			const action = this.markerActions[index];
			const child = target.children[index];
			if(child?.renderable?.action == action) {
				child.renderable.update();
			} else {
				const markerAction = new MarkerAction(this.editor, action);
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