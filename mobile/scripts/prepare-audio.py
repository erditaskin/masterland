"""Generate original, reproducible short game feedback (48 kHz mono PCM).

Soft attacks and restrained upper partials avoid sharp clicks. Production has
three small timbre variants; merge resolves upward; reward is a short cadence.
No loudness escalation, long loop, or sound-driven game state is used.
"""
from pathlib import Path
import math, random, struct, wave, json
RATE=48000
ROOT=Path(__file__).resolve().parents[1]/'assets/audio'
ROOT.mkdir(parents=True,exist_ok=True)

def render(filename, seconds, notes, gain, seed, wood=0):
    rng=random.Random(seed)
    samples=[]
    smooth=0
    for i in range(round(seconds*RATE)):
        t=i/RATE
        value=0
        for start,freq,decay,volume in notes:
            u=t-start
            if u<0: continue
            attack=1-math.exp(-u/0.004)
            tail=min(1,max(0,(seconds-t)/0.025))
            env=attack*math.exp(-u/decay)*tail
            # A warm mallet, with low-level inharmonic wood resonance.
            tone=math.sin(2*math.pi*freq*u)+0.16*math.sin(2*math.pi*freq*2*u)*math.exp(-u/.035)+0.045*math.sin(2*math.pi*freq*3.98*u)*math.exp(-u/.022)
            value+=volume*env*tone
        smooth=.83*smooth+.17*rng.uniform(-1,1)
        value+=wood*smooth*(1-math.exp(-t/.002))*math.exp(-t/.012)*min(1,(seconds-t)/.02)
        samples.append(math.tanh(value*gain))
    peak=max(abs(s) for s in samples)
    rms=math.sqrt(sum(s*s for s in samples)/len(samples))
    with wave.open(str(ROOT/filename),'wb') as out:
        out.setnchannels(1);out.setsampwidth(2);out.setframerate(RATE)
        out.writeframes(b''.join(struct.pack('<h',round(max(-1,min(1,s))*32767)) for s in samples))
    return {'file':filename,'duration_ms':round(seconds*1000),'peak_dbfs':round(20*math.log10(peak),2),'rms_dbfs':round(20*math.log10(rms),2),'sample_rate':RATE,'clipped_samples':sum(abs(s)>=1 for s in samples)}

metrics=[]
metrics.append(render('tap.wav',.075,[(0,440,.018,.6)],.24,1,.12))
for i,freq in enumerate([523.25,659.25,783.99]):
    metrics.append(render(f'produce-{i}.wav',.12,[(0,freq,.033,.7),(.008,freq/2,.025,.15)],.28,10+i,.18))
metrics.append(render('merge.wav',.235,[(0,659.25,.055,.65),(.043,783.99,.06,.52)],.25,20,.035))
metrics.append(render('reward.wav',.4,[(0,523.25,.075,.48),(.075,659.25,.08,.44),(.15,783.99,.09,.42)],.25,21))
metrics.append(render('blocked.wav',.09,[(0,220,.025,.6)],.2,22,.14))
(ROOT/'audio-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
