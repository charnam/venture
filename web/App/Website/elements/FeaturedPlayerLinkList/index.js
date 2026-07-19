import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";

class FeaturedPlayerLinkList extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, ""]
	
	render() {
		const target = super.render();
		
		return target;
	}
	
}

export default FeaturedPlayerLinkList;