
class Timing {
	static timestamp(secs) {
		var sec_num = parseInt(secs, 10)
		var hours = Math.floor(sec_num / 3600)
		var minutes = Math.floor(sec_num / 60) % 60
		var seconds = sec_num % 60

		return [hours, minutes, seconds]
			.map(v => v < 10 ? "0" + v : v)
			.filter((v, i) => v !== "00" || i > 0)
			.join(":")
	}
	
	deltaStart = Date.now();
	physicsTime = Date.now();
	
	pause() {
		this.pauseTime = this.deltaTime();
	}
	
	unpause() {
		this.deltaStart = Date.now() - this.pauseTime;
		delete this.pauseTime;
	}
	
	physics() {
		this.physicsTime += 5;
		return new Promise(res => setTimeout(res, Math.max(0, this.physicsTime - Date.now())));
	}
	shouldDoPhysics() {
		return this.physicsTime < Date.now();
	}
	
	physicsLoop(cb) {
		while(this.physicsTime < Date.now()) {
			this.physicsTime += 5;
			cb();
		}
	}
	
	deltaTime() {
		return this.pauseTime ?? Date.now() - this.deltaStart;
	}
	deltaTimeSec() {
		return this.deltaTime() / 1000;
	}
	timeSinceKeyPressed(key) {
		return Date.now() - Keyboard.keyPressedAt(key);
	}
	timeSinceKeyPressedSec(key) {
		return this.timeSinceKeyPressed(key) / 1000;
	}
	
	until(sec) {
		return new Promise(res => setTimeout(res, (sec - this.deltaTimeSec()) * 1000));
	}
	
	nextFrame() {
		return new Promise(res => requestAnimationFrame(res));
	}
	
	timeEase(start, end) {
		return (Math.max(start, Math.min(this.deltaTimeSec(), end)) - start) / (end - start);
	}
	scaleEase(value, initial, last) {
		return value * (last - initial) + initial;
	}
	
	timeBetween(start, end, initial, last) {
		return this.scaleEase(this.timeEase(start, end), initial, last);
	}
	
	easeOut(start, end, initial, last) {
		return this.scaleEase(1 - Math.pow(1 - this.timeEase(start, end), 3), initial, last);
	}
	ease(start, end, initial, last) {
		const x = this.timeEase(start, end);
		return this.scaleEase(x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, initial, last);
	}
	easeIn(start, end, initial, last) {
		const x = this.timeEase(start, end);
		return this.scaleEase(x * x * x, initial, last);
	}
	
	atBPM(bpm) {
		const timing = new Timing();
		timing.deltaTime = () => this.deltaTime() / (60 / bpm);
		return timing;
	}
	
	divy(beats) {
		const timing = new Timing();
		timing.deltaTime = () => this.deltaTime() / beats;
		return timing;
	}
	
	toRepeated() {
		const timing = new Timing();
		timing.deltaTime = () => this.deltaTime() % 1000;
		return timing;
	}
	
	withStartTime(startTime) {
		const timing = new Timing();
		timing.deltaTime = () => this.deltaTime() - startTime * 1000;
		return timing;
	}
	
	bound(startTime, endTime) {
		const timing = new Timing();
		timing.deltaTime = () => Math.max(startTime, Math.min(this.deltaTime(), endTime));
		return timing;
	}
}
export default Timing;
