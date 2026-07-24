
class PlayerState {
	get timestamp() {
		if(this.player) {
			return this.player.playback.currentTime;
		} else {
			return 0;
		}
	}
	set timestamp(value) {
		if(this.player) {
			this.player.playback.currentTime = value;
		}
	}
	
	constructor(player) {
		this.player = player;
	}
	
	elements = {};
	variables = {};
	keyboard = {};
}

export default PlayerState;