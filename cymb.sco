load("NOISE")
load("EQ")
load("WAVETABLE")
  
  
bus_config("NOISE", "aux 0 out")
bus_config("WAVETABLE", "aux 0 out")
bus_config("EQ", "aux 0 in", "out 0-1")
  

dur = 0.8 // 0.2-1.5
decay = 200 //100-998
attack = 5 // 5-100
filtfreq = 5000
qmod = 10
squareamp = 1000
  
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
EQ(0, 0, dur, 1, "highpass", 0, 0.5, 0, 1200 + filtfreq, 1.5 + qmod)