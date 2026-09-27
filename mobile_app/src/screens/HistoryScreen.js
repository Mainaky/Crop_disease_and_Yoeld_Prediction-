import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';

export default function HistoryScreen({ historyList, onSelectHistoryItem, onClearHistory }) {
  if (!historyList || historyList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Previous Diagnostic Scans</Text>
        <Text style={styles.emptySubtitle}>Scanned plant specimens and yield estimations will appear here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>📜 Scan History</Text>
          <Text style={styles.subtitle}>{historyList.length} diagnostic records archived</Text>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={onClearHistory}>
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {historyList.map((item, index) => {
        const isHealthy = item.is_healthy;
        const timeStr = item.timestamp
          ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now';

        return (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onSelectHistoryItem(item)}
          >
            <View style={styles.cardRow}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Text style={{ fontSize: 24 }}>🌾</Text>
                </View>
              )}

              <View style={styles.infoCol}>
                <View style={styles.badgeRow}>
                  <Text style={[styles.cropBadge, item.crop === 'Rice' ? styles.tagRice : styles.tagWheat]}>
                    {item.crop || 'Crop'}
                  </Text>
                  <Text style={styles.timeText}>{timeStr}</Text>
                </View>

                <Text style={styles.diseaseName}>{item.disease || 'Unknown Disorder'}</Text>

                <View style={styles.metricsRow}>
                  <Text style={styles.metricText}>
                    Sev: <Text style={{ color: isHealthy ? '#22c55e' : '#f97316', fontWeight: 'bold' }}>
                      {item.severity_percentage || `${((item.severity || 0) * 100).toFixed(1)}%`}
                    </Text>
                  </Text>
                  <Text style={styles.metricText}>
                    Yield: <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>
                      {item.predicted_yield_kg_per_ha ? `${Math.round(item.predicted_yield_kg_per_ha)} kg` : 'N/A'}
                    </Text>
                  </Text>
                </View>
              </View>

              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  clearBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cropBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagRice: {
    backgroundColor: '#0369a1',
    color: '#e0f2fe',
  },
  tagWheat: {
    backgroundColor: '#b45309',
    color: '#fef3c7',
  },
  timeText: {
    color: '#64748b',
    fontSize: 11,
  },
  diseaseName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  metricText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  arrowIcon: {
    color: '#64748b',
    fontSize: 22,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
