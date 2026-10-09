import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { loadRecords, toTimelineItem, toGraphBuckets } from './src/services/StorageService';
import { isMonitoringWindow, getWindowLabel } from './src/utils/timeWindow';
import { startMonitoring, stopMonitoring } from './src/services/AudioService';

const HOURS = ['18', '20', '22', '00', '02', '04', '06'];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [windowLabel, setWindowLabel] = useState(getWindowLabel());

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadRecords();
    setRecords(data);
    setWindowLabel(getWindowLabel());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    let mounted = true;
    startMonitoring(() => { if (mounted) refresh(); });
    const id = setInterval(() => setWindowLabel(getWindowLabel()), 60000);
    return () => { mounted = false; stopMonitoring(); clearInterval(id); };
  }, [refresh]);

  const graph = toGraphBuckets(records);
  const timeline = records.map(toTimelineItem);
  const maxVal = Math.max(1, ...graph.map((g) => g.value));

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.timestamp}</Text>
      <Text style={styles.itemText}>{item.duration}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Jaga Tangis</Text>
        <Text>Deteksi: {windowLabel}</Text>
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
        <Text>Deteksi malam ini: {records.length}</Text>
      </View>
      <View style={styles.graphContainer}>
        {graph.map((g) => (
          <View key={g.hour} style={styles.graphColumn}>
            <View style={[styles.graphBar, { height: g.value === 0 ? 4 : (g.value / maxVal) * 80 + 4 }]} />
            <Text style={styles.graphLabel}>{g.hour}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Timeline</Text>
      <FlatList data={timeline} renderItem={renderItem} keyExtractor={(item) => item.id} style={styles.list} showsVerticalScrollIndicator={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 16 },
  header: { paddingVertical: 12, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  graphContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, marginVertical: 12 },
  graphColumn: { alignItems: 'center' },
  graphBar: { width: 20, backgroundColor: '#007AFF', borderRadius: 3 },
  graphLabel: { fontSize: 10, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  list: { flex: 1 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 14, color: '#333' },
});

export { App };
