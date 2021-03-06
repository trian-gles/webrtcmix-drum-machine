const { useState } = React;

const GetCymbScore = (params) =>
{
	let dur = params[0]; // 0.2-1.5
	let decay = params[1]; //100-998
	let attack = params[2]; // 5-100
	let filtfreq = params[3]; // 0 - 4000
	let qmod = params[4]; // 0 - 20
	let squareamp = params[5]; // 0 - 4000
	return `load("NOISE")
load("EQ")
load("WAVETABLE")
  
  
bus_config("NOISE", "aux 0 out")
bus_config("WAVETABLE", "aux 0 out")
bus_config("EQ", "aux 0 in", "out 0-1")
  

dur = ${dur}
decay = ${decay}
attack = ${attack}
filtfreq = ${filtfreq}
qmod = ${qmod}
squareamp = ${squareamp}
  
ampenv = maketable("line", 1000, 0, 0, attack, 1, decay, 0.4, 999, 0)
squaretable = maketable("wave", 1000, "square")
for (i = 0; i < 6; i = i + 1)
{
  freq = 220 * (1 + i / 6) + rand() * 10
  WAVETABLE(0, dur, squareamp*ampenv, freq, 0.5, squaretable)
}

NOISE(0.0, dur, 20000*ampenv)
EQ(0, 0, dur, 1, "lowpass", 0, 0.5, 0, 7000 + filtfreq, 0.6 + qmod)
EQ(0, 0, dur, 1, "highpass", 0, 0.5, 0, 6800 + filtfreq, 1.5 + qmod)
EQ(0, 0, dur, 1, "highpass", 0, 0.5, 0, 6800 + filtfreq, 1.5 + qmod)
EQ(0, 0, dur, 1, "highpass", 0, 0.5, 0, 1200 + filtfreq, 1.5 + qmod)`
}



const GetSnareScore = (params) =>
{
	let dur = params[0];
	let noiseamp = params[1];
	let toneamp = params[2];
	let curvature = params[3];
	let bp1freq = params[4];
	let bp2freq = params[5];
	let bpIndex = params[6];
	let carrier = params[6];
	let modulator = params[7];
	let index = params[8];
	return `load("FMINST")
load("NOISE")
load("BUTTER")
load("EQ")
  
bus_config("NOISE", "aux 0 out")
bus_config("EQ", "aux 0 in" ,"aux 1 out")
bus_config("FMINST", "aux 1 out")
bus_config("BUTTER", "aux 1 in", "out 0-1")
  
  
dur = ${dur}
bpCurvature = ${curvature}
bp1freq = ${bp1freq}
bp2freq = ${bp2freq}
bpIndex = ${bpIndex}
noiseamp = ${noiseamp}
toneamp = ${toneamp}
carfreq = ${carrier}
modfreq = ${modulator}
index = ${index}
 

env = maketable("line", 512, 0, 1, 1, 0)
wavetable = maketable("wave", 1000, "sine")
FMINST(0, dur, toneamp * env * env, carfreq, modfreq, index, 0, 0.5,
         wavetable, 1)

NOISE(0.0, dur, noiseamp * env)
  
EQ(0, 0, dur, 1, 2, 0, 1, 0, 100, 1, 1)

filt1 = maketable("curve", "nonorm", 512, 0, 8000, bpCurvature, 64, 100)
BUTTER(0, 0, dur * 2, 1, 3, 3, 0, 0, 0.5, 0, filt1, 2000)
filt2 = maketable("curve", "nonorm", 512, 0, 5000, bpCurvature, 64, 200)
BUTTER(0, 0, dur * 2, 1, 3, 3, 0, 0, 0.5, 0, filt2, 2000)`
}

const GetKickScore = (params) => 
{
  let dur = params[0];
  let freq = params[1];
  let freqSpike = params[2];
  let curvature = params[3];
  let attack = params[4];
  return `load("WAVETABLE")
dur = ${dur}

attack = ${attack}
curvature = ${curvature}
basefreq = ${freq}
peakfreq = ${freqSpike}
  
ampenv = maketable("line", 512, 0, 0, round(attack * 64 / dur), 1, 64, 0)
pitchenv = maketable("curve", 512, 0, 0, curvature, round(attack * 64 / dur), 1, curvature, 64, 0)
WAVETABLE(0, dur, 30000 * ampenv, basefreq + (peakfreq * pitchenv), 0.5)`
}

const kickInst = {
  "name": "Kick",
  "key": "q",
  "keycode": "81",
  "sliders": 
  [	{"name": "dur", "min": 0, "max": 2, "init": 1, "step": 0.1}, 
	{"name": "base freq", "min": 20, "max": 200, "init": 70, "step": 1},
	{"name": "freq spike", "min": 20, "max": 200, "init": 70, "step": 1},
	{"name": "pitch env curve", "min": -100, "max": 0, "init": -9, "step": 1},
	{"name": "attack speed", "min": 0, "max": 0.025, "init": 0.01, "step": 0.005}],
  "scoreFunc": GetKickScore
}

