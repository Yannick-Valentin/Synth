var fullPageResize = function(elmt) {
	elmt.width  = window.innerWidth;
	elmt.height = window.innerHeight;
};

var lpf_cutoff_value = 20000,
	lpf_resonance_value = 0,
	lfo_intensity_value = 0.5,
	osc1_waveform = 'sawtooth',
	osc2_waveform = 'square';

var SynthPad = (function() {

	// Variables
	var myCanvas,
		myAudioContext,
		osc1,		
		osc2,		
		gainNode,

		// Notes
		lowNote = 16.35, // C0
		highNote = 261.63; // C4

	// Constructeur
	var SynthPad = function() {
		myCanvas = document.getElementById('synth-pad');

		// Cree le audio context
		myAudioContext = new webkitAudioContext();

		SynthPad.setupSound();
		SynthPad.setupEventListeners();
	};

	// Crée le son
	SynthPad.setupSound = function() {

		osc1 = myAudioContext.createOscillator();
		osc2 = myAudioContext.createOscillator();

		lfo = myAudioContext.createOscillator();
		lfo_intensity = myAudioContext.createGain();
		volume = myAudioContext.createGain();

		/*filter = myAudioContext.createBiquadFilter();
		filter.type = 3;  // In this case it's a lowshelf filter
		filter.frequency.value = 80;
		filter.Q.value = 0;
		filter.gain.value = 0;*/

		filter = myAudioContext.createBiquadFilter();
		filter.type = filter.LOWPASS;
		filter.frequency.value = lpf_cutoff_value;
		filter.Q.value = lpf_resonance_value;


		// Oscillators
		osc1.type = osc1_waveform;
		osc2.type = osc2_waveform;

		osc1.connect(volume);
		osc2.connect(volume);


		// LFO
		lfo.type = 'sine';
		lfo_intensity.gain.value = lfo_intensity_value;

		lfo.connect(lfo_intensity);
		lfo_intensity.connect(volume.gain);

		// Filter
		volume.connect(filter);

		filter.connect(myAudioContext.destination);
	};

	SynthPad.setupEventListeners = function() {
		// Disables scrolling on touch devices.
		/*document.body.addEventListener('touchmove', function(event) {
			event.preventDefault();
		}, false);*/

		document.body.addEventListener('touchmove', function(e) {
			if (e.target.id != 'lpf_cutoff' && e.target.id != 'lpf_resonance' && e.target.id != 'lfo_intensity') {
				e.preventDefault(); 
			}
		}, false);

		myCanvas.addEventListener('mousedown', SynthPad.playSound);
		myCanvas.addEventListener('touchstart', SynthPad.playSound);

		myCanvas.addEventListener('mouseup', SynthPad.stopSound);
		document.addEventListener('mouseleave', SynthPad.stopSound);
		myCanvas.addEventListener('touchend', SynthPad.stopSound);
		myCanvas.addEventListener('mouseout', SynthPad.stopSound);
	};

	// Joue le son
	SynthPad.playSound = function(event) {

		SynthPad.setupSound();

		SynthPad.updateSound(event);

		osc1.start(0);
		osc2.start(0);
		lfo.start(0);

		console.log(osc1.playbackState);

		myCanvas.addEventListener('mousemove', SynthPad.updateSound);
		myCanvas.addEventListener('touchmove', SynthPad.updateSound);
	};

	// Stop le son
	SynthPad.stopSound = function(event) {

		osc1.stop(0);
		osc2.stop(0);
		lfo.stop(0);


		/*myCanvas.removeEventListener('mousemove', SynthPad.updateSound);
		myCanvas.removeEventListener('touchmove', SynthPad.updateSound);
		myCanvas.removeEventListener('mouseout', SynthPad.stopSound);*/
	};


	// Calcule le pitch de la note
	SynthPad.calculateNote = function(posX) {
		var noteDifference = highNote - lowNote;
		var noteOffset = (noteDifference / myCanvas.offsetWidth) * (posX - myCanvas.offsetLeft);
		return lowNote + noteOffset;
	};

	// Calcule le volume
	SynthPad.calculateLfoRate = function(posY) {
		var lfoRate = (1 - (((100 / myCanvas.offsetHeight) * (posY - myCanvas.offsetTop)) / 100)) * 20;
		return lfoRate;

	};


	// Calcule le nouveau son avec le pitch et le volume
	SynthPad.calculateSound = function(x, y) {
		var noteValue = SynthPad.calculateNote(x);
		var lfoRate = SynthPad.calculateLfoRate(y);

		osc1.frequency.value = noteValue;
		osc2.frequency.value = noteValue;
		lfo.frequency.value = lfoRate;
	};

	// Met à jour le son
	SynthPad.updateSound = function(event) {
		if (event.type == 'mousedown' || event.type == 'mousemove') {
			SynthPad.calculateSound(event.x, event.y);
		} else if (event.type == 'touchstart' || event.type == 'touchmove') {
			var touch = event.touches[0];
			SynthPad.calculateSound(touch.pageX, touch.pageY);
		}
	};



	// Export SynthPad.
	return SynthPad;
})();


var canvas = document.getElementById('synth-pad');

// Initialize the page.
window.onload = function() {
	//fullPageResize(canvas);
	synthPad = new SynthPad();
}



lpf_cutoff_range = document.getElementById('lpf_cutoff');
lpf_cutoff_range.onchange = function() {
	lpf_cutoff_value = this.value;
	synthPad.setupSound();
}

lpf_resonance_range = document.getElementById('lpf_resonance');
lpf_resonance_range.onchange = function() {
	lpf_resonance_value = this.value;
}


lfo_intensity_range = document.getElementById('lfo_intensity');
lfo_intensity_range.onchange = function() {
	lfo_intensity_value = this.value / 100;
}

osc1_waveform_select = document.getElementById('osc1_waveform');
osc1_waveform_select.onchange = function() {
	osc1_waveform = this.value;
	console.log(osc1_waveform);
}

osc2_waveform_select = document.getElementById('osc2_waveform');
osc2_waveform_select.onchange = function() {
	osc2_waveform = this.value;
	console.log(osc2_waveform);
}