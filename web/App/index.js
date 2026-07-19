import SingleInstanceRenderable from "../lib/SingleInstanceRenderable/index.js";
import Editor from "./Editor/index.js";
import Player from "./Player/index.js";
import Website from "./Website/index.js";

class App extends SingleInstanceRenderable {
	static getApp() {
		return document.querySelector(".app").renderable;
	}
	
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "app"];
	
	website = new Website(this);
	editor = new Editor(this);
	player = new Player(this);
	
	constructor() {
		super();
		
		window.onpopstate = event => {
			/*
			Editor confirm close dialog. Removed because it was unnecessary
			if(this.displayed == this.editor && !event.state.url.startsWith("#editor")) {
				if(this.editor.undoHistory.length > 0 && !confirm("Are you sure you want to exit the editor? Unsaved changes will be lost!")) {
					//window.history.forward();
					this.setPage("editor");
					return;
				}
			}
			*/
			this.update();
		}
		
		document.onclick = event => {
			if(event.target instanceof HTMLAnchorElement) {
				event.preventDefault();
				this.setPage(event.target.href);
			}
		}
		
	}
	
	render() {
		const target = super.render();
		this.update();
		return target;
	}
	
	displayed = null;
	getShouldDisplay() {
		const displayed = this.getPage().split("/")[0];
		
		switch(displayed) {
			case "website":
			default:
				return this.website;
			
			case "player":
				return this.player;
			
			case "editor":
				return this.editor;
		}
	}
	
	getPage() {
		let url = window.location.pathname.slice(1);
		return url;
	}
	setPage(url) {
		window.history.pushState({}, null, new URL(url, window.location.protocol + "//" + window.location.host));
		this.update();
	}
	
	getPagePath() {
		const arr = this.getPage().split("/");
		arr.shift()
		return arr.join("/");
	}
	
	lastURLCheck = null;
	
	awaitBeforeSwitching = [];
	async updateRendered(target) {
		await super.updateRendered(target);
		
		if(this.lastURLCheck !== window.location.href) {
			const shouldDisplay = this.getShouldDisplay();
			if(shouldDisplay !== this.displayed) {
				await Promise.all(this.awaitBeforeSwitching);
				
				if(this.displayed) {
					this.awaitBeforeSwitching.push(this.displayed.untilRemove())
					this.displayed.remove();
				}
				
				this.displayed = shouldDisplay;
				shouldDisplay.renderTo(target);
			}
			
			this.displayed.setPath(this.getPagePath());
			this.lastURLCheck = window.location.href;
		}
	}
	
}

export default App