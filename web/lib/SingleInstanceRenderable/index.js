import Renderable from "../Renderable/index.js";

class SingleInstanceRenderable extends Renderable {
	style = this.autoStyleByImport(import.meta.url);
	animateRemoveDuration = 0;

	get element() {
		return this.boundTo[0];
	}

	render() {
		if (this.element) {
			if(document.body.contains(this.element)) {
				if(this.isInRemoving(this.element)) {
					this.element.remove();
					this.boundTo = [];
					this.isRemoving = false;
					console.warn("isRemoving (or isRemoving of a parent) is continuing, but still removing element from DOM and re-rendering. This may cause bugs.");
				} else {
					throw new Error("Attempted to re-render existing SingleInstanceRenderable which has not yet been removed.")
				}
			} else {
				this.boundTo = [];
			}
		}
		return super.render();
	}
	
	renderTo(element) {
		const target = this.render();
		element.append(target);
		return target;
	}
	
	async beforeRemove(el) {
		el.classList.add("is-removing")
		await new Promise(res => setTimeout(res, this.animateRemoveDuration));
	}
	
	removeListeners = [];
	isRemoving = false;
	async remove() {
		if(this.isRemoving) return;
		this.isRemoving = true;
		if (this.element) {
			const el = this.element;
			this.boundTo = [];
			await this.beforeRemove(el);
			el.remove();
			for(let listener of this.removeListeners) {
				listener();
			}
		}
		this.isRemoving = false;
	}
	
	untilRemove() {
		return new Promise(res => {
			const tListener = () => {
				this.removeListeners = this.removeListeners.filter(listener => listener !== tListener);
				res();
			}
			this.removeListeners.push(tListener);
		})
	}

}

export default SingleInstanceRenderable;