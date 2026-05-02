import AsyncStorage from '@react-native-async-storage/async-storage';
import {pick, keepLocalCopy, types} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AnimatedBackground } from './AnimatedBackground';
import { CommonLayout } from './CommonLayout';
import { GlassCard } from './GlassCard';
import { AppContext } from '../Context/AppContext';
import { ToastContext } from '../Context/ToastContext';
import { SqLiteHandler } from '../Utils/sqlite';
import {
  APP_DATA_EXPORT_META_KEY,
  snapshotToCsv,
  validateSnapshot,
} from '../Utils/backup';

type ExportMeta = {
  exportedAt?: string;
  importedAt?: string;
  lastJsonPath?: string;
  lastCsvPath?: string;
};

const stripFileScheme = (path: string) =>
  path.startsWith('file://') ? path.slice(7) : path;

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const SettingsScreen: React.FC = () => {
  const { sqliteHandler } = useContext(AppContext) as {
    sqliteHandler: SqLiteHandler | null;
  };
  const toastContext = useContext(ToastContext);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [meta, setMeta] = useState<ExportMeta>({});
  const [summary, setSummary] = useState<{
    expenses: number;
    workouts: number;
    goals: number;
  }>({
    expenses: 0,
    workouts: 0,
    goals: 0,
  });

  const loadSettingsState = React.useCallback(async () => {
    if (!sqliteHandler) {
      return;
    }

    try {
      const [snapshot, storedMeta] = await Promise.all([
        sqliteHandler.readStoredSnapshot(),
        AsyncStorage.getItem(APP_DATA_EXPORT_META_KEY),
      ]);

      if (snapshot) {
        setSummary({
          expenses: snapshot.data.expenses.length,
          workouts: snapshot.data.workoutLogs.length,
          goals: snapshot.data.goals.length,
        });
      }

      if (storedMeta) {
        setMeta(JSON.parse(storedMeta) as ExportMeta);
      }
    } catch (error) {
      console.error('Unable to load settings state', error);
    }
  }, [sqliteHandler]);

  useFocusEffect(
    React.useCallback(() => {
      loadSettingsState();
    }, [loadSettingsState]),
  );

  const saveMeta = async (nextMeta: ExportMeta) => {
    setMeta(nextMeta);
    await AsyncStorage.setItem(
      APP_DATA_EXPORT_META_KEY,
      JSON.stringify(nextMeta),
    );
  };

  const handleExportData = async () => {
    if (!sqliteHandler || !RNFS.DocumentDirectoryPath) {
      toastContext.showToast('File system not ready. Please try again.');
      return;
    }

    try {
      setIsExporting(true);
      const snapshot = await sqliteHandler.readAllDataSnapshot();
      const json = JSON.stringify(snapshot, null, 2);
      const csv = snapshotToCsv(snapshot);
      const exportDir = `${RNFS.DocumentDirectoryPath}/exports`;
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const jsonPath = `${exportDir}/expense-manager-backup-${stamp}.json`;
      const csvPath = `${exportDir}/expense-manager-backup-${stamp}.csv`;

      await RNFS.mkdir(exportDir);
      await RNFS.writeFile(jsonPath, json, 'utf8');
      await RNFS.writeFile(csvPath, csv, 'utf8');

      await Share.open({
        failOnCancel: false,
        urls: [`file://${jsonPath}`, `file://${csvPath}`],
        filenames: [
          `expense-manager-backup-${stamp}.json`,
          `expense-manager-backup-${stamp}.csv`,
        ],
        title: 'Export Data',
      });

      const nextMeta: ExportMeta = {
        ...meta,
        exportedAt: new Date().toISOString(),
        lastJsonPath: jsonPath,
        lastCsvPath: csvPath,
      };
      await saveMeta(nextMeta);
      toastContext.showToast('Data exported as JSON and CSV.');
      await loadSettingsState();
    } catch (error) {
      console.error('Export failed', error);
      toastContext.showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (!sqliteHandler || !RNFS.DocumentDirectoryPath) {
      toastContext.showToast('File system not ready. Please try again.');
      return;
    }

    try {
      setIsImporting(true);
      const [file] = await pick({
        type: [types.json],
      });

      const [localCopy] = await keepLocalCopy({
        files: [{
          uri: file.uri,
          fileName: file.name ?? `import-${Date.now()}.json`,
        }],
        destination: 'cachesDirectory'
      });

      const readablePath = localCopy.sourceUri ?? file.uri;
      const content = await RNFS.readFile(
        stripFileScheme(readablePath),
        'utf8',
      );
      const parsed = JSON.parse(content) as unknown;
      const validation = validateSnapshot(parsed);

      if (!validation.isValid || !validation.snapshot) {
        throw new Error(validation.errors.join(' '));
      }

      await sqliteHandler.restoreSnapshot(validation.snapshot);
      const nextMeta: ExportMeta = {
        ...meta,
        importedAt: new Date().toISOString(),
      };
      await saveMeta(nextMeta);
      toastContext.showToast('Backup imported successfully.');
      await loadSettingsState();
    } catch (error) {
        console.error('Import failed', error);
        toastContext.showToast('Import failed. Invalid or unsupported backup.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatedBackground>
      <CommonLayout>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <Text style={styles.overline}>Data safety</Text>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Export JSON and CSV backups, import validated snapshots, and keep
              an AsyncStorage mirror of app state.
            </Text>
          </View>

          <GlassCard style={styles.sectionCard} opacity={0.12}>
            <Text style={styles.sectionTitle}>Storage Summary</Text>
            <Text style={styles.sectionNote}>
              Live data stays in SQLite, while AsyncStorage keeps a validated
              snapshot for safer recovery.
            </Text>

            <View style={styles.metricRow}>
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>Expenses</Text>
                <Text style={styles.metricValue}>{summary.expenses}</Text>
              </View>
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>Workouts</Text>
                <Text style={styles.metricValue}>{summary.workouts}</Text>
              </View>
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>Goals</Text>
                <Text style={styles.metricValue}>{summary.goals}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.sectionCard} opacity={0.1}>
            <Text style={styles.sectionTitle}>Backup Actions</Text>
            <Text style={styles.infoText}>
              Last export: {formatDateTime(meta.exportedAt)}
            </Text>
            <Text style={styles.infoText}>
              Last import: {formatDateTime(meta.importedAt)}
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleExportData}
              disabled={isExporting || isImporting}
            >
              {isExporting ? (
                <ActivityIndicator color="#061017" />
              ) : (
                <Text style={styles.primaryButtonText}>Export Data</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleImportData}
              disabled={isExporting || isImporting}
            >
              {isImporting ? (
                <ActivityIndicator color="#18F7FF" />
              ) : (
                <Text style={styles.secondaryButtonText}>Import Data</Text>
              )}
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.sectionCard} opacity={0.08}>
            <Text style={styles.sectionTitle}>Import Safety</Text>
            <Text style={styles.infoText}>
              JSON backups are schema-validated before restore.
            </Text>
            <Text style={styles.infoText}>
              Restore runs inside a database transaction to reduce data-loss
              risk.
            </Text>
            <Text style={styles.infoText}>
              Exported files are written locally before the share sheet opens.
            </Text>
          </GlassCard>
        </ScrollView>
      </CommonLayout>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 18,
  },
  overline: {
    color: '#18F7FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(24,247,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionNote: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  infoText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#18F7FF',
  },
  primaryButtonText: {
    color: '#061017',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(24,247,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(24,247,255,0.24)',
  },
  secondaryButtonText: {
    color: '#18F7FF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default SettingsScreen;
