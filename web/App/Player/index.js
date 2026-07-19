import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../lib/SingleInstanceRenderable/index.js";
import App from "../index.js";
import PlayerData from "./PlayerData/index.js";

class Player extends SingleInstanceRenderable {
	setPath(path) {
		this.path = path;
		this.update();
	}
	
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "player"];
	
	// data: video data, markers, etc
	// state: logic / variable storage during playback, not saved (a save feature may be added later)
	data = new PlayerData();
	state = {};
	
	errorText = "Loading video...";
	
	playback = new HTML.video();
	canvas = new HTML.canvas({class: "player-canvas"});
	ctx = this.canvas.getContext("2d");
	
	get currentVideo() {
		const index = this.data?.videos?.findIndex?.(item => item.url == this.playback.src);
		if(index === -1 || index == null) {
			return 0; // just preventing errors. in the event that a video not designated for use with this Player is loaded, use data from the first video in the list
		} else {
			return index;
		}
	}
	set currentVideo(value) {
		this.playback.src = this.data?.videos?.[value]?.url;
	}
	
	get currentVideoData() {
		return this.data?.videos?.[this.currentVideo];
	}
	
	constructor(app, playerData) {
		super();
		this.app = app;
		if(app instanceof App) {
			this.playback.autoplay = true;
		}
		this.playback.addEventListener("loadstart", () => {
			this.errorText = "Loading video...";
			this.update()
		});
		this.playback.addEventListener("canplaythrough", () => {
			this.errorText = "Unknown error during video playback";
			this.update()
		});
		this.playback.addEventListener("loadedmetadata", () => {
			this.errorText = "Unknown error during video playback";
			this.update()
		});
		this.playback.addEventListener("error", () => {
			if(this.data?.videos?.length > 0) {
				this.errorText = "An error occurred while loading this video.";
			} else {
				this.errorText = "";
			}
			this.update();
		});
	}
	
	render() {
		const target = super.render();
		
		target.append(
			this.canvas
		);
		
		if(this.app instanceof App) {
			let pausePlayButton;
			
			target.append(
				new HTML.div({class: "player-overlay"},
					new HTML.div({class: "player-overlay-info"},
						new HTML.div({class: "player-overlay-info-title"}),
						new HTML.div({class: "player-overlay-info-author"})
					),
					new HTML.button({class: "player-overlay-exit-video"},
						new HTML.i({class: "bi bi-x-lg"})
					),
					pausePlayButton = new HTML.button({class: "player-overlay-pause-play"},
						new HTML.i({class: "bi bi-play"})
					)
				)
			);
			
			pausePlayButton.onclick = () => {
				if(this.playback.paused) {
					this.playback.play();
				} else {
					this.playback.pause();
				}
			}
		}
		
		this.update();
		return target;
	}
	async updateRendered(target) {
		await super.updateRendered(target);
		
		const boundingBox = target.getBoundingClientRect();
		
		let aspect,
			aspectInverse;
		
		if(this.playback.videoWidth == 0 || this.playback.videoHeight == 0) {
			// error screens
			aspect = 16 / 9;
			aspectInverse = 9 / 16
		} else {
			aspect = this.playback.videoWidth / this.playback.videoHeight;
			aspectInverse = this.playback.videoHeight / this.playback.videoWidth;
		}
		
		if(boundingBox.width > 0 && boundingBox.height > 0) {
			this.canvas.width = Math.min(boundingBox.width, aspect * boundingBox.height);
			this.canvas.height = Math.min(boundingBox.height, aspectInverse * boundingBox.width);
		} else {
			setTimeout(() => this.update(), 1000);
		}
	}
	
	async fetchById(id) {
		return await this.fetchByURL("/api/v1/data/" + id);
	}
	async fetchByURL(url) {
		this.data = {};
		try {
			const dataOrError = await fetch(url).then(res => res.json());
			
			if(dataOrError && dataOrError.video) {
				this.data = dataOrError;
			} else {
				switch(dataOrError.error) {
					case "nonexistent":
						this.errorText = "This Venture does not exist. Check the link?";
						break;
					case "hidden":
						this.errorText = "This Venture is hidden or private. :(";
						break;
					case "moderated":
						this.errorText = "An admin has removed this Venture. :(";
						break;
					case "unknown":
					case undefined:
						this.errorText = "Sorry, an internal error occurred. :(";
						break;
					default:
						this.errorText = "Internal error, sorry! Code: " + dataOrError.error;
						break;
				}
			}
		} catch(err) {
			this.errorText = "Please reload? Internal error :(";
		}
		this.update();
	}
	
	lastFrameVideoTime = 0; // video.currentTime ; set after animate()
	animate(target) {
		super.animate(target);
		
		const currentURL = new URL(this.data?.videos?.[this.currentVideo]?.url, window.location.href).toString();
		if(!currentURL) {
			this.errorText = "The video could not be played."
		} else {
			if(this.playback.src != currentURL) {
				this.playback.src = currentURL;
			}
		}
		
		if(this.playback.videoWidth == 0 || this.playback.videoHeight == 0) {
			this.ctx.fillStyle = "#000";
			this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
			
			this.ctx.font = this.canvas.height / 12 + "px sans-serif";
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.fillText(this.errorText, this.canvas.width / 2, this.canvas.height / 2);
		} else {
			this.ctx.drawImage(this.playback, 0, 0, this.canvas.width, this.canvas.height);
			
			this.ctx.font = this.canvas.height / 12 + "px sans-serif";
			this.ctx.fillStyle = "#fff";
			this.ctx.textAlign = "left";
			this.ctx.textBaseline = "top";
		}
	}
	
	coordToCanvas(xy) {
		if(!xy.x) xy.x = 0;
		if(!xy.y) xy.y = 0;
		
		return {
			x: this.canvas.width / 2 + (xy.x * this._coordScaleFactor()),
			y: this.canvas.height / 2 + (xy.y * this._coordScaleFactor()),
		};
	}
	canvasToCoord(xy) {
		if(!xy.x) xy.x = 0;
		if(!xy.y) xy.y = 0;
		
		return {
			x: (xy.x - this.canvas.width / 2) / this._coordScaleFactor(),
			y: (xy.y - this.canvas.height / 2) / this._coordScaleFactor()
		};
	}
	// just to reduce reused code in coordToCanvas and canvasToCoord. don't use this
	_coordScaleFactor() {
		return Math.min(this.canvas.width, this.canvas.height) / 2;
	}
	
	isCanvasPointVisible(xy) {
		if(!xy.x) xy.x = 0;
		if(!xy.y) xy.y = 0;
		
		return xy.x >= 0 && xy.y >= 0 && xy.x < this.canvas.width && xy.y < this.canvas.height;
	}
	isCoordPointVisible(xy) {
		return this.isCanvasPointVisible(this.coordToCanvas(xy));
	}
	
	getTrueCanvasBoundingBox() {
		const targetBox = this.canvas.getBoundingClientRect();
		
		const aspect = this.canvas.width / this.canvas.height;
		const aspectInverse = this.canvas.height / this.canvas.width;
		
		const canvasContentWidth = Math.min(targetBox.width, aspect * targetBox.height);
		const canvasContentHeight = Math.min(targetBox.height, aspectInverse * targetBox.width);
		
		const canvasX = targetBox.x + (targetBox.width - canvasContentWidth) / 2;
		const canvasY = targetBox.y + (targetBox.height - canvasContentHeight) / 2;
		
		return {
			x: canvasX,
			y: canvasY,
			left: canvasX,
			top: canvasY,
			width: canvasContentWidth,
			height: canvasContentHeight
		};
	}
	
	mouseEventToCanvasPosition(event) {
		const boundingBox = this.getTrueCanvasBoundingBox();
		
		return {
			x: (event.clientX - boundingBox.x) / boundingBox.width * this.canvas.width,
			y: (event.clientY - boundingBox.y) / boundingBox.height * this.canvas.height
		}
	}
	mouseEventToCoordPosition(event) {
		return this.canvasToCoord(this.mouseEventToCanvasPosition(event));
	}
	
}

export default Player