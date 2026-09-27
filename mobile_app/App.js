import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import DiseaseGuideScreen from './src/screens/DiseaseGuideScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'result', 'guide', 'history', 'settings'
  const [currentResult, setCurrentResult] = useState(null);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedGuideDisease, setSelectedGuideDisease] = useState(null);

  // Navigate to Result
  const handleNavigateToResult = (result, imageUri) => {
    setCurrentResult(result);
    setCurrentImageUri(imageUri);
    setCurrentTab('result');
  };

  // Save scan to history
  const handleSaveHistory = (record) => {
    setHistoryList((prev) => [record, ...prev]);
  };

  // Jump from Result to Disease Guide
  const handleNavigateToGuide = (diseaseName) => {
    setSelectedGuideDisease(diseaseName);
    setCurrentTab('guide');
  };

  // Open historical scan
  const handleSelectHistoryItem = (item) => {
    setCurrentResult(item);
    setCurrentImageUri(item.imageUri || null);
    setCurrentTab('result');
  };

  // Clear history
  const handleClearHistory = () => {
    setHistoryList([]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* Main View Area */}
      <View style={styles.content}>
        {currentTab === 'home' && (
          <HomeScreen
            onNavigateToResult={handleNavigateToResult}
            onSaveHistory={handleSaveHistory}
            isDemoMode={isDemoMode}
          />
        )}

        {currentTab === 'result' && (
          <ResultScreen
            result={currentResult}
            imageUri={currentImageUri}
            onBack={() => setCurrentTab('home')}
            onNavigateToGuide={handleNavigateToGuide}
          />
        )}

        {currentTab === 'guide' && (
          <DiseaseGuideScreen initialDisease={selectedGuideDisease} />
        )}

        {currentTab === 'history' && (
          <HistoryScreen
            historyList={historyList}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            isDemoMode={isDemoMode}
            onToggleDemoMode={setIsDemoMode}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'home' && styles.navItemActive]}
          onPress={() => setCurrentTab('home')}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={[styles.navLabel, currentTab === 'home' && styles.navLabelActive]}>Analyze</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'guide' && styles.navItemActive]}
          onPress={() => {
            setSelectedGuideDisease(null);
            setCurrentTab('guide');
          }}
        >
          <Text style={styles.navIcon}>📖</Text>
          <Text style={[styles.navLabel, currentTab === 'guide' && styles.navLabelActive]}>Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'history' && styles.navItemActive]}
          onPress={() => setCurrentTab('history')}
        >
          <View style={styles.iconWithBadge}>
            <Text style={styles.navIcon}>📜</Text>
            {historyList.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{historyList.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navLabel, currentTab === 'history' && styles.navLabelActive]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentTab === 'settings' && styles.navItemActive]}
          onPress={() => setCurrentTab('settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[styles.navLabel, currentTab === 'settings' && styles.navLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#0f172a',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
