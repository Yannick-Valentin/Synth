var fullPageResize = function(elmt) {
	elmt.width  = window.innerWidth;
	elmt.height = window.innerHeight;
};


var SynthPad = (function() {

	// Variables
	var myCanvas,
		myAudioContext,
		oscillator,
		gainNode,

		// Notes
		lowNote = 261.63, // C4
		highNote = 493.88; // B4

	// Constructor
	var SynthPad = function() {
		myCanvas = document.getElementById('synth-pad');

		// Create an audio context.
		myAudioContext = new webkitAudioContext();

		SynthPad.setupEventListeners();
	};

	SynthPad.setupEventListeners = function() {
		// Disables scrolling on touch devices.
		document.body.addEventListener('touchmove', function(event) {
			event.preventDefault();
		}, false);

		myCanvas.addEventListener('mousedown', SynthPad.playSound);
		myCanvas.addEventListener('touchstart', SynthPad.playSound);

		myCanvas.addEventListener('mouseup', SynthPad.stopSound);
		document.addEventListener('mouseleave', SynthPad.stopSound);
		myCanvas.addEventListener('touchend', SynthPad.stopSound);
	};

	SynthPad.playSound = function(event) {
		oscillator = myAudioContext.createOscillator();
		gainNode = myAudioContext.createGainNode();

		oscillator.type = 'triangle';

		gainNode.connect(myAudioContext.destination);
		oscillator.connect(gainNode);

		SynthPad.updateFrequency(event);

		oscillator.start(0);

		myCanvas.addEventListener('mousemove', SynthPad.updateFrequency);
		myCanvas.addEventListener('touchmove', SynthPad.updateFrequency);

		myCanvas.addEventListener('mouseout', SynthPad.stopSound);
	};

	SynthPad.stopSound = function(event) {
		oscillator.stop(0);

		myCanvas.removeEventListener('mousemove', SynthPad.updateFrequency);
		myCanvas.removeEventListener('touchmove', SynthPad.updateFrequency);
		myCanvas.removeEventListener('mouseout', SynthPad.stopSound);
	};

	// Calculate the note frequency.
	SynthPad.calculateNote = function(posX) {
		var noteDifference = highNote - lowNote;
		var noteOffset = (noteDifference / myCanvas.offsetWidth) * (posX - myCanvas.offsetLeft);
		return lowNote + noteOffset;
	};

	SynthPad.calculateVolume = function(posY) {
		var volumeLevel = 1 - (((100 / myCanvas.offsetHeight) * (posY - myCanvas.offsetTop)) / 100);
		return volumeLevel;
	};

	// Fetch the new frequency and volume.
	SynthPad.calculateFrequency = function(x, y) {
		var noteValue = SynthPad.calculateNote(x);
		var volumeValue = SynthPad.calculateVolume(y);

		oscillator.frequency.value = noteValue;
		gainNode.gain.value = volumeValue;
	};

	SynthPad.updateFrequency = function(event) {
		if (event.type == 'mousedown' || event.type == 'mousemove') {
			SynthPad.calculateFrequency(event.x, event.y);
		} else if (event.type == 'touchstart' || event.type == 'touchmove') {
			var touch = event.touches[0];
			SynthPad.calculateFrequency(touch.pageX, touch.pageY);
		}
	};

	// Export SynthPad.
	return SynthPad;
})();


var canvas = document.getElementById('synth-pad');

// Initialize the page.
window.onload = function() {
	fullPageResize(canvas);
	var synthPad = new SynthPad();
}