import SingleInstanceRenderable from "../../../lib/SingleInstanceRenderable/index.js";

class WebsitePage extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "website-page"]
	
	animateRemoveDuration = 2000;
	render() {
		const target = super.render();
		
		return target;
	}
	
}

export default WebsitePage