import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { predictFull, getOfflineSimulation } from '../services/api';

export default function HomeScreen({ onNavigateToResult, onSaveHistory, isDemoMode }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropType, setCropType] = useState(1); // 1: Rice, 2: Wheat, 3: Other
  const [loading, setLoading] = useState(false);

  // Environmental & Soil Parameters
  const [soilMoisture, setSoilMoisture] = useState("32.5");
  const [soilPH, setSoilPH] = useState("6.5");
  const [temperature, setTemperature] = useState("26.0");
  const [rainfall, setRainfall] = useState("140.0");
  const [humidity, setHumidity] = useState("78.0");
  const [nitrogen, setNitrogen] = useState("80.0");
  const [phosphorus, setPhosphorus] = useState("40.0");
  const [potassium, setPotassium] = useState("40.0");

  // Pick Image from Gallery
  const pickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera roll permission is needed to upload leaf photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Error", "Could not open photo library: " + e.message);
    }
  };

  // Capture Image with Camera
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera access is needed to capture crop leaf photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Error", "Could not launch camera: " + e.message);
    }
  };

  // Sample Leaf for Instant Faculty Demonstration
  const loadDemoSample = () => {
    setSelectedImage("https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=80");
    setCropType(1);
    setSoilMoisture("34.0");
    setSoilPH("6.4");
    setTemperature("27.5");
    setRainfall("160.0");
    setHumidity("82.0");
    setNitrogen("85.0");
    setPhosphorus("42.0");
    setPotassium("38.0");
  };

  // Quick Preset Handlers
  const applyPreset = (type) => {
    if (type === 'optimal') {
      setSoilMoisture("35.0");
      setSoilPH("6.5");
      setTemperature("25.0");
      setRainfall("150.0");
      setHumidity("80.0");
      setNitrogen("90.0");
      setPhosphorus("40.0");
      setPotassium("40.0");
    } else if (type === 'drought') {
      setSoilMoisture("14.0");
      setSoilPH("7.4");
      setTemperature("34.0");
      setRainfall("25.0");
      setHumidity("40.0");
      setNitrogen("50.0");
      setPhosphorus("25.0");
      setPotassium("20.0");
    } else if (type === 'monsoon') {
      setSoilMoisture("55.0");
      setSoilPH("5.8");
      setTemperature("23.0");
      setRainfall("320.0");
      setHumidity("95.0");
      setNitrogen("70.0");
      setPhosphorus("35.0");
      setPotassium("30.0");
    }
  };

  // Handle Predict
  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert("Missing Photo", "Please take a photo or select an image of the crop leaf first.");
      return;
    }

    setLoading(true);

    const soilData = {
      crop_type: cropType,
      soil_moisture: parseFloat(soilMoisture) || 30.0,
      soil_pH: parseFloat(soilPH) || 6.5,
      temperature: parseFloat(temperature) || 26.0,
      rainfall: parseFloat(rainfall) || 120.0,
      humidity: parseFloat(humidity) || 75.0,
      nitrogen: parseFloat(nitrogen) || 80.0,
      phosphorus: parseFloat(phosphorus) || 40.0,
      potassium: parseFloat(potassium) || 40.0,
    };

    if (isDemoMode) {
      setTimeout(() => {
        const simResult = getOfflineSimulation(cropType, soilData);
        setLoading(false);
        onSaveHistory({ ...simResult, imageUri: selectedImage, timestamp: new Date().toISOString() });
        onNavigateToResult(simResult, selectedImage);
      }, 900);
      return;
    }

    const res = await predictFull(selectedImage, soilData);

    setLoading(false);

    if (res.success) {
      onSaveHistory({ ...res.data, imageUri: selectedImage, timestamp: new Date().toISOString() });
      onNavigateToResult(res.data, selectedImage);
    } else {
      Alert.alert(
        "Server Notice",
        `Could not connect to live backend (${res.error}). Would you like to use offline demonstration mode?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Demo Mode",
            onPress: () => {
              const simResult = getOfflineSimulation(cropType, soilData);
              onSaveHistory({ ...simResult, imageUri: selectedImage, timestamp: new Date().toISOString() });
              onNavigateToResult(simResult, selectedImage);
            }
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>🌾 CropGuard AI</Text>
        <Text style={styles.brandSubtitle}>Intelligent Crop Disease Classification & Yield Forecasting</Text>
      </View>

      {/* Image Capture Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Leaf Specimen</Text>
        <Text style={styles.cardDescription}>Capture or upload a clear photo of the plant leaf</Text>

        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity style={styles.changeImageBtn} onPress={() => setSelectedImage(null)}>
              <Text style={styles.changeImageText}>✕ Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyImagePlaceholder}>
            <Text style={styles.placeholderIcon}>📸</Text>
            <Text style={styles.placeholderText}>No photo selected yet</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.btn, styles.btnCamera]} onPress={takePhoto}>
            <Text style={styles.btnText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGallery]} onPress={pickFromGallery}>
            <Text style={styles.btnText}>🖼️ Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSample]} onPress={loadDemoSample}>
            <Text style={styles.btnText}>🧪 Sample</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Crop Selector Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Target Crop</Text>
        <View style={styles.cropSelector}>
          <TouchableOpacity
            style={[styles.cropOption, cropType === 1 && styles.cropOptionActive]}
            onPress={() => setCropType(1)}
          >
            <Text style={styles.cropEmoji}>🌾</Text>
            <Text style={[styles.cropText, cropType === 1 && styles.cropTextActive]}>Rice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cropOption, cropType === 2 && styles.cropOptionActive]}
            onPress={() => setCropType(2)}
          >
            <Text style={styles.cropEmoji}>🌿</Text>
            <Text style={[styles.cropText, cropType === 2 && styles.cropTextActive]}>Wheat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cropOption, cropType === 3 && styles.cropOptionActive]}
            onPress={() => setCropType(3)}
          >
            <Text style={styles.cropEmoji}>🌱</Text>
            <Text style={[styles.cropText, cropType === 3 && styles.cropTextActive]}>Other</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Soil & Climate Conditions */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>3. Soil & Climate Metrics</Text>
        </View>
        <Text style={styles.cardDescription}>Used by the Yield Prediction Engine</Text>

        {/* Quick Presets */}
        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>Presets:</Text>
          <TouchableOpacity style={styles.presetBtn} onPress={() => applyPreset('optimal')}>
            <Text style={styles.presetBtnText}>Optimal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => applyPreset('drought')}>
            <Text style={styles.presetBtnText}>Dry/Arid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => applyPreset('monsoon')}>
            <Text style={styles.presetBtnText}>Monsoon</Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs Grid */}
        <View style={styles.inputGrid}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Soil Moisture (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={soilMoisture}
              onChangeText={setSoilMoisture}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Soil pH (0-14)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={soilPH}
              onChangeText={setSoilPH}
            />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={temperature}
              onChangeText={setTemperature}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Rainfall (mm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={rainfall}
              onChangeText={setRainfall}
            />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Humidity (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={humidity}
              onChangeText={setHumidity}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Nitrogen (N kg/ha)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={nitrogen}
              onChangeText={setNitrogen}
            />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Phosphorus (P kg/ha)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={phosphorus}
              onChangeText={setPhosphorus}
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Potassium (K kg/ha)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={potassium}
              onChangeText={setPotassium}
            />
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.predictBtn, loading && styles.predictBtnDisabled]}
        onPress={handleAnalyze}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.predictBtnText}> Analyzing Models...</Text>
          </View>
        ) : (
          <Text style={styles.predictBtnText}>🔍 Analyze Health & Predict Yield</Text>
        )}
      </TouchableOpacity>

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
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginVertical: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
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
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  cardDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyImagePlaceholder: {
    height: 150,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  placeholderIcon: {
    fontSize: 34,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  changeImageText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCamera: {
    backgroundColor: '#059669',
  },
  btnGallery: {
    backgroundColor: '#0284c7',
  },
  btnSample: {
    backgroundColor: '#7c3aed',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  cropSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  cropOption: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  cropOptionActive: {
    borderColor: '#22c55e',
    backgroundColor: '#064e3b',
  },
  cropEmoji: {
    fontSize: 22,
  },
  cropText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  cropTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  presetLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  presetBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  predictBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  predictBtnDisabled: {
    backgroundColor: '#15803d',
    opacity: 0.7,
  },
  predictBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
