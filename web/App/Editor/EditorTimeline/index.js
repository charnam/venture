import { HTML } from "imperative-html";
import SingleInstanceRenderable from "../../../lib/SingleInstanceRenderable/index.js";
import Timing from "../../../lib/Timing.js";
import Formatting from "../../../lib/Formatting.js";

class EditorTimeline extends SingleInstanceRenderable {
	style = this.autoStyleByImport(import.meta.url);
	classes = [...this.classes, "editor-timeline"]
	
	zoomLevel = 1;
	
	constructor(editor) {
		super();
		this.editor = editor;
		window.addEventListener("resize", () => this.update());
	}
	
	render() {
		const target = super.render();
		
		let playButton,
			previewButton,
			scroller,
			scrollerBackground,
			scrollerPlaybar,
			seekForwardButton,
			seekBackwardButton,
			toStartButton,
			toEndButton;
		
		target.append(
			new HTML.div({class: "editor-timeline-sidebar"},
				playButton = new HTML.button({class: "editor-timeline-sidebar-button", title: "Play/Pause"},
					new HTML.i({class: "editor-timeline-sidebar-button-pauseplay-icon bi bi-play-fill"})
				),
				previewButton = new HTML.button({class: "editor-timeline-sidebar-button", title: "Preview Mode"},
					new HTML.i({class: "editor-timeline-sidebar-button-preview-icon bi bi-eye"})
				),
				/*new HTML.button({class: "editor-timeline-playback-sidebar-button"},
					new HTML.i({class: "bi bi-play"})
				),*/
			),
			scroller = new HTML.div({class: "editor-timeline-scroller"},
				scrollerBackground = new HTML.div({class: "editor-timeline-scroller-background"}),
				scrollerPlaybar = new HTML.div({class: "editor-timeline-scroller-playbar"},
					new HTML.div({class: "editor-timeline-scroller-playbar-digits"}),
					new HTML.div({class: "editor-timeline-scroller-playbar-playhead"}),
				),
				new HTML.div({class: "editor-timeline-scroller-markers"}),
				new HTML.div({class: "editor-timeline-scroller-playhead"}),
			)
		);
		
		scrollerBackground.onmousedown =
		scrollerPlaybar.onmousedown = startEvent => {
			if(!startEvent.shiftKey && !startEvent.ctrlKey) {
				this.editor.clearSelection();
			}
			
			// These lines reduce bugs in edge-cases where the visual selection box still exists after the user
			// has already released the mouse
			for(let selection of target.querySelectorAll(".editor-timeline-scroller-selection-box")) {
				selection.remove();
			}
			
			const timelinePosA = this.mouseEventToTimelinePos(target, event);
			
			let selectionBox = null;
			window.onmousemove = event => {
				if(Math.abs(event.clientX - startEvent.clientX) > 20) {
					if(!selectionBox) {
						selectionBox = new HTML.div({class: "editor-timeline-scroller-selection-box"});;
						scroller.append(selectionBox);
					}
				}
				
				if(selectionBox) {
					const timelinePosB = this.mouseEventToTimelinePos(target, event);
					
					const timelinePosStart = Math.min(timelinePosA, timelinePosB);
					const timelinePosEnd   = Math.max(timelinePosA, timelinePosB);
					
					selectionBox.style.setProperty("--start-sec", timelinePosStart);
					selectionBox.style.setProperty("--end-sec", timelinePosEnd);
				}
			}
			
			window.onmouseup = () => {
				window.onmousemove = null;
				window.onmouseup = null;
				
				if(selectionBox) {
					const rect = selectionBox.getBoundingClientRect();
					for(let marker of target.querySelectorAll(".editor-timeline-scroller-marker[markerid]")) {
						const markerRect = marker.getBoundingClientRect();
						if(rect.left < markerRect.right && rect.right > markerRect.left) {
							this.editor.select({type: "marker", video: this.editor.player.currentVideo, id: marker.getAttribute("markerid")})
						}
					}
					selectionBox.remove();
				}
			}
		}
		
		playButton.onclick = () => {
			if(this.editor.player.playback.paused) {
				this.editor.player.playback.play();
			} else {
				this.editor.player.playback.pause();
			}
		}
		
		let timeBeforePreview = null;
		previewButton.onclick = () => {
			this.editor.preview = !this.editor.preview;
			if(this.editor.preview) {
				timeBeforePreview = this.editor.player.playback.currentTime;
				this.editor.player.playback.play();
			} else {
				this.editor.player.playback.pause();
				if(timeBeforePreview !== null) {
					this.editor.player.playback.currentTime = timeBeforePreview;
					timeBeforePreview = null;
				}
			}
		}
		
		// Zoom in/out
		target.addEventListener("wheel", async event => {
			if(event.ctrlKey && !event.shiftKey) {
				event.preventDefault();
				
				// This is slow. TODO: Don't use getBoundingClientRect when zooming in on the timeline
				const scrollerX = scroller.getBoundingClientRect().x;
				const fullMouseX = (event.clientX + scroller.scrollLeft - scrollerX) / scroller.scrollWidth;
				
				this.zoomLevel /= 1 + Math.min(Math.max(-30, event.deltaY), 30) / 100;
				
				await this.update();
				
				scroller.scrollLeft = fullMouseX * scroller.scrollWidth + scrollerX - event.clientX;
			}
		}, {passive: false})
		
		const playbar = target.querySelector(".editor-timeline-scroller-playbar");
		
		playbar.addEventListener("mousedown", event => {
			const updateTime = event => {
				const boundingBox = playbar.getBoundingClientRect();
				this.editor.player.playback.currentTime = (event.clientX - boundingBox.x) / boundingBox.width * this.editor.player.playback.duration;
			}
			
			updateTime(event);
			window.onmousemove = updateTime;
			window.onmouseup = () => {
				window.onmousemove = null;
				window.onmouseup = null;
			}
		});
		
		
		this.update();
		return target;
	}
	
