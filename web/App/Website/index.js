import SingleInstanceRenderable from "../../lib/SingleInstanceRenderable/index.js";
import Header from "./Header/index.js";

class Website extends SingleInstanceRenderable {
	setPath(path) {
		this.path = path;
		this.update();
	}
	
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "website"];
	
	animateRemoveDuration = 1000;
	
	constructor(app) {
		super();
		this.app = app;
	}
	
	render() {
		const target = super.render();
		
		target.append(
			new Header(this).render()
		);
		
		return target;
	}
	
}

export default Website