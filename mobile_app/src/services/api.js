import { ADVISORY_DATA } from '../constants/advisory';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';

// Use the hosted API by default so the app works without a local dev server.
const DEFAULT_API_BASE_URL = 'https://crop-disease-and-yoeld-prediction.onrender.com';
const API_CONFIG_FILE = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}cropguard-api-config.json`;
let API_BASE_URL = DEFAULT_API_BASE_URL;

const normalizeBaseUrl = (url) => url.trim().replace(/\/+$/, '');

// Load a saved address once at startup. If the file does not exist yet, keep
// the hosted URL as the default.
const configReady = (async () => {
  try {
    const savedConfig = JSON.parse(await FileSystem.readAsStringAsync(API_CONFIG_FILE));
    if (typeof savedConfig.apiBaseUrl === 'string' && savedConfig.apiBaseUrl.trim()) {
      API_BASE_URL = normalizeBaseUrl(savedConfig.apiBaseUrl);
    }
  } catch {
    // First launch, or no valid saved configuration: use the hosted default.
  }
  return API_BASE_URL;
})();

export const getBaseUrl = () => API_BASE_URL;

export const loadBaseUrl = () => configReady;

export const setBaseUrl = async (url) => {
  if (!url || !url.trim()) return API_BASE_URL;
  await configReady;
  const cleanUrl = normalizeBaseUrl(url);
  API_BASE_URL = cleanUrl;
  await FileSystem.writeAsStringAsync(API_CONFIG_FILE, JSON.stringify({ apiBaseUrl: cleanUrl }));
  return API_BASE_URL;
};

// Check if backend is reachable
export const testConnection = async () => {
  try {
    await configReady;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, error: err.message || "Connection timed out" };
  }
};

// Send full inference request (Image + Soil/Environmental Features)
export const predictFull = async (imageUri, soilData) => {
  try {
    await configReady;
    const formData = new FormData();

    // Expo SDK 57 expects Blob/File values, not React Native's legacy { uri } part.
    const cleanUri = imageUri.split(/[?#]/, 1)[0];
    const filename = cleanUri.split('/').pop() || 'leaf.jpg';
    let imageFile;

    if (/^https?:\/\//i.test(imageUri)) {
      const imageResponse = await fetch(imageUri);
      if (!imageResponse.ok) {
        throw new Error(`Could not download the selected sample image (${imageResponse.status}).`);
      }
      imageFile = await imageResponse.blob();
    } else {
      imageFile = new File(imageUri);
    }

    formData.append('file', imageFile, filename);

    // Append soil & environmental parameters
    formData.append('crop_type', String(soilData.crop_type || 1));
    formData.append('soil_moisture', String(soilData.soil_moisture || 30.0));
    formData.append('soil_pH', String(soilData.soil_pH || 6.5));
    formData.append('temperature', String(soilData.temperature || 26.0));
    formData.append('rainfall', String(soilData.rainfall || 120.0));
    formData.append('humidity', String(soilData.humidity || 75.0));
    formData.append('nitrogen', String(soilData.nitrogen || 80.0));
    formData.append('phosphorus', String(soilData.phosphorus || 40.0));
    formData.append('potassium', String(soilData.potassium || 40.0));

    const response = await fetch(`${API_BASE_URL}/predict/full`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.warn("Live API call failed, offering fallback: ", error.message);
    return {
      success: false,
      error: error.message,
      canUseFallback: true
    };
  }
};

// Offline Demonstration Simulator (Safe fallback if network/server is unavailable during live faculty presentation)
export const getOfflineSimulation = (cropType, soilData) => {
  const isRice = cropType === 1;
  const crop = isRice ? "Rice" : "Wheat";

  const sampleDiseases = isRice 
    ? ["Bacterial Leaf Blight", "Brown Spot", "Healthy Rice Leaf", "Leaf Blast"]
    : ["Yellow Rust", "Healthy", "Fusarium Head Blight", "Septoria"];

  const randomDisease = sampleDiseases[Math.floor(Math.random() * sampleDiseases.length)];
  const isHealthy = randomDisease.includes("Healthy");

  const severity = isHealthy ? 0.0 : Math.round((0.15 + Math.random() * 0.45) * 1000) / 1000;
  const rawYield = 3800 + Math.random() * 800 - (severity * 1200);
  const finalYield = isHealthy ? Math.round(rawYield * 1.15) : Math.round(rawYield);

  const advisory = ADVISORY_DATA[randomDisease] || {
    treatment: "Consult local agronomy expert.",
    prevention: "Practice crop rotation and seed sanitation.",
    severity_impact: "Moderate"
  };

  return {
    status: "Success",
    is_simulation: true,
    crop: crop,
    disease: randomDisease,
    disease_confidence: `${(85 + Math.random() * 12).toFixed(1)}%`,
    confidence_score: 0.92,
    is_healthy: isHealthy,
    raw_severity: severity,
    severity: severity,
    severity_percentage: `${(severity * 100).toFixed(1)}%`,
    predicted_yield_kg_per_ha: finalYield,
    predicted_yield_tons_per_ha: roundNumber(finalYield / 1000.0, 2),
    healthy_yield_boost_applied: isHealthy,
    advisory: advisory
  };
};

const roundNumber = (num, dec) => Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
