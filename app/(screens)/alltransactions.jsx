import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collectionGroup, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';
import { InteractionManager } from 'react-native'; // add this at top if not already


import { auth } from '../../config/firebaseconfig';

const AllTransactionsScreen = () => {
  const router = useRouter();
  const { txnId } = useLocalSearchParams();
  const flatListRef = React.useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { isDarkMode } = useTheme();

  // Theme colors
  const theme = useMemo(() => {
    if (isDarkMode) {
      return {
        bg: '#111',
        card: '#181818',
        text: '#fff',
        textSecondary: '#aaa',
        border: '#222',
        accent: '#fff',
        inputBg: '#181818',
        inputBorder: '#333',
        amountBg: '#222',
        duesBg: '#222',
        icon: '#fff',
        amountText: '#fff',
        duesText: '#fff',
        receipt: '#fff',
        plan: '#fff',
      };
    } else {
      return {
        bg: '#f7f7f7',
        card: '#fff',
        text: '#222',
        textSecondary: '#888',
        border: '#eee',
        accent: '#4F8EF7',
        inputBg: '#fff',
        inputBorder: '#ddd',
        amountBg: '#eafaf1',
        duesBg: '#fff6e9',
        icon: '#4F8EF7',
        amountText: '#27ae60',
        duesText: '#e67e22',
        receipt: '#4F8EF7',
        plan: '#4F8EF7',
      };
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  // Scroll to the transaction if txnId is present
  useEffect(() => {
    if (!txnId || !transactions.length) return;
    const idx = transactions.findIndex(
      t => t.receiptId === txnId || t.id === txnId
    );
    if (idx >= 0) {
  InteractionManager.runAfterInteractions(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: idx, animated: true });
    }
  });
}
  }, [txnId, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
  // If you want to filter by admin, use auth.currentUser?.uid
  // let q = query(collectionGroup(db, 'transactions'), orderBy('paymentDate', 'desc'));
  let adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  let q = query(collectionGroup(db, 'transactions'),  where("adminId","==", adminId), orderBy('paymentDate', 'desc'));
  // To filter only this admin's transactions, you can add a where clause if your data model supports it:
  // q = query(q, where('adminId', '==', adminId));
      if (startDate && endDate) {
        // Inclusive filter: start 00:00:00, end 23:59:59
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        q = query(q, where('paymentDate', '>=', start.toISOString()), where('paymentDate', '<=', end.toISOString()));
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        q = query(q, where('paymentDate', '>=', start.toISOString()));
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        q = query(q, where('paymentDate', '<=', end.toISOString()));
      }
      const snapshot = await getDocs(q);
      const txns = snapshot.docs.map(docSnap => {
        const txn = docSnap.data();
        return {
          id: docSnap.id,
          receiptId: txn.receiptId || '',
          memberName: txn.memberName || txn.name || '',
          paymentDate: txn.paymentDate,
          amountPaid: txn.amountPaid,
          planName: txn.planname || '',
          planDetail: txn.planDetail || '',
          dues: txn.dues || 0,
        };
      });
      setTransactions(txns);
    } catch (e) {
      setTransactions([]);
    }
    setLoading(false);
  };

  const renderCard = ({ item, highlight }) => (
    <View style={[
      styles.cardModern,
      { backgroundColor: theme.card, borderLeftColor: theme.accent, shadowColor: theme.accent },
      highlight ? { borderWidth: 2, borderColor: theme.accent, borderRadius: 18 } : null
    ]}>
      <View style={styles.cardRowTop}>
        <View style={styles.cardLeftCol}>
          <Text style={[styles.receiptIdModern, { color: theme.receipt }]}>#{item.receiptId || item.id?.slice(0, 9)}</Text>
          <Text style={[styles.nameModern, { color: theme.text }]}>{item.memberName}</Text>
        </View>
        <View style={styles.cardRightCol}>
          <Text style={[styles.amountModern, { color: theme.amountText, backgroundColor: theme.amountBg }]}>₹{item.amountPaid}</Text>
        </View>
      </View>
      <View style={styles.cardRowMid}>
        <Text style={[styles.planModern, { color: theme.plan }] }>
          {item.planName}
          {item.planDetail ? ` (${item.planDetail})` : ''}
        </Text>
        <Text style={[styles.duesModern, { color: theme.duesText, backgroundColor: theme.duesBg }]}>Dues: ₹{item.dues}</Text>
      </View>
      <View style={styles.cardRowBottom}>
        <Text style={[styles.dateModern, { color: theme.textSecondary }]}>{formatDate(item.paymentDate)}</Text>
      </View>
    </View>
  );

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm} | ${month} ${day}, ${year}`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header - moved lower with more margin */}
      <View style={styles.headerWrapper}>
        <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }] }>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={{ padding: 8, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color={theme.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Transactions</Text>
        </View>
      </View>
      {/* Filter by date in between */}
      <View style={styles.filterBetweenRow}>
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Filter by date in between:</Text>
        <View style={styles.filterColumnBetween}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.dateFilterBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }] }>
            <Ionicons name="calendar-outline" size={18} color={theme.icon} />
            <Text style={[styles.dateFilterText, { color: theme.text }]}>{startDate ? formatDate(startDate) : 'Start Date'}</Text>
          </TouchableOpacity>
          <Text style={{ marginVertical: 4, alignSelf: 'center', color: theme.textSecondary }}>to</Text>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.dateFilterBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }] }>
            <Ionicons name="calendar-outline" size={18} color={theme.icon} />
            <Text style={[styles.dateFilterText, { color: theme.text }]}>{endDate ? formatDate(endDate) : 'End Date'}</Text>
          </TouchableOpacity>
          {(startDate || endDate) && (
            <TouchableOpacity onPress={() => { setStartDate(null); setEndDate(null); }} style={{ marginTop: 8, alignSelf: 'center' }}>
              <Ionicons name="close-circle" size={20} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
      {/* Transaction List */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.icon} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => {
            // Highlight if matches txnId
            const highlight = txnId && (item.receiptId === txnId || item.id === txnId);
            return renderCard({ item, highlight });
          }}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.textSecondary }}>No transactions found.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    marginTop: 36,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  filterBetweenRow: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  filterLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
    marginLeft: 2,
  },
  filterColumnBetween: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 0,
    marginTop: 0,
    gap: 2,
  },
  dateFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f8ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateFilterText: {
    color: '#4F8EF7',
    marginLeft: 6,
    fontSize: 15,
  },
  cardModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    padding: 18,
    flexDirection: 'column',
    borderLeftWidth: 5,
    borderLeftColor: '#4F8EF7',
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardLeftCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  cardRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 80,
  },
  receiptIdModern: {
    color: '#4F8EF7',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  nameModern: {
    color: '#222',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 0,
  },
  amountModern: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 20,
    backgroundColor: '#eafaf1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
    marginLeft: 8,
  },
  cardRowMid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  planModern: {
    color: '#4F8EF7',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
    flex: 1,
  },
  duesModern: {
    color: '#e67e22',
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: '#fff6e9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
    marginLeft: 8,
  },
  cardRowBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  dateModern: {
    color: '#888',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});

export default AllTransactionsScreen;
