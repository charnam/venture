import { HTML } from "imperative-html";
import Local from "../Local.js";

class Renderable {
	DEBUG = false;
	
	style = this.autoStyleByImport(import.meta.url);
	_classes = ["renderable"];
	set classes(val) {
		this._classes = val;
		this.update();
	}
	get classes() {
		return this._classes;
	}
	
	boundTo = [];
	render() {
		const target = new HTML.div({class: "is-renderable is-loading-style"});
		target.renderable = this;
		
		if(this.DEBUG) {
			target.classList.add("is-debug-target");
		}
		
		Promise.all(this.style.map(style => this.loadStyle(style))).then(() => {
			setTimeout(() => {
				target.classList.remove("is-loading-style");
			}, 10);
		});
		
		if(this.DEBUG) {
			console.log("Created attached instance of %s at %s", this.constructor.name, new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", fractionalSecondDigits: 3 }), target);
		}
		
		for(let cl of this.classes) {
			target.classList.add(cl);
		}
		this.boundTo.push(target);
		
		// TODO: Fix possible race condition with rendered element not immediately put into document?
		requestAnimationFrame(() => {
			this._animateLoop(target)
		})
		
		return target;
	}
	
	update() {
		//this.boundTo = this.boundTo.filter(item => document.body.contains(item));
		return Promise.all(this.boundTo.map(target => target ? this.updateRendered(target) : true));
	}
	
	updateRendered(el) {
		if(this.DEBUG) {
			console.log("Updated attached instance of %s at %s", this.constructor.name, new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", fractionalSecondDigits: 3 }), el);
		}
		for(let cl of this.classes) {
			el.classList.add(cl);
		}
	}
	isInRemoving(target) {
		let parent = target;
		while(!parent.classList.contains("is-removing") && parent !== document.body) {
			parent = parent.parentElement;
		}
		return parent !== document.body;
	}
	
	// NEW ADDITION
	_animateLoop(target) {
		if(document.body.contains(target) && !this.isInRemoving(target)) {
			this.animate(target);
			requestAnimationFrame(() => {
				this._animateLoop(target)
			});
		}
	}
	animate(target) {
		
	}
	
	autoStyleByImport(metaURL) {
		let styleURL = Local.byMeta(metaURL, "main.css");
		return [...(this.style ?? []), styleURL];
	}
	
	async loadStyle(style) {
		await new Promise(res => {
			const thisStyle = style;
			const styleElements = document.querySelectorAll("link[rel=\"stylesheet\"]");
			
			if (![...styleElements].some(element => element.getAttribute("href") == thisStyle)) {
				const link = new HTML.link({ rel: "stylesheet", href: thisStyle });
				document.head.appendChild(link);
				link.onload = link.onerror = () => res();
			} else {
				res();
			}
		});
	}

}

export default Renderable;