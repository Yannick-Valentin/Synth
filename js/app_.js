var fullPageResize = function(elmt) {
	elmt.width  = window.innerWidth;
	elmt.height = window.innerHeight;
};


function SynthPad() {

	// Variables
	var myCanvas = document.getElementById('synth-pad'),
		myCanvasWrapper = document.getElementById('synth-pad-wrapper'),
		finger = document.getElementById('finger'),
		context,
		osc1,		
		osc1_volume,
		osc2,
		osc2_volume,
		osc2_detune,
		lfo,
		lfo_intensity,
		filter,
		reverb,
		master,
		gainNode,
		isPlaying = false,

		//
		osc1_waveform_select = document.getElementsByName('osc1_waveform'),
		osc1_volume_range = document.getElementById('osc1_volume'),
		//osc1_waveform = osc1_waveform_select.value,
		osc2_waveform_select = document.getElementsByName('osc2_waveform'),
		osc2_volume_range = document.getElementById('osc2_volume'),
		osc2_detune_range = document.getElementById('osc2_detune'),
		//osc2_waveform = osc2_waveform_select.value,

		lpf_cutoff_range = document.getElementById('lpf_cutoff'),
		//lpf_cutoff_value = lpf_cutoff_range.value;

		lpf_resonance_range = document.getElementById('lpf_resonance'),

		//orientation_toggle = document.getElementById('orientation_toggle'),

		//lpf_resonance_value = lpf_resonance_range.value;
		lfo_intensity_range = document.getElementById('lfo_intensity'),
		//lfo_intensity_value = lfo_intensity_range.value,

		// Notes
		lowNote = 1, // C0
		highNote = 261.63; // C4

	// Constructeur
	this.init = function() {

		// Cree le audio context
		if (typeof AudioContext !== 'undefined') {
			context = new AudioContext();
		} else if (typeof webkitAudioContext !== 'undefined') {
			context = new webkitAudioContext();
		} else {
			alert('Web Audio API is not supported in this browser');
		}

		// Desactive le scroll sur iOs
		document.body.addEventListener('touchmove', function(e) {
			if (e.target.id != 'osc1_volume' && e.target.id != 'osc2_volume' && e.target.id != 'osc2_detune' && e.target.id != 'lpf_cutoff' && e.target.id != 'lpf_resonance' && e.target.id != 'lfo_intensity') {
				e.preventDefault(); 
			}
		}, false);

		this.setupSound;


		// Changement du cutoff du filtre
		lpf_cutoff_range.onchange = function() {
			SynthPad.changeLPFcutoff(this.value);
		}

		// Changement de la resonance du filtre
		lpf_resonance_range.onchange = function() {
			SynthPad.changeLPFresonance(this.value);
		}

		// Changement de l'intensité du LFO
		lfo_intensity_range.onchange = function() {
			SynthPad.changeLFOintensity(this.value / 100);
		}

		// Changement de la forme d'onde de l'oscillateur 1
		for (j = 0; j < osc1_waveform_select.length; j++) {
			osc1_waveform_select[j].onclick = function() {
				SynthPad.changeWaveform('osc1', this.value)
			}
		}
		// Changement du volume de l'oscillateur 1
		osc1_volume_range.onchange = function() {
			SynthPad.changeOSCvolume(osc1_volume, this.value / 100);
		}

		// Changement de la forme d'onde de l'oscillateur 2
		for (j = 0; j < osc2_waveform_select.length; j++) {
			osc2_waveform_select[j].onclick = function() {
				SynthPad.changeWaveform('osc2', this.value)
			}
		}
		// Changement du volume de l'oscillateur 2
		osc2_volume_range.onchange = function() {
			SynthPad.changeOSCvolume(osc2_volume, this.value / 100);
		}
		// Changement du detune de l'oscillateur 2
		osc2_detune_range.onchange = function() {
			SynthPad.changeOSC2detune(this.value);
		}

		orientation_toggle.onchange = function() {
			if (this.checked)
				window.addEventListener("deviceorientation", SynthPad.orientation, false);
			else
				window.removeEventListener("deviceorientation", SynthPad.orientation, false);
		}
			//document.getElementById('alpha').innerHTML = "alpha : "+event.alpha;
			//document.getElementById('beta').innerHTML = "beta : "+Math.abs(event.beta);
			//document.getElementById('gamma').innerHTML = "gamma : "+Math.abs(event.gamma);
			//SynthPad.changeLFOintensity(Math.abs(event.gamma));
			//lfo_intensity_range.value = Math.abs(event.gamma);

	//		SynthPad.changeLPFcutoff(100-Math.abs(event.gamma));
	//		lpf_cutoff_range.value = 100-Math.abs(event.gamma);
	//	}

		// Detection du click et du touché
		myCanvas.addEventListener('mousedown', this.playSound, false);
		myCanvas.addEventListener('touchstart', this.playSound, false);

		myCanvas.addEventListener('mouseup', SynthPad.stopSound, false);
		myCanvas.addEventListener('mouseout', SynthPad.stopSound, false);
		document.addEventListener('mouseleave', SynthPad.stopSound, false);
		myCanvas.addEventListener('touchend', SynthPad.stopSound, false);
		myCanvas.addEventListener('touchcancel', SynthPad.stopSound, false);
	}

	// Crée le son
	this.setupSound = function() {	

		// Oscillators
		osc1 = context.createOscillator();
		osc1_volume = context.createGain();
		osc2 = context.createOscillator();
		osc2_volume = context.createGain();

		for (i = 0; i < osc1_waveform_select.length; i++) {
			if (osc1_waveform_select[i].checked) {
				this.changeWaveform(osc1, osc1_waveform_select[i].value)
				break;
			}
		}

		this.changeOSCvolume(osc1_volume, osc1_volume_range.value / 100);


		for (i = 0; i < osc2_waveform_select.length; i++) {
			if (osc2_waveform_select[i].checked) {
				this.changeWaveform(osc2, osc2_waveform_select[i].value)
				break;
			}
		}

		this.changeOSCvolume(osc2_volume, osc2_volume_range.value / 100);
		this.changeOSC2detune(osc2_detune_range.value);


		// LFO
		lfo = context.createOscillator();
		lfo_intensity = context.createGain();

		lfo.type = 'sine';
		this.changeLFOintensity(lfo_intensity_range.value / 100);


		// Filtre
		filter = context.createBiquadFilter();

		filter.type = filter.LOWPASS;
		this.changeLPFcutoff(lpf_cutoff_range.value);
		this.changeLPFresonance(lpf_resonance_range.value);

		master = context.createGain();


		// Reverb
		reverb = context.createConvolver();
		reverb_gain = context.createGain();
		reverb.buffer = 10000;


		// Connexions
		osc1.connect(osc1_volume);
		osc1_volume.connect(master);

		osc2.connect(osc2_volume);
		osc2_volume.connect(master);

		lfo.connect(lfo_intensity);
		lfo_intensity.connect(master.gain);

		master.connect(filter);

		filter.connect(context.destination);
		
	}

	/*this.setupEventListeners = function() {	

		document.body.addEventListener('touchmove', function(e) {
			if (e.target.id != 'lpf_cutoff' && e.target.id != 'lpf_resonance' && e.target.id != 'lfo_intensity') {
				e.preventDefault(); 
			}
		}, false);

		myCanvas.addEventListener('mousedown', this.playSound(event));
		//myCanvas.addEventListener('touchstart', this.playSound(event));

		myCanvas.addEventListener('mouseup', this.stopSound);
		document.addEventListener('mouseleave', this.stopSound);
		myCanvas.addEventListener('touchend', this.stopSound);
		myCanvas.addEventListener('mouseout', this.stopSound);
	}*/

	// Joue le son
	this.playSound = function(event) {	

		SynthPad.setupSound();
		SynthPad.updateSound(event);

		if(!isPlaying) {
			osc1.start(0);
			osc2.start(0);
			lfo.start(0);
		}

		isPlaying = true;

		myCanvas.removeEventListener('mousedown', SynthPad.playSound, false);
		myCanvas.removeEventListener('touchstart', SynthPad.playSound, false);

		myCanvas.addEventListener('mousemove', SynthPad.updateSound, false);
		myCanvas.addEventListener('touchmove', SynthPad.updateSound, false);

		myCanvas.addEventListener('mouseup', SynthPad.stopSound, false);
		myCanvas.addEventListener('mouseout', SynthPad.stopSound, false);
		document.addEventListener('mouseleave', SynthPad.stopSound, false);
		myCanvas.addEventListener('touchend', SynthPad.stopSound, false);
		myCanvas.addEventListener('touchcancel', SynthPad.stopSound, false);
	}

	// Stop le son
	this.stopSound = function(event) {	

		osc1.stop(0);
		osc2.stop(0);
		lfo.stop(0);

		isPlaying = false;

		myCanvas.addEventListener('mousedown', SynthPad.playSound, false);
		myCanvas.addEventListener('touchstart', SynthPad.playSound, false);

		myCanvas.removeEventListener('mouseup', SynthPad.stopSound, false);
		document.removeEventListener('mouseleave', SynthPad.stopSound, false);
		myCanvas.removeEventListener('touchend', SynthPad.stopSound, false);
		myCanvas.removeEventListener('touchcancel', SynthPad.stopSound, false);
		myCanvas.removeEventListener('mouseout', SynthPad.stopSound, false);
	}

	this.changeWaveform = function(osc, value) {osc.type = value}
	this.changeOSCvolume = function(osc_volume, value) {osc_volume.gain.value = value;}
	this.changeOSC2detune = function(value) {osc2.detune.value = value;}


	this.changeLPFcutoff = function(value) {
		var minp = 0;
		var maxp = 100;

		// The result should be between 100 an 10000000
		var minv = Math.log(40);
		var maxv = Math.log(20000);

		// calculate adjustment factor
		var scale = (maxv-minv) / (maxp-minp);

		filter.frequency.value = Math.exp(minv + scale * (value - minp));
		//filter.frequency.value = value;
		//console.log(Math.exp(minv + scale * (value - minp)));
	}

	this.changeLPFresonance = function(value) {filter.Q.value = value}

	this.changeLFOintensity = function(value) {lfo_intensity.gain.value = value}
	
	this.orientation = function(event) {	
		//document.getElementById('gamma').innerHTML = "gamma : "+Math.abs(event.gamma);
		SynthPad.changeLPFcutoff(100-Math.abs(event.gamma));
		lpf_cutoff_range.value = 100-Math.abs(event.gamma);
	}

	// Calcule le pitch de la note
	this.calculateNote = function(posX) {	
		var noteDifference = highNote - lowNote;
		var noteOffset = (noteDifference / myCanvas.offsetWidth) * (posX - myCanvas.offsetLeft);
		return lowNote + noteOffset;
	}

	// Calcule le volume
	this.calculateLfoRate = function(posY) {	
		var lfoRate = (1 - (((100 / myCanvas.offsetHeight) * (posY - myCanvas.offsetTop)) / 100)) * 20;
		return lfoRate;
	}


	// Calcule le nouveau son avec le pitch et le volume
	this.calculateSound = function(x, y) {	
		var noteValue = this.calculateNote(x);
		var lfoRate = this.calculateLfoRate(y);

		osc1.frequency.value = noteValue;
		osc2.frequency.value = noteValue;
		lfo.frequency.value = lfoRate;
	}

	this.updateFinger = function(x, y) {
		//finger.classList.add('active');
		finger.style.top = y - finger.offsetHeight/2 - myCanvasWrapper.offsetTop + 'px';
		finger.style.left = x - finger.offsetWidth/2 - myCanvasWrapper.offsetLeft + 'px' ;
	}	

	// Met à jour le son
	this.updateSound = function(event) {	
		if (event.type == 'mousedown' || event.type == 'mousemove') {
			SynthPad.calculateSound(event.x, event.y);
			SynthPad.updateFinger(event.x, event.y);
		} else if (event.type == 'touchstart' || event.type == 'touchmove') {
			var touch = event.touches[0];
			SynthPad.calculateSound(touch.pageX, touch.pageY);
			SynthPad.updateFinger(touch.pageX, touch.pageY);
		}
	}

	this.init();


	// Export SynthPad.
	//return SynthPad;
}


// Initialize the page.
window.onload = function() {
	//fullPageResize(canvas);
	SynthPad = new SynthPad();
}



