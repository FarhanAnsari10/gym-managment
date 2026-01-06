// Utility to get today's date string in yyyy-mm-dd
function getTodayDateStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Function to mark all members as absent for today (runs once per day)
async function markAllMembersAbsentOncePerDay() {
  try {
    const lastRunKey = 'lastAbsentMarkDate';
    const todayStr = getTodayDateStr();
    // Use localStorage for web, AsyncStorage for React Native
    let lastRun = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      lastRun = window.localStorage.getItem(lastRunKey);
    } else {
      // React Native AsyncStorage
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        lastRun = await AsyncStorage.getItem(lastRunKey);
      } catch {}
    }
    if (lastRun === todayStr) return; // Already ran today

    // Check if today is Sunday (0 = Sunday)
    const todayDateObj = new Date();
    if (todayDateObj.getDay() === 0) {
      console.log('[Attendance] Today is Sunday. Marking as holiday, no absents.');
      // Optionally, you can mark all as holiday in attendance collection:
  const { auth } = require('../../config/firebaseconfig');
  const adminId = auth.currentUser?.uid;
  if (!adminId) return;
  const membersSnap = await getDocs(collection(db, 'admin', adminId, 'members'));
      for (const memberDoc of membersSnap.docs) {
        const memberId = memberDoc.id;
        const attendanceRef = doc(db, 'admin', adminId, 'members', memberId, 'attendance', todayStr);
        await setDoc(attendanceRef, {
          status: 'holiday',
          date: todayStr,
          markedAt: new Date().toISOString(),
        }, { merge: true });
      }
      // Save last run date
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(lastRunKey, todayStr);
      } else {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(lastRunKey, todayStr);
        } catch {}
      }
      return;
    }

    console.log('[Attendance] Marking all members absent for', todayStr);

  const { auth } = require('../../config/firebaseconfig');
  const adminId = auth.currentUser?.uid;
  if (!adminId) return;
  const membersSnap = await getDocs(collection(db, 'admin', adminId, 'members'));
    for (const memberDoc of membersSnap.docs) {
      const memberId = memberDoc.id;
      const attendanceRef = doc(db, 'admin', adminId, 'members', memberId, 'attendance', todayStr);
      const attendanceSnap = await getDocs(collection(db, 'admin', adminId, 'members', memberId, 'attendance'));
      let alreadyPresent = false;
      attendanceSnap.forEach(docSnap => {
        if (docSnap.id === todayStr && docSnap.data().status === 'present') {
          alreadyPresent = true;
        }
      });
      if (!alreadyPresent) {
        await setDoc(attendanceRef, {
          status: 'absent',
          date: todayStr,
          markedAt: new Date().toISOString(),
        }, { merge: true });
      }
    }
    // Save last run date
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(lastRunKey, todayStr);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(lastRunKey, todayStr);
      } catch {}
    }
  } catch (err) {
    console.error('Error marking all members absent:', err);
  }
}

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { reload } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMemberPlanRemainingDays } from '../../assets/container/memberexpiry';
import { auth, db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentPlanDetails } from '../hooks/getCurrentPlanDetails';

const FILTERS = ['all', 'active', 'expired', 'dues', 'paid'];

