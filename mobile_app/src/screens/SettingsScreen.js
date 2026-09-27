import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getBaseUrl, loadBaseUrl, setBaseUrl, testConnection } from '../services/api';

export default function SettingsScreen({ isDemoMode, onToggleDemoMode }) {
  const [serverUrl, setServerUrlState] = useState(getBaseUrl());
  const [testing, setTesting] = useState(false);
  const [pingStatus, setPingStatus] = useState(null); // { success, message }

  useEffect(() => {
    let active = true;
    loadBaseUrl().then((url) => {
      if (active) setServerUrlState(url);
    });
    return () => { active = false; };
  }, []);

  const handleSaveUrl = async () => {
    try {
      const updated = await setBaseUrl(serverUrl);
      setServerUrlState(updated);
      setPingStatus(null);
      Alert.alert("Server Configured", `Backend address saved:\n${updated}`);
    } catch (error) {
      Alert.alert("Could Not Save Address", error.message || "Please try again.");
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setPingStatus(null);
    const res = await testConnection();
    setTesting(false);

    if (res.success) {
      setPingStatus({
        success: true,
        message: `Connected successfully! (API v${res.data?.version || '2.0'})`
      });
    } else {
      setPingStatus({
        success: false,
        message: `Connection failed: ${res.error}`
      });
    }
  };

  const setPresetUrl = async (url) => {
    try {
      const updated = await setBaseUrl(url);
      setServerUrlState(updated);
      setPingStatus(null);
    } catch (error) {
      Alert.alert("Could Not Save Address", error.message || "Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ App Settings & Networking</Text>
        <Text style={styles.subtitle}>Configure communication with the Python FastAPI backend</Text>
      </View>

      {/* Backend URL Configuration */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>FastAPI Backend Address</Text>
        <Text style={styles.cardDescription}>
          The endpoint URL serving MobileNetV2 and Random Forest models
        </Text>

        <TextInput
          style={styles.urlInput}
          value={serverUrl}
          onChangeText={setServerUrlState}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://192.168.x.x:8000"
          placeholderTextColor="#64748b"
        />

        <View style={styles.quickPresetRow}>
          <Text style={styles.presetHeading}>Quick Presets:</Text>
          <TouchableOpacity style={styles.chip} onPress={() => setPresetUrl("http://172.19.23.6:8000")}>
            <Text style={styles.chipText}>Local Wi-Fi (172.19.23.6)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => setPresetUrl("http://10.0.2.2:8000")}>
            <Text style={styles.chipText}>Android Emulator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => setPresetUrl("http://localhost:8000")}>
            <Text style={styles.chipText}>Localhost / Web</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
            <Text style={styles.saveBtnText}>Save Address</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pingBtn} onPress={handleTestConnection} disabled={testing}>
            {testing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.pingBtnText}>⚡ Test Connection</Text>
            )}
          </TouchableOpacity>
        </View>

        {pingStatus && (
          <View style={[styles.pingBadge, pingStatus.success ? styles.pingSuccess : styles.pingError]}>
            <Text style={styles.pingBadgeText}>
              {pingStatus.success ? "🟢 " : "🔴 "}
              {pingStatus.message}
            </Text>
          </View>
        )}
      </View>

      {/* Demo / Offline Simulation Mode */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Offline Demo Mode</Text>
            <Text style={styles.cardDescription}>
              Simulates model predictions locally if no Wi-Fi or backend server is running during faculty presentation
            </Text>
          </View>
          <Switch
            value={isDemoMode}
            onValueChange={onToggleDemoMode}
            trackColor={{ false: '#334155', true: '#059669' }}
            thumbColor={isDemoMode ? '#22c55e' : '#94a3b8'}
          />
        </View>
      </View>

      {/* Architecture & Project Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Architecture</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>🔬 Disease Classification:</Text>
          <Text style={styles.infoValue}>MobileNetV2 (Transfer Learning from ImageNet, 224x224 RGB input, Softmax output across 6 Rice & 15 Wheat classes)</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>🌾 Yield Prediction Engine:</Text>
          <Text style={styles.infoValue}>Random Forest Regressor trained on 10 NPK, climate (Rainfall, Temp, Humidity, Soil Moisture, pH), and infection severity metrics</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>🌿 Severity Estimation Algorithm:</Text>
          <Text style={styles.infoValue}>Color channel grayscale segmentation thresholding with pixel density ratio</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>📱 Mobile App Framework:</Text>
          <Text style={styles.infoValue}>React Native (Expo SDK 57) with native camera and gallery integration</Text>
        </View>
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
  header: {
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
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  urlInput: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  quickPresetRow: {
    marginBottom: 14,
  },
  presetHeading: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#38bdf8',
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pingBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pingBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pingBadge: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  pingSuccess: {
    backgroundColor: '#064e3b',
    borderColor: '#059669',
    borderWidth: 1,
  },
  pingError: {
    backgroundColor: '#7f1d1d',
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  pingBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBlock: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
  },
});
