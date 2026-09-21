import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Linking,
} from 'react-native';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'assistant',
    text: "Hello! I'm your TinyRide Support Assistant by Dodail. How can I help you today with your child's school transport, route timings, or monthly subscription?",
    timestamp: '08:00 AM',
  },
];

export default function SupportScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: 'Just now',
    };
    const lower = inputText.toLowerCase();

    let replyText =
      "I've logged your query for our Dodail Hyderabad Operations Team. An agent will follow up shortly.";
    if (lower.includes('refund') || lower.includes('cancel')) {
      replyText =
        'Refund Policy: You can cancel a monthly subscription before the 1st of the month for a 100% refund. Mid-month cancellations are prorated subject to a 5-day notice.';
    } else if (lower.includes('driver') || lower.includes('safety')) {
      replyText =
        'Every TinyRide driver undergoes background verification, commercial license audit, and Telangana Police Clearance before approval.';
    } else if (lower.includes('accident') || lower.includes('emergency')) {
      replyText =
        'EMERGENCY PROTOCOL ACTIVATED: Please immediately call TinyRide 24/7 Operations Lead at +91 40 4567 8900 or Dial 112/100.';
    }

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: 'Just now',
    };

    setMessages([...messages, userMsg, botMsg]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.sub}>Dodail 24/7 Safety & Assistance</Text>
      </View>

      {/* Hotline card */}
      <View style={styles.hotlineCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hotlineTitle}>Emergency & Safety Desk</Text>
          <Text style={styles.hotlinePhone}>+91 40 4567 8900 / 112</Text>
        </View>
        <TouchableOpacity
          style={styles.hotlineButton}
          onPress={() => Linking.openURL('tel:+914045678900')}
        >
          <Text style={styles.hotlineButtonText}>📞 Call Now</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.messageBubble,
              m.sender === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                m.sender === 'user' ? styles.userText : styles.assistantText,
              ]}
            >
              {m.text}
            </Text>
            <Text style={styles.timeText}>{m.timestamp}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about routes, fees, or policy..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '800', color: '#142B4A' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  hotlineCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotlineTitle: { fontSize: 12, fontWeight: '700', color: '#991B1B' },
  hotlinePhone: { fontSize: 14, fontWeight: '800', color: '#B91C1C', marginTop: 2 },
  hotlineButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  hotlineButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, gap: 12 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 14 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#142B4A' },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: { fontSize: 13, lineHeight: 18 },
  userText: { color: '#FFFFFF' },
  assistantText: { color: '#142B4A' },
  timeText: { fontSize: 10, color: '#94A3B8', alignSelf: 'flex-end', marginTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendButton: {
    backgroundColor: '#F07832',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
