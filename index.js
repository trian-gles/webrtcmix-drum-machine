const { useState } = React;

const GetKickScore = (params) => 
{
  let dur = params[0];
  let freq = params[1];
  let freqSpike = params[2];
  let curvature = params[3];
  return `load("WAVETABLE")
dur = ${dur}

attack = 0.025
curvature = ${curvature}
basefreq = ${freq}
peakfreq = ${freqSpike}
  
ampenv = maketable("line", 256, 0, 0, round(attack * 32 / dur), 1, 32, 0)
pitchenv = maketable("curve", 256, 0, 0, curvature, round(attack * 32 / dur), 1, curvature, 32, 0)
WAVETABLE(0, dur, 30000 * ampenv, basefreq + (peakfreq * pitchenv), 0.5)`
}

const kickInst = {
  "name": "kick",
  "key": "q",
  "keycode": "81",
  "sliders": 
  [{"name": "dur", "min": 0, "max": 2, "init": 1, "step": 0.1}, 
   {"name": "base freq", "min": 20, "max": 200, "init": 70, "step": 1},
   {"name": "freq spike", "min": 20, "max": 200, "init": 70, "step": 1},
  {"name": "pitch env curve", "min": -100, "max": 0, "init": -9, "step": 1}],
  "scoreFunc": GetKickScore
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
      btnType = "btn-primary";
      HandleClick = HandleClickRender;
    }
  
  
  return (
  <div className ={`btn ${btnType} p-4 m-3`} onClick = {HandleClick}> 
    {text}
    <audio className="clip" id={id}/>
  </div>)
}

function Sound({inst}) {
  
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
        <div>
          <h6>{slider.name}</h6>
          <input type="range" step={slider.step} value = {param} max={slider.max} min={slider.min} onChange={(e) => sliderChange(e, setParam)} className="w-50" />
        </div>
      );
    }
  
  const handleClickRender = () => {
    const score = inst.scoreFunc(sliderStates);
    SendScore(score).then(objectURL => 
    {
      const audioTag = document.getElementById(inst.name);
      audioTag.src = objectURL;
      setRendered(true);
    })
  }
  
  const handleClickPlay = () => {
    const audioTag = document.getElementById(inst.name);
    audioTag.currentTime = 0;
    audioTag.play();
  }
  
  
  return (
    <div>
      <h4>{inst.name}</h4>
      {sliders}
      <RenderPlay id={inst.name} params={sliderStates} HandleClickRender={handleClickRender} HandleClickPlay={handleClickPlay} rendered={rendered}/>
      
    </div>
  )
}

ReactDOM.render(<Sound inst={kickInst}/>, document.getElementById("root"));