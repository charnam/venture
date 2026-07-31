import PlayerData from "../PlayerData/index.js";

class VideoState {
	get isInUse() {
		return this.player && this.player.currentVideo == this.videoId;
	}
	
	get timestamp() {
		if(this.useTimestamp) {
			return this.useTimestamp;
		} else if(this.isInUse) {
			return this.player.playback.currentTime;
		} else {
			return 0;
		}
	}
	set timestamp(value) {
		if(this.isInUse) {
			this.player.playback.currentTime = value;
		}
	}
	get video() {
		return this.player.data.videos[this.videoId];
	}
	
	constructor(player, videoId) {
		this.player = player;
		this.videoId = videoId;
	}
	
	elements = {};
	variables = {};
	//keyboard = this.player.keyboard;
	
	initialKeyframeEvaluation(keyframes) {
		
	}
	
	lastFrameTimestamp = 0;
	handleFrame(settings = {}) {
		if(!this.lastFrameTimestamp) {
			this.lastFrameTimestamp = -999;
		}
		
		const keyframesPassed =
			Object.entries(this.video.markers)
				.filter(keyframe => keyframe[1].timestamp <= this.timestamp && keyframe[1].timestamp > this.lastFrameTimestamp)
				.sort((a,b) => a[1].timestamp - b[1].timestamp);
		
		for(let [id, keyframe] of keyframesPassed) {
			if(settings?.ignoreKeyframes?.includes?.(id)) {
				continue;
			}
			
			if(keyframe.actions) {
				if(!PlayerData.validateActions(keyframe.actions)) {
					console.log("Failed to validate marker", keyframe.actions);
					continue;
				}
				for(let action of keyframe.actions) {
					const actionSignature = PlayerData.actions.find(actionSignature => actionSignature.type == action.type);
					actionSignature.execute(this, action, settings)
				}
			}
		}
		
		this.lastFrameTimestamp = Math.max(this.timestamp, this.lastFrameTimestamp);
	}
	
	static findDefaultStateAtTimestamp(player, videoId, timestamp, settings = {}) {
		const state = new VideoState(player, videoId);
		state.useTimestamp = timestamp;
		state.handleFrame({...settings, isPreLoading: true});
		return state;
	}
}

export default VideoState;