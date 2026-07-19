import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../lib/SingleInstanceRenderable/index.js";

class Header extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "website-header"];
	
	constructor(website) {
		super();
		this.website = website;
	}
	
	render() {
		const target = super.render();
		
		let searchbar;
		target.append(
			new HTML.a({class: "website-header-home", href: "/"}, "Venture"),
			new HTML.div({class: "website-header-links"},
				new HTML.a({href: "/explore"}, "Explore"),
				new HTML.a({href: "/about"}, "About"),
				new HTML.a({href: "/editor"}, "Create")
			),
			new HTML.div({class: "website-header-search"},
				searchbar = new HTML.input({
					id: "site-header-searchbar-chrome", // THIS SHOULD NOT BE USED; included to mitigate Chrome's "accessibility" warnings
					class: "website-header-search-input",
					type: "search",
					minlength: 4,
					required: "yes",
					placeholder: "Search here..."
				}),
				new HTML.i({class: "bi bi-search"})
			),
			new HTML.div({class: "website-header-user"},
			)
		);
		
		let timeout = null;
		searchbar.oninput = searchbar.onkeyup = event => {
			if(timeout) clearTimeout(timeout);
			if(!this.website.app.getPage().startsWith("search")) {
				this.website.app.setPage("search");
			}
			timeout = setTimeout(() => {
				this.website.app.setPage("search" + (searchbar.value.length > 0 ? "?q=" + searchbar.value : ""));
			}, event.key == "Enter" ? 0 : 500)
		}
		
		return target;
	}
	
}

export default Header