# Jaga Tangis

Aplikasi monitoring tangisan bayi malam hari (18.00–06.00) berbasis Expo. Merekam interval singkat, deteksi tangisan via metering audio, simpan riwayat lokal, tampilkan grafik per-jam dan timeline.

## Fitur

- **Monitoring window** 18.00–06.00 (`src/utils/timeWindow.js`)
- **Deteksi tangisan** dari `metering > -25 dB` (`src/utils/cryDetect.js`) + interval probe 5 detik, rekam 1.5 detik
- **Grafik bucket** jam 18/20/22/00/02/04/06 (`StorageService.toGraphBuckets`)
- **Timeline** riwayat deteksi
- **Storage lokal** via AsyncStorage, retensi 7 hari, auto-prune
- **Background task + notifikasi** (`expo-task-manager`, `expo-notifications`)

## Tech Stack

- Expo SDK 57, React 19.2.3, React Native 0.86.3
- `expo-av`, `expo-file-system`, `expo-notifications`, `expo-task-manager`
- `@react-native-async-storage/async-storage`, `react-native-web`

## Prasyarat

- Node 22+, npm 10+
- Expo Go (untuk test di device) atau emulator

## Setup

```bash
npm install --legacy-peer-deps
npx expo start --tunnel
# atau
npm start
```

Scan QR dengan Expo Go.

> Jika `npx expo` ter-hijack `expo-cli` global (deprecated), pakai: `node node_modules/expo/bin/cli start --tunnel`

## Script

| Script | Perintah |
|---|---|
| `npm start` | `expo start` |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | `expo start --web` |

## Struktur

```
.
├── App.js                        # UI: header, grafik, timeline
├── index.js                      # registerRootComponent + defineBackgroundTask
├── app.json                      # Expo config, permissions Android
├── src/
│   ├── services/
│   │   ├── AudioService.js       # probe interval, metering, simpan file
│   │   ├── StorageService.js     # AsyncStorage, prune 7 hari, bucket
│   │   └── BackgroundTask.js     # TaskManager + Notifications
│   └── utils/
│       ├── timeWindow.js         # isMonitoringWindow / getWindowLabel
│       └── cryDetect.js          # isCryDetected / analyzeAudioBuffer
└── assets/
```

## Permissions

- Android: `RECORD_AUDIO`, `FOREGROUND_SERVICE`, `WAKE_LOCK` (lihat `app.json`)
- iOS: `allowsRecordingIOS`, `playsInSilentModeIOS` via `expo-av`

## Konfigurasi Penting

- Threshold metering: `-25` dB (`cryDetect.js`)
- Probe: tiap 5s, durasi 1.5s, sampleRate 16kHz
- Penyimpanan file: `${FileSystem.documentDirectory}cry_<timestamp>.m4a`

## Troubleshooting

- `Cannot find module 'metro/private/lib/TerminalReporter'` → `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`
- Peer-deps warning `@expo/webpack-config` → wajib `--legacy-peer-deps`

## Lisensi

Private.
