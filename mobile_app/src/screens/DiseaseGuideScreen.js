import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { ADVISORY_DATA } from '../constants/advisory';

export default function DiseaseGuideScreen({ initialDisease }) {
  const [search, setSearch] = useState(initialDisease || '');
  const [filter, setFilter] = useState('ALL'); // ALL, RICE, WHEAT
  const [expandedDisease, setExpandedDisease] = useState(initialDisease || null);

  const diseaseEntries = Object.entries(ADVISORY_DATA);

  const filteredEntries = diseaseEntries.filter(([name, data]) => {
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                          data.crop.toLowerCase().includes(search.toLowerCase()) ||
                          data.symptoms.toLowerCase().includes(search.toLowerCase());

    const matchesCrop = filter === 'ALL' || data.crop.toUpperCase() === filter;

    return matchesSearch && matchesCrop;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Crop Disease Compendium</Text>
        <Text style={styles.subtitle}>Reference catalog for 21 Rice & Wheat leaf disorders</Text>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchBar}
        placeholder="🔍 Search symptoms, disease name..."
        placeholderTextColor="#64748b"
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
            All ({diseaseEntries.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'RICE' && styles.filterChipActive]}
          onPress={() => setFilter('RICE')}
        >
          <Text style={[styles.filterChipText, filter === 'RICE' && styles.filterChipTextActive]}>
            🌾 Rice (6)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'WHEAT' && styles.filterChipActive]}
          onPress={() => setFilter('WHEAT')}
        >
          <Text style={[styles.filterChipText, filter === 'WHEAT' && styles.filterChipTextActive]}>
            🌿 Wheat (15)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Disease Cards List */}
      {filteredEntries.map(([name, data]) => {
        const isExpanded = expandedDisease === name;
        const isHealthy = name.toLowerCase().includes('healthy');

        return (
          <TouchableOpacity
            key={name}
            style={[styles.card, isExpanded && styles.cardExpanded]}
            activeOpacity={0.8}
            onPress={() => setExpandedDisease(isExpanded ? null : name)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <View style={styles.tagRow}>
                  <Text style={[styles.cropTag, data.crop === 'Rice' ? styles.tagRice : styles.tagWheat]}>
                    {data.crop}
                  </Text>
                  {isHealthy && <Text style={styles.healthyTag}>Vigorous</Text>}
                </View>
                <Text style={styles.diseaseName}>{name}</Text>
              </View>
              <Text style={styles.expandChevron}>{isExpanded ? '▲' : '▼'}</Text>
            </View>

            <Text style={styles.symptomsPreview} numberOfLines={isExpanded ? undefined : 2}>
              <Text style={styles.sectionHeader}>Symptoms: </Text>{data.symptoms}
            </Text>

            {isExpanded && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>💊 Treatment:</Text>
                  <Text style={styles.detailBody}>{data.treatment}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>🛡️ Prevention:</Text>
                  <Text style={styles.detailBody}>{data.prevention}</Text>
                </View>

                {data.organic && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailTitle}>🍃 Organic Control:</Text>
                    <Text style={styles.detailBody}>{data.organic}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>⚠️ Impact on Yield:</Text>
                  <Text style={styles.detailBody}>{data.severity_impact}</Text>
                </View>
              </View>
            )}
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
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  searchBar: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#064e3b',
    borderColor: '#22c55e',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardExpanded: {
    borderColor: '#22c55e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleBlock: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  cropTag: {
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
  healthyTag: {
    backgroundColor: '#065f46',
    color: '#d1fae5',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  expandChevron: {
    color: '#64748b',
    fontSize: 12,
    paddingLeft: 8,
  },
  symptomsPreview: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  detailsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 8,
  },
  detailRow: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 6,
  },
  detailTitle: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  detailBody: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
  },
});
