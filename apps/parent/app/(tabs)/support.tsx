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
  ActivityIndicator,
} from 'react-native';
import { processAIAssistantQuery } from '@tinyride/api-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  escalated?: boolean;
  ticketId?: string | null;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'assistant',
    text: "Hello! I'm your TinyRide Support Assistant by Dodail. How can I help you today with your child's school commute, route timings, or monthly subscription?",
    timestamp: '08:00 AM',
  },
];

export default function SupportScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await processAIAssistantQuery({
        user_id: 'p1111111-1111-1111-1111-111111111111',
        user_role: 'parent',
        message: userText,
        conversation_history: messages.slice(-4).map((m) => ({
          role: m.sender,
          content: m.text,
        })),
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: 'Just now',
        escalated: response.escalated,
        ticketId: response.ticket_id,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (_err) {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Our support service is currently experiencing high demand. For urgent assistance, please dial our 24/7 hotline at +91 40 4567 8900.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.sub}>Dodail 24/7 Ground Operations & AI Helpdesk</Text>
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
            {m.escalated && (
              <View style={styles.escalatedBadge}>
                <Text style={styles.escalatedBadgeText}>
                  🚨 Escalated to Operations Desk {m.ticketId ? `(#${m.ticketId.slice(0, 14)})` : ''}
                </Text>
              </View>
            )}
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

        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
            <ActivityIndicator size="small" color="#F07832" />
            <Text style={styles.typingText}>TinyRide Assistant is typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about routes, fees, or policy..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
        >
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
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 14 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#142B4A' },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  escalatedBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  escalatedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
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
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
