import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';

const CardItem = ({ card, onEdit, onDelete, onSetDefault }) => {
  const getCardIcon = (type) => {
    switch (type) {
      case 'uzcard':
        return 'card';
      case 'humo':
        return 'card';
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (type) => {
    switch (type) {
      case 'uzcard':
        return '#00A3E0';
      case 'humo':
        return '#E60050';
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      default:
        return colors.secondary;
    }
  };

  return (
    <View style={[styles.cardItem, { borderLeftColor: getCardColor(card.type) }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTypeContainer}>
          <View style={[styles.cardIcon, { backgroundColor: getCardColor(card.type) + '15' }]}>
            <Ionicons name={getCardIcon(card.type)} size={24} color={getCardColor(card.type)} />
          </View>
          <View>
            <Text style={styles.cardType}>{card.cardName}</Text>
            <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>
          </View>
        </View>
        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Asosiy</Text>
          </View>
        )}
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.cardExpiry}>Amal qilish muddati: {card.expiry}</Text>
      </View>

      <View style={styles.cardActions}>
        {!card.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetDefault(card.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Asosiy qilish</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(card)}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Tahrirlash</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(card.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>O'chirish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PaymentMethodsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([
    {
      id: 1,
      type: 'uzcard',
      cardName: 'UzCard',
      lastFour: '4532',
      expiry: '12/25',
      isDefault: true,
    },
  ]);

  const handleAddCard = () => {
    // TODO: Navigate to add card screen
    Alert.alert('Qo\'shish', 'Yangi karta qo\'shish funksiyasi tez orada qo\'shiladi');
  };

  const handleEditCard = (card) => {
    // TODO: Navigate to edit card screen
    Alert.alert('Tahrirlash', `${card.cardName} kartasini tahrirlash`);
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'O\'chirish',
      'Haqiqatan ham bu kartani o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(card => card.id !== cardId));
          },
        },
      ]
    );
  };

  const handleSetDefault = (cardId) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId,
    })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To'lov usullari</Text>
        <TouchableOpacity onPress={handleAddCard} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Karta ma'lumotlaringiz xavfsiz saqlanadi va shifrlangan holda uzatiladi.
          </Text>
        </View>

        {/* Cards List */}
        {cards.length > 0 && (
          <View style={styles.cardsList}>
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
                onSetDefault={handleSetDefault}
              />
            ))}
          </View>
        )}

        {/* Other Payment Methods */}
        <View style={styles.otherMethods}>
          <Text style={styles.sectionTitle}>Boshqa to'lov usullari</Text>

          <TouchableOpacity style={styles.methodItem}>
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#00CCFF15' }]}>
                <Ionicons name="wallet-outline" size={24} color="#00CCFF" />
              </View>
              <View>
                <Text style={styles.methodName}>Payme</Text>
                <Text style={styles.methodDescription}>Elektron hamyon</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodItem}>
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#FF990015' }]}>
                <Ionicons name="wallet-outline" size={24} color="#FF9900" />
              </View>
              <View>
                <Text style={styles.methodName}>Click</Text>
                <Text style={styles.methodDescription}>Elektron hamyon</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodItem}>
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: colors.secondary + '15' }]}>
                <Ionicons name="cash-outline" size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.methodName}>Naqd pul</Text>
                <Text style={styles.methodDescription}>Xizmat bajarilgandan so'ng</Text>
              </View>
            </View>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Tavsiya etiladi</Text>
            </View>
          </TouchableOpacity>
        </View>

        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyStateText}>Hozircha saqlangan kartalar yo'q</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddCard}>
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.addFirstButtonText}>Birinchi kartani qo'shish</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer with Add Button */}
      {cards.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addNewButton} onPress={handleAddCard}>
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.addNewButtonText}>Yangi karta qo'shish</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.info + '10',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  cardsList: {
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  cardItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.secondary + '15',
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardExpiry: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.gray50,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary,
  },
  otherMethods: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recommendedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.secondary + '15',
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  addFirstButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default PaymentMethodsScreen;
