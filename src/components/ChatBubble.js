import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatBubble = ({ message, isMine = false, timestamp }) => {
  return (
    <View style={[styles.container, isMine && styles.containerMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{message}</Text>
        {timestamp && (
          <Text style={[styles.timestamp, isMine && styles.timestampMine]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  containerMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleOther: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  textMine: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  timestampMine: {
    color: 'rgba(255,255,255,0.8)',
  },
});

export default ChatBubble;
