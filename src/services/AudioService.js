import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { isCryDetected } from '../utils/cryDetect';
import { isMonitoringWindow } from '../utils/timeWindow';
import { saveRecord } from './StorageService';

let recording = null;
let intervalId = null;

export async function requestPermissions() {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function startMonitoring(onCry) {
  if (!isMonitoringWindow(new Date())) return false;
  const ok = await requestPermissions();
  if (!ok) return false;
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  intervalId = setInterval(async () => {
    if (!isMonitoringWindow(new Date())) return;
    await probeOnce(onCry);
  }, 5000);
  return true;
}

export function stopMonitoring() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  if (recording) {
    recording.stopAndUnloadAsync().catch(() => {});
    recording = null;
  }
}

async function probeOnce(onCry) {
  try {
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync({
      android: { extension: '.m4a', outputFormat: Audio.AndroidOutputFormat.MPEG_4, audioEncoder: Audio.AndroidAudioEncoder.AAC, sampleRate: 16000, numberOfChannels: 1, bitRate: 32000 },
      ios: { extension: '.caf', outputFormat: Audio.IOSOutputFormat.LINEARPCM, audioQuality: Audio.IOSAudioQuality.LOW, sampleRate: 16000, numberOfChannels: 1, bitRate: 32000, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false },
      isMeteringEnabled: true,
    });
    await rec.startAsync();
    await new Promise((r) => setTimeout(r, 1500));
    const status = await rec.getStatusAsync();
    await rec.stopAndUnloadAsync();
    const metering = status.metering ?? -160;
    if (isCryDetected({ metering })) {
      const uri = rec.getURI();
      let savedUri = uri;
      if (uri) {
        const name = `cry_${Date.now()}.m4a`;
        const dest = `${FileSystem.documentDirectory}${name}`;
        try { await FileSystem.moveAsync({ from: uri, to: dest }); savedUri = dest; } catch {}
      }
      const record = { id: String(Date.now()), timestamp: new Date().toISOString(), duration: '~1.5s', metering, uri: savedUri };
      await saveRecord(record);
      onCry?.(record);
    }
  } catch {}
}