const snareInst = {
  "name": "Snare",
  "key": "w",
  "keycode": "87",
  "sliders": 
  [	{"name": "dur", "min": 0, "max": 2, "init": 0.2, "step": 0.1}, 
	{"name": "noise amp", "min": 0, "max": 30000, "init": 20000, "step": 100},
	{"name": "tone amp", "min": 0, "max": 30000, "init": 8000, "step": 100},
	{"name": "pitch env curve", "min": -200, "max": -20, "init": -79, "step": 1},
	{"name": "bp1 high freq", "min": 1000, "max": 10000, "init": 8000, "step": 50},
	{"name": "bp2 high freq", "min": 1000, "max": 10000, "init": 5000, "step": 50},
	{"name": "bp index", "min": 0, "max": 10000, "init": 1000, "step": 50},
	{"name": "carrier freq", "min": 50, "max": 500, "init": 150, "step": 1},
	{"name": "mod freq", "min": 20, "max": 200, "init": 50, "step": 1},
	{"name": "mod index", "min": 1, "max": 50, "init": 30, "step": 1}
	],
  "scoreFunc": GetSnareScore
}

const tomInst = {
  "name": "Tom",
  "key": "e",
  "keycode": "89",
  "sliders": 
  [	{"name": "dur", "min": 0, "max": 2, "init": 1, "step": 0.1}, 
	{"name": "base freq", "min": 100, "max": 350, "init": 150, "step": 1},
	{"name": "freq spike", "min": 20, "max": 200, "init": 70, "step": 1},
	{"name": "pitch env curve", "min": -100, "max": 0, "init": -9, "step": 1},
	{"name": "attack speed", "min": 0, "max": 0.025, "init": 0.01, "step": 0.005}],
  "scoreFunc": GetKickScore
}

const cymbInst = {
  "name": "Cymbal",
  "key": "a",
  "keycode": "89",
  "sliders": 
  [	{"name": "dur", "min": 0, "max": 2, "init": 0.4, "step": 0.1},
  {"name": "decay", "min": 100, "max": 998, "init": 200, "step": 1}, 
	{"name": "attack", "min": 5, "max": 100, "init": 20, "step": 1},
	{"name": "filter freq mod", "min": 0, "max": 4000, "init": 70, "step": 10},
	{"name": "q mod", "min": 0, "max": 20, "init": 0, "step": 0.5},
	{"name": "square amp", "min": 0, "max": 4000, "init": 2000, "step": 10}],
  "scoreFunc": GetCymbScore
}

const apiURL = 'https://timeout2-ovo53lgliq-uc.a.run.app';


function SendScore(score) {
  let formData = new FormData();
  formData.append('file', new Blob([score], {type : 'text/plain'}), 'file.sco');
  formData.append('pitch', 440);
  return fetch(apiURL, {
    method: 'POST',
    body: formData,
  }).then(r => r.arrayBuffer())
  .then(r => URL.createObjectURL(new Blob([r], {type: 'audio/wav'})));
}

function RenderPlay({id, params, HandleClickRender, HandleClickPlay, rendered})
{
  let text;
  let btnType;
  let HandleClick;
  if (rendered) {
      text = "Play";
      btnType = "btn-secondary";
      HandleClick = HandleClickPlay;
    }
  else {
      text = "Render";
      btnType = "btn-warning";
      HandleClick = HandleClickRender;
    }
  
  
  return (
  <div className ={`btn ${btnType} p-4 m-3`} onClick = {HandleClick}> 
    {text}
    
  </div>)
}

function Sound({inst}) {
  const [active, setActive] = React.useState(false);
  const [rendered, setRendered] = React.useState(false);
  const sliderChange = (slider, setParamFunc) =>
  {
    setParamFunc(slider.target.value);
    setRendered(false);
  }
  
  let sliderStates = []
  let sliderFuncs = []
  let sliders = []
  for (const slider of inst.sliders)
    {
      const [param, setParam] = React.useState(slider.init);
      sliderStates.push(param);
      sliderFuncs.push(setParam);
      sliders.push(
        <div className="w-75">
			<input className="w-100 mb-0 pb-0" type="range" step={slider.step} value = {param} max={slider.max} min={slider.min} onChange={(e) => sliderChange(e, setParam)} />
			<div className="d-flex justify-content-between mt-0 pt-0">
				<p className="mt-0 pt-0 text-white">{slider.name}</p><p  className="mt-0 pt-0 text-white">{param}</p>
			</div>
		</div>
      );
    }
  
  const handleClickRender = () => {
    const score = inst.scoreFunc(sliderStates);
	console.log(score);
    SendScore(score).then(objectURL => 
    {
      const audioTag = document.getElementById(inst.name);
      audioTag.src = objectURL;
      setRendered(true);
    })
  }
  
  const handleClickPlay = () => {
	setActive(true);
	setTimeout(() => setActive(false), 200);
    const audioTag = document.getElementById(inst.name);
    audioTag.currentTime = 0;
    audioTag.play();
  }
  
  let bkgcolor;
  if (active)
  {
	  bkgcolor = 'bg-warning';
  }
  else 
  {
	  bkgcolor = 'bg-dark';
  }
  
  return (
  <div className = "col px-3">
    <div className={`border border-dark rounded ${bkgcolor}`} align="center">
      <h4 className="text-white">{inst.name}</h4>
      {sliders}
	  <audio className="clip" id={inst.name}/>
      <RenderPlay id={inst.name} params={sliderStates} HandleClickRender={handleClickRender} HandleClickPlay={handleClickPlay} rendered={rendered}/>
      
    </div>
  </div>
  )
}

function App(){
	return (
	<div className="row bg-secondary">
		<h4 className="text-center">WebRTcmix Drum Machine</h4>
		<div className="row bg-secondary">
			<Sound inst={kickInst}/><Sound inst={snareInst}/><Sound inst={tomInst}/><Sound inst={cymbInst}/>
		</div>
	</div>
	)
}

ReactDOM.render(<App />, document.getElementById("root"));