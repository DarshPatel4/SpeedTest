let ctx;
let noiseBuffer;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function getNoiseBuffer(c) {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(c.sampleRate * 0.06);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 0.35;
  }
  noiseBuffer = buf;
  return buf;
}

export function playKeyboardSound(ok) {
  const c = getCtx();
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime;
  const peak = ok ? 0.1 : 0.085;
  const center = ok ? 2100 + Math.random() * 350 : 780 + Math.random() * 120;

  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);

  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = center;
  bp.Q.value = ok ? 1.35 : 0.9;

  const tone = c.createOscillator();
  tone.type = ok ? "triangle" : "sawtooth";
  tone.frequency.value = ok ? 1180 + Math.random() * 80 : 210 + Math.random() * 40;

  const toneGain = c.createGain();
  toneGain.gain.value = ok ? 0.035 : 0.055;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.0018);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (ok ? 0.032 : 0.045));

  const mix = c.createGain();
  mix.gain.value = 1;

  src.connect(bp);
  bp.connect(mix);
  tone.connect(toneGain);
  toneGain.connect(mix);
  mix.connect(gain);
  gain.connect(c.destination);

  const dur = ok ? 0.034 : 0.048;
  src.start(t0);
  src.stop(t0 + dur);
  tone.start(t0);
  tone.stop(t0 + dur);
}