export default function App() {
  const params = useLocalSearchParams();
  useEffect(() => {
    markAllMembersAbsentOncePerDay();
  }, []);
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [expiringDays, setExpiringDays] = useState(null);
  const [adminId, setAdminId] = useState(auth.currentUser?.uid || "");

  // On mount, check for expiringDays or paymentStatus param
  useEffect(() => {
    if (params && params.expiringDays) {
      setExpiringDays(params.expiringDays);
      setSelectedFilter('all'); // Show all, but filter by expiringDays
    } else {
      setExpiringDays(null);
    }
    if (params && params.paymentStatus) {
      setPaymentStatus(params.paymentStatus);
    } else {
      setPaymentStatus(null);
    }
  }, [params]);

  // Helper to clear paymentStatus param from navigation state
  const clearPaymentStatusParam = () => {
    if (params && params.paymentStatus) {
      router.replace({ pathname: '/(tabs)/member' });
    }
  };

  // Helper to clear expiringDays param from navigation state
  const clearExpiringDaysParam = () => {
    if (params && params.expiringDays) {
      // Remove expiringDays from URL params using router.replace
      router.replace({ pathname: '/(tabs)/member' });
    }
  };

  // Reset expiringDays and paymentStatus filter only on unmount (when user leaves the page)
  useEffect(() => {
    return () => {
      setExpiringDays(null);
      setPaymentStatus(null);
    };
  }, []);

  // Summary counts
  const totalCount = members.length;
  const activeCount = members.filter(m => m.activemember).length;
  const expiredCount = members.filter(m => m.expiredmember).length;
  const newCount = members.filter(m => m.newmember).length;

  const fetchMembers = async () => {
    try {
      const user = auth.currentUser;
      await reload(user);
      const adminId = auth.currentUser?.uid;
      if (!adminId) return;
      let q = collection(db, 'admin', adminId, 'members');
      if (selectedFilter === 'active') {
        q = query(q, where('activemember', '==', true));
      } else if (selectedFilter === 'expired') {
        q = query(q, where('expiredmember', '==', true));
      } else if (selectedFilter === 'new') {
        q = query(q, where('newmember', '==', true));
      } else if (selectedFilter === 'dues') {
        // Dues: fetch all, filter in JS for dues > 0
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort: new members first, then by createdAt desc if available
        data = data.sort((a, b) => {
          if (a.newmember && !b.newmember) return -1;
          if (!a.newmember && b.newmember) return 1;
          // Both same group, sort by createdAt desc if available
          if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
          return 0;
        });
        setMembers(data.filter(m => parseFloat(m.dues) > 0));
        return;
      }
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort: new members first, then by createdAt desc if available
      data = data.sort((a, b) => {
        if (a.newmember && !b.newmember) return -1;
        if (!a.newmember && b.newmember) return 1;
        // Both same group, sort by createdAt desc if available
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [selectedFilter]);

  const [paymentStatus, setPaymentStatus] = useState(null);
  useEffect(() => {
    async function filterMembers() {
      let results = members.filter(member =>
        member && member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (expiringDays) {
        const [min, max] = String(expiringDays).split('-').map(Number);
        // For each member, get remaining days from Firestore
        const adminId = auth.currentUser?.uid;
        if (!adminId) {
          setFilteredMembers([]);
          return;
        }
        const filtered = [];
        for (const member of results) {
          if (!member.id) continue;
          let days = await getMemberPlanRemainingDays(adminId, member.id);
          if (typeof days === 'string') continue;
          if (days >= min && days <= max) filtered.push(member);
        }
        setFilteredMembers(filtered);
      } else if (paymentStatus) {
        // For each member, get current plan details and filter by payment status
        const adminId = auth.currentUser?.uid;
        if (!adminId) {
          setFilteredMembers([]);
          return;
        }
        const filtered = [];
        for (const member of results) {
          if (!member.id) continue;
          const plan = await getCurrentPlanDetails(adminId, member.id);
          if (!plan) continue;
          const dues = parseFloat(plan.dues || 0);
          const paid = parseFloat(plan.amountPaid || 0);
          if (paymentStatus === 'fullyPaid' && dues === 0 && paid > 0) filtered.push(member);
          else if (paymentStatus === 'partiallyPaid' && dues > 0 && paid > 0) filtered.push(member);
          else if (paymentStatus === 'notPaid' && paid === 0) filtered.push(member);
        }
        setFilteredMembers(filtered);
      } else {
        setFilteredMembers(results);
      }
    }
    filterMembers();
  }, [searchQuery, members, expiringDays, paymentStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMembers();
    } catch (error) {
      console.error('Error refreshing members:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Store plan details for each member by id
  const [planDetailsMap, setPlanDetailsMap] = useState({});
  useEffect(() => {
    const adminId = auth.currentUser?.uid;
    if (!adminId) return;
    const fetchAllPlans = async () => {
      const updates = {};
      for (const member of filteredMembers) {
        if (member && member.id) {
          const plan = await getCurrentPlanDetails(adminId, member.id);
          updates[member.id] = plan;
        }
      }
      setPlanDetailsMap(updates);
    };
    fetchAllPlans();
  }, [filteredMembers]);

  const renderMemberCard = (member) => {
    if (!member || !member.name) return <View style={{ ...styles.card, backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', borderColor: isDarkMode ? '#333' : '#eee' }} />;
    // Card color logic
    let cardBg = '#fff';
    let textColor = '#181818';
    if (isDarkMode) {
      if (member.expiredmember) { cardBg = '#434343'; textColor = '#eee'; }
      else if (member.activemember) { cardBg = '#131313'; textColor = '#fff'; }
      else if (member.newmember) { cardBg = '#232323'; textColor = '#fff'; }
    } else {
      if (member.expiredmember) { cardBg = '#121212'; textColor = '#fff'; }
      else if (member.newmember) { cardBg = '#fff'; textColor = '#131313'; }
      else if (member.activemember) { cardBg = '#f5f5f5'; textColor = '#181818'; }
    }

    // Get plan details from map
    const planDetails = planDetailsMap[member.id];
    let remainingDays = 'N/A';
  let planExpiry = '';
  let planExpiryColor = textColor;
    let dues = '0';
    if (planDetails) {
      if (planDetails.planExpireDate) {
        const today = new Date();
        const expiry = new Date(planDetails.planExpireDate);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        remainingDays = diff >= 0 ? `${diff} D` : 'Expired';
        planExpiry = diff > 0 ? `${diff} D` : 'Expired';
        // Set color: orange if below 7, red if 0 or below
        if (diff <= 0) planExpiryColor = '#e53835bf';
        else if (diff < 8) planExpiryColor = '#FFA500';
          // If expired, update member status in Firestore
          if (diff <= 0 && member.activemember && !member.expiredmember) {
            // Only update if not already expired
            const updateMemberStatus = async () => {
              try {
                await updateDoc(doc(db, 'admin', adminId, 'members', member.id), {
                  activemember: false,
                  expiredmember: true
                });
              } catch (e) {
                console.error('Failed to update member status:', e);
              }
            };
            updateMemberStatus();
          }
      }
      dues = planDetails.dues || '0';
    }

    // Avatar border color logic
  let avatarBorder = '#14A166'; // active: green (matches summary card)
  if (member.expiredmember) avatarBorder = '#e53935'; // expired: red (matches summary card)
  else if (member.newmember) avatarBorder = '#bdbdbd'; // new: gray

        if (!adminId) {
          return <View style={{ ...styles.card, backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', borderColor: isDarkMode ? '#333' : '#eee' }} />;
        }
    return (
      <TouchableOpacity
        style={{ ...styles.card, backgroundColor: cardBg, borderColor: isDarkMode ? '#333' : '#e0e0e0' }}
        key={member.id || Math.random()}
        onPress={() => {
          router.push({
            pathname: '/(screens)/memberDetails',
            params: { memberId: member.id, memberData: JSON.stringify(member) }
          });
        }}
        onLongPress={() => {
          setMemberToDelete(member);
          setDeleteModalVisible(true);
        }}
      >
        <View style={{ flex: 1, width: '100%', justifyContent: 'space-between' }}>
          {/* Top row: avatar and info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <Image
              source={
                member.imageUrl?.data
                  ? { uri: member.imageUrl?.data }
                  : require('../../assets/images/Avatar/man3.png')
              }
              style={[
                styles.avatar,
                {
                  marginRight: 10,
                  width: 32,
                  height: 32,
                  borderWidth: 2,
                  borderColor: avatarBorder,
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ ...styles.name, color: textColor, fontSize: 13, marginBottom: 2 }}>{member.name || 'Unknown'}</Text>
              <Text style={{ fontSize: 9, color: textColor, opacity: 0.7 }}>+91 {member.mobile || ''}</Text>
            </View>
          </View>
          {/* Bottom row: Remaining and Due Amount */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: textColor, opacity: 0.7, marginBottom: 2 }}>Plan Expiry</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: planExpiryColor }}>{planExpiry || 'N/A'}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9, color: textColor, opacity: 0.7, marginBottom: 2 }}>Due Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: textColor }}>₹{dues}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const groupIntoPairs = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];
    const pairs = [];
    for (let i = 0; i < arr.length; i += 2) {
      pairs.push([arr[i], arr[i + 1]]);
    }
    return pairs;
  };

  // Delete member from Firebase
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
          const adminId = auth.currentUser?.uid;
      // Delete from Firestore
      await deleteDoc(doc(db, 'admin', adminId, 'members', memberToDelete.id));
          if (!adminId) {
            setDeleteModalVisible(false);
            setMemberToDelete(null);
            return;
          }

      // Delete from Cloudinary if image exists
      if (memberToDelete.imageUrl && memberToDelete.imageUrl.public_id) {
        try {
          // You need a backend endpoint or a secure function to delete from Cloudinary
          await fetch('https://your-backend-endpoint/delete-cloudinary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: memberToDelete.imageUrl.public_id })
          });
        } catch (cloudErr) {
          console.error('Error deleting image from Cloudinary:', cloudErr);
        }
      }

      setDeleteModalVisible(false);
      setMemberToDelete(null);
      await fetchMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#181818' : '#fff' }}>
      {/* Delete confirmation modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: isDarkMode ? '#232323' : '#fff', padding: 24, borderRadius: 16, alignItems: 'center', width: 280 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 12 }}>Delete this person?</Text>
            <Text style={{ color: isDarkMode ? '#fff' : '#181818', marginBottom: 24 }}>Are you sure you want to delete {memberToDelete?.name}?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Pressable onPress={() => setDeleteModalVisible(false)} style={{ flex: 1, marginRight: 8, padding: 10, borderRadius: 8, backgroundColor: '#ccc', alignItems: 'center' }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDeleteMember} style={{ flex: 1, marginLeft: 8, padding: 10, borderRadius: 8, backgroundColor: '#e53935', alignItems: 'center' }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontWeight: 'bold' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
        <TouchableOpacity
          onPress={() => {
            clearExpiringDaysParam();
            router.replace('/(tabs)/home');
          }}
          style={{ marginRight: 10, padding: 4 }}
        >
          <Ionicons name="chevron-back" size={26} color={isDarkMode ? '#fff' : '#181818'} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818' }}>
          {expiringDays ? `Expiring in ${expiringDays} days` : 'Members'}
        </Text>
      </View>
      {/* Search bar */}
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#232323' : '#f0f0f0',
      borderRadius: 20,
      paddingHorizontal: 12,
      height: 42,
      shadowColor: isDarkMode ? '#000' : '#aaa',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2, // Android shadow
    }}
  >
    {/* Search Icon */}
    <Ionicons
      name="search"
      size={20}
      color={isDarkMode ? '#aaa' : '#888'}
      style={{ marginRight: 10 }}
    />

    {/* Input */}
    <TextInput
      style={{
        flex: 1,
        color: isDarkMode ? '#fff' : '#181818',
        fontSize: 16,
        paddingVertical: 0,
      }}
      placeholder="Search"
      placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
      value={searchQuery}
      onChangeText={setSearchQuery}
      returnKeyType="search"
    />

    {/* Clear Button */}
    {searchQuery.length > 0 && (
      <Pressable
        onPress={() => setSearchQuery('')}
        android_ripple={{ color: isDarkMode ? '#555' : '#ccc', borderless: true }}
        style={{ padding: 4 }}
      >
        <Ionicons
          name="close-circle"
          size={20}
          color={isDarkMode ? '#aaa' : '#888'}
        />
      </Pressable>
    )}
  </View>
</View>

        {/* <TouchableOpacity style={{ marginLeft: 10, backgroundColor: isDarkMode ? '#232323' : '#fff', borderRadius: 8, padding: 8 }}>
          <Ionicons name="options-outline" size={20} color={isDarkMode ? '#fff' : '#181818'} />
        </TouchableOpacity> */}
      {/* </View> */}
      {/* Filter bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'new', label: 'New' },
          { key: 'expired', label: 'Expired' },
          { key: 'dues', label: 'Dues' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 16,
              backgroundColor: selectedFilter === f.key ? (isDarkMode ? '#14A166' : '#e0e0e0') : (isDarkMode ? '#232323' : '#f5f5f5'),
              marginRight: 6,
            }}
            onPress={() => {
              clearExpiringDaysParam();
              clearPaymentStatusParam();
              setSelectedFilter(f.key);
            }}
          >
            <Text style={{ fontSize: 12, color: selectedFilter === f.key ? (isDarkMode ? '#fff' : '#181818') : (isDarkMode ? '#fff' : '#181818') }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Scrollable content below search */}
      <View style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 }}>
              <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#111' : '#222' }]}> 
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Total</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 28 }}>{totalCount}</Text>
                {/* <Text style={{ color: '#fff', fontSize: 12 }}>-0.03%</Text> */}
              </View>
              <View style={[styles.summaryCard, { borderColor: '#fff', backgroundColor: isDarkMode ? '#111' : '#fff' , borderWidth: 1 }]}> 
                <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 18 }}>Expire</Text>
                <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 28 }}>{expiredCount}</Text>
                {/* <Text style={{ color: '#e53935', fontSize: 12 }}>-0.03%</Text> */}
              </View>
              <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#232323' : '#e0e0e0', borderWidth: 1 }]}> 
                <Text style={{ color: '#14A166', fontWeight: 'bold', fontSize: 18 }}>Active</Text>
                <Text style={{ color: '#14A166', fontWeight: 'bold', fontSize: 28 }}>{activeCount}</Text>
                {/* <Text style={{ color: '#14A166', fontSize: 12 }}>-0.03%</Text> */}
              </View>
              <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#111' : '#fff' , borderColor: '#e0e0e0', borderWidth: 1 }]}> 
                <Text style={{ color: '#777', fontWeight: 'bold', fontSize: 18 }}>New</Text>
                <Text style={{ color: '#aaa', fontWeight: 'bold', fontSize: 28 }}>{newCount}</Text>
                {/* <Text style={{ color: '#181818', fontSize: 12 }}>-0.03%</Text> */}
              </View>
            </View>
          }
          data={groupIntoPairs(filteredMembers)}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDarkMode ? '#111' : '#4F8EF7']}
              tintColor={isDarkMode ? '#323232' : '#4F8EF7'}
              title="Pull to refresh"
              titleColor={isDarkMode ? '#323232' : '#4F8EF7'}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {renderMemberCard(item && item[0])}
              {renderMemberCard(item && item[1])}
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: isDarkMode ? '#fff' : '#181818' }}>No members found.</Text>}
        />
      </View>
      <View style={{ height: 80 }}></View>
    </SafeAreaView>
  );
 
}

const styles = StyleSheet.create({
   summaryCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'flex-start',
    elevation: 2
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#181818',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 12,
    color: '#181818',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 0.4,
    borderColor: '#e0e0e0',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 0,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    color: '#181818',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  left: { fontSize: 12, color: '#181818' },
  right: { fontSize: 12, color: '#c0392b' },
});