	mouseEventToTimelinePos(target, event) {
		const scroller = target.querySelector(".editor-timeline-scroller");
		const scrollerX = scroller.getBoundingClientRect().x;
		return (event.clientX + scroller.scrollLeft - scrollerX) / scroller.scrollWidth * this.editor.player.playback.duration;
	}
	
	animate(target) {
		super.animate(target);
		const loadedVideo = this.editor.player.currentVideoData;
		
		if(loadedVideo) {
			const scroller = target.querySelector(".editor-timeline-scroller");
			const pausePlay = target.querySelector(".editor-timeline-sidebar-button-pauseplay-icon")
			if(this.editor.player.playback.paused) {
				pausePlay.classList.remove("bi-pause-fill");
				pausePlay.classList.add("bi-play-fill");
			} else {
				pausePlay.classList.remove("bi-play-fill");
				pausePlay.classList.add("bi-pause-fill");
			}
			
			const previewButton = target.querySelector(".editor-timeline-sidebar-button-preview-icon")
			if(this.editor.preview) {
				previewButton.classList.remove("bi-eye");
				previewButton.classList.add("bi-eye-fill");
			} else {
				previewButton.classList.remove("bi-eye-fill");
				previewButton.classList.add("bi-eye");
			}
			
			if(this.zoomLevel == this.getMinZoom(target)) {
				scroller.style.overflowX = "hidden";
				if(scroller.scrollLeft > 0)
					scroller.scrollLeft = 0;
			} else {
				scroller.style.overflowX = "";
			}
			
			target.style.setProperty("--playback-time", this.editor.player.playback.currentTime);
			target.style.setProperty("--playback-duration", this.editor.player.playback.duration);
			const pxPerSecond = this.getPxPerSecond();
			
			const targetZoomLevel = (2 ** -Math.log2(this.zoomLevel));
			const secondIncrement = Formatting.roundToNearest(targetZoomLevel, [
				0.01,
				0.025,
				0.05,
				0.1,
				0.25,
				0.5,
				1,
				2,
				5,
				10,
				15,
				60,
				60*5,
				60*10,
				60*15,
				60*60
			]);
			
			let keep = [];
			for(let i = 0; i < this.editor.player.playback.duration; i+=secondIncrement) {
				const markerGuideLineX = i * pxPerSecond;
				const existingLine = document.querySelector(".editor-timeline-scroller-background-line[lineid=\"" + i + "\"]");
				const existingDigit = document.querySelector(".editor-timeline-scroller-playbar-digit[lineid=\"" + i + "\"]");
				
				const screenX = markerGuideLineX - target.querySelector(".editor-timeline-scroller").scrollLeft;
				if(screenX > 0 && screenX < window.innerWidth) {
					if(existingLine) {
						keep.push(existingLine);
					} else {
						const line = new HTML.div({
							class: "editor-timeline-scroller-background-line",
							lineid: i,
							style: "--x-sec: " + i + ";"
						});
						
						target.querySelector(".editor-timeline-scroller-background").append(line);
						keep.push(line);
					}
					
					if(existingDigit) {
						keep.push(existingDigit);
					} else {
						const digit = new HTML.div({
							class: "editor-timeline-scroller-playbar-digit",
							lineid: i,
							style: "--x-sec: " + i + ";"
						}, parseFloat(i.toFixed(2)));
						
						target.querySelector(".editor-timeline-scroller-playbar-digits").append(digit);
						keep.push(digit);
					}
				}
			}
			
			{
				const playhead = target.querySelector(".editor-timeline-scroller-playbar-playhead");
				playhead.innerText = Timing.timestamp(this.editor.player.playback.currentTime);
				
				const pxPerSecond = this.getPxPerSecond();
				
				playhead.style.transform =
					"translateX(" +
						-((this.editor.player.playback.currentTime - (scroller.scrollLeft / pxPerSecond)) / (scroller.clientWidth / pxPerSecond)) * 100
					+ "%)";
			}
			
			const markersEl = target.querySelector(".editor-timeline-scroller-markers");
			for(let [id, marker] of Object.entries(loadedVideo.markers)) {
				let markerEl = markersEl.querySelector("[markerid=\"" + id + "\"]");
				if(!markerEl) {
					markersEl.append(
						markerEl = new HTML.div({
							class: "editor-timeline-scroller-marker",
							markerid: id
						})
					)
					
					markerEl.onmousedown = startEvent => {
						const markerSelection = {type: "marker", video: this.editor.player.currentVideo, id}
						if((startEvent.ctrlKey || startEvent.shiftKey) && this.editor.selection.some(item => item.type == "marker" && item.id == id)) {
							this.editor.selection = this.editor.selection.filter(item => item.type !== "marker" || item.id !== id);
							return;
						}
						
						let oldSelectionLength = this.editor.selection.length;
						this.editor.select(markerSelection);
						
						let oldSelection = structuredClone(this.editor.selection);
						
						if(!startEvent.ctrlKey && !startEvent.shiftKey) {
							this.editor.clearSelection();
						}
						
						this.editor.select(markerSelection);
						
						if(oldSelectionLength == this.editor.selection.length) {
							oldSelection = this.editor.selection;
						}
						
						let isMovingMarker = false;
						let startMovePlaybackTime = this.editor.player.playback.currentTime;
						let lastFullMouseX = null;
						const handleMovement = window.onmousemove = window.onwheel = event => {
							if(!isMovingMarker) {
								if(Math.abs(event.clientX - startEvent.clientX) > 10) {
									isMovingMarker = true;
									this.editor.selection = oldSelection;
									this.editor.addUndo("move marker(s)");
								}
							}
							
							const scrollerX = scroller.getBoundingClientRect().x;
							const fullMouseX = (event.clientX + scroller.scrollLeft - scrollerX) / scroller.scrollWidth;
							lastFullMouseX = lastFullMouseX ?? fullMouseX;
							
							if(isMovingMarker) {
								for(let item of this.editor.selection.filter(item => item.type == "marker")) {
									if(item.video == this.editor.player.currentVideo) {
										console.log(item.id, this.editor.player.currentVideoData)
										this.editor.player.currentVideoData.markers[item.id].timestamp += (fullMouseX - lastFullMouseX) * this.editor.player.playback.duration;
									}
								}
								
								this.editor.player.playback.currentTime = marker.timestamp;
								lastFullMouseX = fullMouseX;
							}
						}
						handleMovement(startEvent);
						
						window.onmouseup = () => {
							/*if(!startEvent.ctrlKey && !startEvent.shiftKey) {
								for(let i = 0; i < this.editor.selection.length; i++) {
									const item = this.editor.selection[i];
									if(item.id == id) {
										this.editor.clearSelection();
										this.editor.select(item);
										break;
									}
								}
							}*/
							window.onmousemove = window.onwheel = null;
							this.editor.player.playback.currentTime = startMovePlaybackTime;
						}
					}
				}
				
				keep.push(markerEl);
				markerEl.style.setProperty("--x-sec", marker.timestamp);
			}
			
			for(let line of target.querySelectorAll(".editor-timeline-scroller-background-line")) {
				if(!keep.includes(line)) {
					line.remove();
				}
			}
			for(let digit of target.querySelectorAll(".editor-timeline-scroller-playbar-digit")) {
				if(!keep.includes(digit)) {
					digit.remove();
				}
			}
			for(let marker of target.querySelectorAll(".editor-timeline-scroller-marker")) {
				if(!keep.includes(marker)) {
					marker.remove();
				}
			}
			
		}
	}
	
	getPxPerSecond() {
		return 100 * this.zoomLevel;
	}
	getMinZoom(target) {
		const minZoom = target.querySelector(".editor-timeline-scroller").clientWidth / this.editor.player.playback.duration / 100;
		return (isNaN(minZoom) || !minZoom) ? 0.01 : minZoom;
	}
	getMaxZoom(target) {
		return 10;
	}
	async updateRendered(target) {
		this.zoomLevel = Math.max(this.zoomLevel, this.getMinZoom(target));
		this.zoomLevel = Math.min(this.zoomLevel, this.getMaxZoom(target));
		target.style.setProperty("--px-per-second", this.getPxPerSecond() + "px");
		
		await super.updateRendered(target);
	}
}

export default EditorTimeline