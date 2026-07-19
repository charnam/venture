import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../../lib/SingleInstanceRenderable/index.js";

class PlayerLink extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "website-element-player-link"];
	
	constructor(app, playerData) {
		super();
		this.app = app;
		this.playerData = playerData;
	}
	
	render() {
		const target = super.render();
		
		let preview;
		
		target.classList.add("website-element-player-link-not-loaded");
		target.append(
			preview = new HTML.img({class: "website-element-player-link-preview"}),
			new HTML.span({class: "website-element-player-link-title"}, this.playerData.title),
			new HTML.img({class: "website-element-player-link-author-icon"}),
			new HTML.span({class: "website-element-player-link-author-name"})
		);
		
		preview.onload = () => {
			target.classList.remove("website-element-player-link-not-loaded");
		}
		
		this.update();
		return target;
	}
	
	async updateRendered(target) {
		await super.updateRendered(target);
		const preview = target.querySelector(".website-element-player-link-preview");
		const title = target.querySelector(".website-element-player-link-title");
		const authorIcon = target.querySelector(".website-element-player-link-author-icon");
		const authorName = target.querySelector("website-element-player-link-author-name");
		
	}
	
}

export default PlayerLink