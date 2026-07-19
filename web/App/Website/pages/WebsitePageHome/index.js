import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";

class WebsitePageHome extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "website-page-home"]
	
	render() {
		const target = super.render();
		
		target.append(
			new HTML.div({class: "website-page-home-featured"},
				new HTML.div({class: "website-page-home-featured-title"},
					
				)
			)
		)
		
		return target;
	}
	
}

export default WebsitePageHome