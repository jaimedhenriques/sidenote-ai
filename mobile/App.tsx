import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const consentMessage = 'I am using SideNote AI to help me take notes and generate a transcript/summary from this meeting. Please let me know if you would prefer I turn it off.';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>CONSENT-FIRST MEETING NOTES</Text>
        <Text style={styles.title}>SideNote AI</Text>
        <Text style={styles.lede}>Mobile companion for private AI meeting notes. Mac recorder handles local Zoom/Teams capture without a bot.</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>Before recording</Text>
          <Text style={styles.body}>{consentMessage}</Text>
          <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Copy consent message</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>MVP scope</Text>
          <Text style={styles.body}>• Meeting library and search\n• Generated notes and action items\n• Export/share summaries\n• No stealth recording\n• No bot joins calls</Text>
        </View>

        <View style={styles.cardMuted}>
          <Text style={styles.heading}>Store review note</Text>
          <Text style={styles.body}>Android/iOS MVP is a companion app. Local meeting audio capture is handled by the macOS companion with visible manual controls and consent confirmation.</Text>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080b12' },
  container: { padding: 24, gap: 18 },
  eyebrow: { color: '#8bd8ff', fontWeight: '800', letterSpacing: 1.8, fontSize: 12 },
  title: { color: '#eef4ff', fontSize: 44, fontWeight: '900' },
  lede: { color: '#b8c7df', fontSize: 18, lineHeight: 26 },
  card: { borderColor: '#1f2a44', borderWidth: 1, borderRadius: 22, padding: 18, backgroundColor: '#0d1320' },
  cardMuted: { borderColor: '#294061', borderWidth: 1, borderRadius: 22, padding: 18, backgroundColor: '#0a1524' },
  heading: { color: '#eef4ff', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  body: { color: '#c7d7ef', fontSize: 15, lineHeight: 22 },
  button: { marginTop: 14, backgroundColor: '#3478f6', borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
