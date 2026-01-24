class Sound{
	constructor(){
		this.vol = new Tone.Volume(-12).toDestination();
	}
	
	playTone(frequency, env, duration){
		new Tone.Oscillator(frequency, env).connect(this.vol).start().stop("+"+duration);
	}
}