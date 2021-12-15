load("FMINST")
load("NOISE")
load("BUTTER")
load("EQ")
  
bus_config("NOISE", "aux 0 out")
bus_config("EQ", "aux 0 in" ,"aux 1 out")
bus_config("FMINST", "aux 1 out")
bus_config("BUTTER", "aux 1 in", "out 0-1")
  
  
dur = .4
bpCurvature = -26
bp1freq = 8000
bp2freq = 5000
bpIndex = 2000
noiseamp = 30000
toneamp = 10000
carfreq = 198
modfreq = 222
 

env = maketable("line", 512, 0, 1, 1, 0)
//wavetable = maketable("wave", 1000, "sine")
//guide = 1
wavetable = maketable("wave", 1000, "sine")
FMINST(0, dur, toneamp * env * env, 150, 60, 20, 0, 0.5,
         wavetable, 1)

NOISE(0.0, dur, noiseamp * env)
  
EQ(0, 0, dur, 1, 2, 0, 1, 0, 100, 1, 1)

filt1 = maketable("curve", "nonorm", 512, 0, 8000, bpCurvature, 64, 100)
BUTTER(0, 0, dur * 2, 1, 3, 3, 0, 0, 0.5, 0, filt1, 2000)
filt2 = maketable("curve", "nonorm", 512, 0, 5000, bpCurvature, 64, 200)
BUTTER(0, 0, dur * 2, 1, 3, 3, 0, 0, 0.5, 0, filt2, 2000)
