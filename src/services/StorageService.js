import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@jaga_tangis:records';
const RETENTION_DAYS = 7;

export async function loadRecords() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? pruneIfNeeded(parsed) : [];
  } catch {
    return [];
  }
}

export async function saveRecord(record) {
  const records = await loadRecords();
  records.unshift(record);
  const pruned = pruneIfNeeded(records);
  await AsyncStorage.setItem(KEY, JSON.stringify(pruned));
  return pruned;
}

export async function clearRecords() {
  await AsyncStorage.removeItem(KEY);
}

function pruneIfNeeded(records) {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return records.filter((r) => {
    const t = new Date(r.timestamp).getTime();
    return !isNaN(t) && t >= cutoff;
  });
}

export function toTimelineItem(record) {
  return {
    id: record.id ?? String(record.timestamp),
    timestamp: record.timestamp,
    duration: record.duration ?? '~10s',
  };
}

export function toGraphBuckets(records) {
  const hours = ['18', '20', '22', '00', '02', '04', '06'];
  const buckets = Object.fromEntries(hours.map((h) => [h, 0]));
  for (const r of records) {
    const h = new Date(r.timestamp).getHours();
    const bucket = h >= 18 ? String(h >= 22 ? (h >= 24 ? '00' : h % 2 === 0 ? String(h) : String(h - 1)) : h % 2 === 0 ? String(h) : String(h - 1)) : h < 2 ? '00' : h < 4 ? '02' : h < 6 ? '04' : '06';
    const key = ['18', '20', '22', '00', '02', '04', '06'].includes(bucket) ? bucket : '06';
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return hours.map((hour) => ({ hour, value: buckets[hour] || 0 }));
}
