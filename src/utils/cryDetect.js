export function isCryDetected({ metering }) {
  const threshold = -25;
  return typeof metering === 'number' && metering > threshold;
}

export function analyzeAudioBuffer(samples) {
  if (!samples || samples.length === 0) return false;
  const avg = samples.reduce((a, b) => a + Math.abs(b), 0) / samples.length;
  return avg > 0.35;
}
