# AGENTS.md — Jaga Tangis

Panduan untuk AI agent / contributor yang mengerjakan repo ini.

## Project Overview

- App Expo (SDK 57) untuk deteksi tangisan bayi malam hari. Window aktif 18.00–06.00. Stack: React 19, React Native 0.86, expo-av, expo-file-system, expo-notifications, expo-task-manager, AsyncStorage.

## Commands

- Install: `npm install --legacy-peer-deps` (wajib flag karena peer mismatch `@expo/webpack-config`)
- Dev: `npx expo start --tunnel` atau `node node_modules/expo/bin/cli start --tunnel` jika global `expo-cli` mengganggu
- Scripts lain: `npm run android` / `ios` / `web`
- Clean install: `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`
- Fix Metro missing: clean install ulang (error `metro/private/lib/TerminalReporter`)

## Structure & Key Files

- `App.js` — UI utama, jangan duplikasi logic bucket/timeline yang sudah ada di StorageService
- `src/services/AudioService.js` — probe metering, interval 5s, rekam 1.5s; perubahan threshold harus sinkron dengan `cryDetect.js`
- `src/services/StorageService.js` — AsyncStorage key `@jaga_tangis:records`, retensi 7 hari, fungsi `toGraphBuckets`/`toTimelineItem` dipakai App.js
- `src/services/BackgroundTask.js` — TaskManager `jaga-tangis-bg` + Notifications
- `src/utils/timeWindow.js` — single source of truth untuk window 18-06
- `src/utils/cryDetect.js` — threshold `-25` dB, `analyzeAudioBuffer` threshold `0.35`
- `app.json` — permissions Android, `assetBundlePatterns`

## Conventions

- ES modules, functional components + hooks, `StyleSheet.create`
- Jangan tambah dependency tanpa cek kompatibilitas Expo SDK 57
- `@expo/webpack-config` lock di `^19.0.1`, ubah hanya jika upgrade Expo
- Node 22, npm 10; commit `package-lock.json` selalu

## Constraints

- Jangan ubah window time (18–06) tanpa diskusi
- Jangan ubah retensi 7 hari / key AsyncStorage tanpa migrasi
- File audio disimpan di `FileSystem.documentDirectory` dengan prefix `cry_` — jangan ganti path tanpa update cleanup
- `expo-av` config (sampleRate 16000, bitRate 32000) sudah tuned — ubah hanya jika ada benchmark

## Security & Secrets

- Jangan commit `.env`, `*.jks`, `*.p8`, `*.p12`
- Audio berisi data sensitif — jangan log metering/record URI ke console di production

## Git

- Remote: `https://github.com/iggusti/jaga-tangis.git`, branch utama `main`
- Commit message: ringkas, prefix opsional `feat:`/`fix:`/`chore:`
- Jangan push `node_modules/`, `.expo/`, `dist/`, `web-build/`

## Testing Checklist (manual)

- [ ] `npx expo start --tunnel` jalan, Metro tidak error
- [ ] Di luar window (06–18) monitoring tidak start
- [ ] Di dalam window probe jalan, deteksi > -25 dB simpan record
- [ ] Grafik bucket 18/20/22/00/02/04/06 update, timeline render
- [ ] Prune >7 hari bekerja
