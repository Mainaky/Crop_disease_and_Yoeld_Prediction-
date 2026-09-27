import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';

export default function ResultScreen({ result, imageUri, onBack, onNavigateToGuide }) {
  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No result data available.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isHealthy = result.is_healthy;
  const severityVal = result.severity || 0.0;
  const severityPercent = (severityVal * 100).toFixed(1);

  // Severity color status
  let severityColor = '#22c55e'; // Green
  let severityLabel = 'Minimal / Negligible';
  if (severityVal > 0.40) {
    severityColor = '#ef4444'; // Red
    severityLabel = 'Critical / Severe Damage';
  } else if (severityVal > 0.20) {
    severityColor = '#f97316'; // Orange
    severityLabel = 'Moderate Infection';
  } else if (severityVal > 0.05) {
    severityColor = '#eab308'; // Yellow
    severityLabel = 'Mild Early Symptoms';
  }

  const advisory = result.advisory || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backArrowBtn} onPress={onBack}>
          <Text style={styles.backArrowText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Diagnostic Report</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Main Specimen & Status Card */}
      <View style={styles.card}>
        <View style={styles.imageRow}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.specimenThumb} resizeMode="cover" />
          )}
          <View style={styles.specimenDetails}>
            <View style={[styles.statusBadge, isHealthy ? styles.statusBadgeHealthy : styles.statusBadgeInfected]}>
              <Text style={styles.statusBadgeText}>
                {isHealthy ? "✅ HEALTHY SPECIMEN" : "⚠️ DISEASE DETECTED"}
              </Text>
            </View>
            <Text style={styles.cropName}>{result.crop} Crop</Text>
            <Text style={styles.diseaseName}>{result.disease}</Text>
            <Text style={styles.confidenceText}>
              Confidence: <Text style={styles.confidenceHighlight}>{result.disease_confidence || '92%'}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Yield Forecast Card */}
      <View style={[styles.card, styles.yieldCard]}>
        <View style={styles.yieldHeader}>
          <Text style={styles.yieldCardTitle}>🌾 Forecasted Crop Yield</Text>
          {result.healthy_yield_boost_applied && (
            <View style={styles.boostBadge}>
              <Text style={styles.boostBadgeText}>+15% Healthy Boost</Text>
            </View>
          )}
        </View>

        <View style={styles.yieldMetricRow}>
          <View style={styles.yieldMainCol}>
            <Text style={styles.yieldMainVal}>
              {result.predicted_yield_kg_per_ha ? result.predicted_yield_kg_per_ha.toLocaleString() : '3,850'}
            </Text>
            <Text style={styles.yieldMainUnit}>kg / hectare</Text>
          </View>

          <View style={styles.yieldDivider} />

          <View style={styles.yieldSubCol}>
            <Text style={styles.yieldSubVal}>
              {result.predicted_yield_tons_per_ha || ((result.predicted_yield_kg_per_ha || 3850) / 1000).toFixed(2)}
            </Text>
            <Text style={styles.yieldSubUnit}>metric tons / ha</Text>
          </View>
        </View>
        <Text style={styles.yieldSubtitle}>Estimated through Random Forest ML regression based on current soil NPK & climate features</Text>
      </View>

      {/* Infection Severity Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Infection Severity Analysis</Text>
          <Text style={[styles.severityPercentText, { color: severityColor }]}>{severityPercent}%</Text>
        </View>

        {/* Progress Gauge */}
        <View style={styles.gaugeTrack}>
          <View style={[styles.gaugeFill, { width: `${Math.min(100, Math.max(4, severityVal * 100))}%`, backgroundColor: severityColor }]} />
        </View>

        <View style={styles.severityStatusRow}>
          <Text style={styles.severityStatusLabel}>Impact Level:</Text>
          <Text style={[styles.severityStatusValue, { color: severityColor }]}>{severityLabel}</Text>
        </View>

        <Text style={styles.severityNote}>
          {isHealthy
            ? "Zero infection detected. Leaf pigmentation and chloroplast structure are optimal."
            : "Detected diseased necrotic lesion area relative to total scanned leaf surface."}
        </Text>
      </View>

      {/* Agronomic Advisory Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌱 Agronomic Treatment & Advisory</Text>

        <View style={styles.advisoryBlock}>
          <Text style={styles.advisoryHeader}>💊 Recommended Treatment:</Text>
          <Text style={styles.advisoryBody}>
            {advisory.treatment || "Maintain balanced nutrition and consult local agricultural extension officer."}
          </Text>
        </View>

        <View style={styles.advisoryBlock}>
          <Text style={styles.advisoryHeader}>🛡️ Cultural & Preventive Measures:</Text>
          <Text style={styles.advisoryBody}>
            {advisory.prevention || "Ensure field sanitation, weed management, and certified disease-free seeds."}
          </Text>
        </View>

        {advisory.organic && (
          <View style={styles.advisoryBlock}>
            <Text style={styles.advisoryHeader}>🍃 Organic Alternative:</Text>
            <Text style={styles.advisoryBody}>{advisory.organic}</Text>
          </View>
        )}

        <View style={styles.advisoryBlock}>
          <Text style={styles.advisoryHeader}>⚠️ Yield Risk Impact:</Text>
          <Text style={styles.advisoryBody}>
            {advisory.severity_impact || (isHealthy ? "None (Healthy crop)" : "Moderate")}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onBack}>
          <Text style={styles.primaryBtnText}>🔄 Scan Another Leaf</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => onNavigateToGuide(result.disease)}>
          <Text style={styles.secondaryBtnText}>📖 View Full Disease Guide</Text>
        </TouchableOpacity>
      </View>

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backArrowBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  backArrowText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pageTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  specimenThumb: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#0f172a',
  },
  specimenDetails: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  statusBadgeHealthy: {
    backgroundColor: '#064e3b',
    borderColor: '#059669',
    borderWidth: 1,
  },
  statusBadgeInfected: {
    backgroundColor: '#7f1d1d',
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cropName: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diseaseName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 2,
  },
  confidenceText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
  confidenceHighlight: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  yieldCard: {
    backgroundColor: '#064e3b',
    borderColor: '#059669',
  },
  yieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yieldCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boostBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  boostBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  yieldMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  yieldMainCol: {
    alignItems: 'center',
  },
  yieldMainVal: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  yieldMainUnit: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  yieldDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#059669',
  },
  yieldSubCol: {
    alignItems: 'center',
  },
  yieldSubVal: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  yieldSubUnit: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  yieldSubtitle: {
    color: '#6ee7b7',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityPercentText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gaugeTrack: {
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
  },
  severityStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  severityStatusLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  severityStatusValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  severityNote: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
  },
  advisoryBlock: {
    marginBottom: 12,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
  },
  advisoryHeader: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  advisoryBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  actionContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
});
