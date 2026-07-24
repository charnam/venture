
class PlayerElement {
	state = null;
	constructor(state) {
		this.state = state;
	}
	
	keyframes = [];
	
	setExists(bool, timestamp) {
		this.keyframes.push(
			{type: "exists", value: bool, timestamp}
		);
	}
	getExists(timestamp) {
		let keyframes = this.keyframes.filter(keyframe => keyframe.timestamp < timestamp && keyframe.type == "exists");
		return keyframes[keyframes.length - 1]?.value ?? true;
	}
	
	setBounds(bounds, timestamp) {
		this.keyframes.push(
			{type: "bounds", bounds, timestamp, animate: false}
		);
	}
	getBounds(timestamp) {
		let keyframes = this.keyframes.filter(keyframe => keyframe.timestamp < timestamp && keyframe.type == "bounds");
		return keyframes[keyframes.length - 1]?.bounds ?? {x: 0, y: 0, width: 1, height: 1}; // TODO: set width & height to 0 after testing is done
	}
	
	render(player, time) {
		const bounds = this.getBounds(time);
		
		const position = player.coordToCanvas({x: bounds.x, y: bounds.y});
		const size = player.coordToCanvas({x: bounds.width, y: bounds.height}, true);
		
		player.ctx.strokeRect(position.x, position.y, size.x, size.y);
	}
}

export default PlayerElement;