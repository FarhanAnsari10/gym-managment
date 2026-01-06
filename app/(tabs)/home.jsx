// import { View, Text } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'

// const home = () => {
//   return (
//     <SafeAreaView>
//       <View style={styles.label}></View>
//     </SafeAreaView>
//   )
// }

// export default home



import colors from '@/assets/colors';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseconfig'; // your firebase config
// import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { collectionGroup, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from "react-native-size-matters";
import { ScrollView } from 'react-native-virtualized-view';
const screenWidth = Dimensions.get('window').width;




function DonutChart({ data, total, label, isDarkMode }) {
  // data: [{ value, color, label }]
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Helper to describe arc
  function describeArc(cx, cy, r, startAngle, endAngle) {
    const polarToCartesian = (cx, cy, r, angle) => {
      const a = (angle - 90) * Math.PI / 180.0;
      return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a)
      };
    };
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const arcSweep = endAngle - startAngle > 180 ? 1 : 0;
    return [
      "M", start.x, start.y,
      "A", r, r, 0, arcSweep, 1, end.x, end.y
    ].join(" ");
  }
  // Always draw a faint background ring (track)
  const trackColor = isDarkMode ? '#333' : '#e0e0e0';
  const arcs = [];
  let currentAngle = 0;
  // Only draw arcs if total > 0
  if (total > 0) {
    data.forEach((segment, i) => {
      const angle = (segment.value / total) * 360;
      const endAngle = currentAngle + angle;
      if (segment.value > 0) {
        arcs.push(
          <Path
            key={i}
            d={describeArc(cx, cy, radius, currentAngle, endAngle)}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        );
      }
      currentAngle = endAngle;
    });
  }
  // Center label color
  const labelColor = isDarkMode ? '#fff' : '#181818';
  const subLabelColor = isDarkMode ? '#aaa' : '#555';
  // Show income in the center
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {/* Always show background track */}
          <Path
            d={describeArc(cx, cy, radius, 0, 359.99)}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Donut arcs */}
          {arcs}
          {/* Center income label */}
          <SvgText
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            fontWeight="bold"
            fontSize="26"
            fill={labelColor}
          >
            {data[0]?.value?.toLocaleString() || 0}
          </SvgText>
          <SvgText
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fontSize="14"
            fill={subLabelColor}
          >
            Income
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}

const home = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [income, setIncome] = useState(0);
  const [dues, setDues] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const month = monthNames[today.getMonth()];
  const { auth } = require('../../config/firebaseconfig');
  const [adminUID, setAdminUID] = useState(auth.currentUser?.uid || "");

  // Fetching Current Month Income and Dues

  //     const fetchCurrentMonthSummary = async () => {
  //   try {
  //     const today = new Date();
  //     const year = today.getFullYear().toString();      // e.g., "2025"
  //     const month = String(today.getMonth() + 1).padStart(2, '0'); // "01" to "12"
  //     // setMonth(month);

  //     const summaryRef = doc(db, 'admin', adminUID, 'financialSummary', year);
  //     const docSnap = await getDoc(summaryRef);

  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       const monthly = data.monthly || {};

  //       const currentMonthData = monthly[month] || { income: 0, dues: 0 };
  //       console.log(`✅ Income: ₹${currentMonthData.income}, Dues: ₹${currentMonthData.dues}`);
  //         setIncome(currentMonthData.income);
  //          setDues(currentMonthData.dues);
  //       return currentMonthData;
  //     } else {
  //       console.log('📭 No financial summary document found.');

  //       return { income: 0, dues: 0 };
  //     }
  //   } catch (error) {
  //     console.error('❌ Error fetching current month summary:', error.message);
  //     return { income: 0, dues: 0 };
  //   }
  // };


  // const [summary, setSummary] = useState({ income: 0, dues: 0 });

  // useEffect(() => {
  //   const adminId = 'your_admin_uid_here';
  //   const getSummary = async () => {
  //     const currentMonthSummary = await fetchCurrentMonthSummary(adminId);
  //     setSummary(currentMonthSummary);
  //   };

  //   getSummary();
  //   setIncome(summary.income);
  //   setDues(summary.dues);
  // }, []);






  const fetchCurrentMonthSummary = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear().toString();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const summaryRef = doc(db, 'admin', uid, 'financialSummary', year);
      const docSnap = await getDoc(summaryRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentMonthData = data.monthly?.[month] || { income: 0, dues: 0 };
        setIncome(currentMonthData.income);
        setDues(currentMonthData.dues);
      } else {
        setIncome(0);
        setDues(0);
      }
    } catch (err) {
      console.error("Error loading summary:", err.message);
      setIncome(0);
      setDues(0);
    }
  };







  //  here fetching income and dues ends

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const querySnapshot = await getDocs(doc(db, 'admin', adminUID, 'financialSummary', String(year)));
  //     let incomeSum = 11000;
  //     let duesSum = 350;
  //     const data = querySnapshot.docs.map(doc => {
  //       const item = doc.data();
  //       if (item.type === 'income') incomeSum += item.amount;
  //       else duesSum += item.amount;
  //       return item;
  //     });
  //     setTransactions(data);
  //     setIncome(incomeSum);
  //     setDues(duesSum);
  //   };

  //   fetchData();
  // }, []);

  // Only two parameters: income and dues
  const chartData = [
    {
      value: income,
      color: '#313131', // Income: always light black
      label: 'Income',
    },
    {
      value: dues,
      color: '#888', // Dues: always grey
      label: 'Dues',
    },
  ];



 



  const fetchRecentTransactions = async (adminId) => {
    try {
      const q = query(
        collectionGroup(db, 'transactions'), where("adminId", "==", adminId),
        orderBy('paymentDate', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);
      console.log(`📦 Fetched ${snapshot.docs.length} transactions`);

      const transactions = [];

      for (const docSnap of snapshot.docs) {
        const txnData = docSnap.data();
        const pathSegments = docSnap.ref.path.split('/');
        const memberId = pathSegments[3];

  const memberRef = doc(db, 'admin', adminId, 'members', memberId);
        const memberSnap = await getDoc(memberRef);
        const memberData = memberSnap.exists() ? memberSnap.data() : {};

        transactions.push({
          id: docSnap.id,
          memberId,
          memberName: txnData.memberName || memberData.name || "Unknown",
          paymentDate: txnData.paymentDate,
          amountPaid: txnData.amountPaid,
          imageUrl: memberData.imageUrl || '',
          receiptId: txnData.receiptId || '',
        });
      }

      return transactions;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error.message);
      return [];
    }
  };


  // Manual refresh function
  const onRefresh = useCallback(async (uidParam) => {
    setRefreshing(true);
    try {
      const uid = uidParam || auth.currentUser?.uid;
      if (!uid) {
        setTransactions([]);
        setIncome(0);
        setDues(0);
        return;
      }
      await Promise.all([
        fetchCurrentMonthSummary(),
        fetchRecentTransactions(uid).then(setTransactions)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);


  // Listen for auth state changes to update data for the current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const newUID = user?.uid || "";
      setAdminUID(newUID);
      setTransactions([]); // Clear old transactions immediately
      setIncome(0);
      setDues(0);
      if (newUID) {
        onRefresh(newUID);
      }
    });
    // Initial load
    onRefresh(auth.currentUser?.uid);
    return () => unsubscribe && unsubscribe();
  }, []);







  return (
    <SafeAreaView style={{backgroundColor: isDarkMode ? '#181818' : '#fff' }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}>
        <Text style={[styles.greeting, { color: isDarkMode ? '#fff' : '#222' }]}>Hi, Admin</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
            <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={24} color={isDarkMode ? '#fff' : '#222'} />
          </TouchableOpacity>
          {/* <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#fff' : colors.gwhite} />
          </TouchableOpacity> */}
        </View>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#444' : '#4F8EF7']}
            tintColor={isDarkMode ? '#212121' : '#4F8EF7'}
            title="Pull to refresh"
            titleColor={isDarkMode ? '#333' : '#4F8EF7'}
          />
        }
      >
        <View style={styles.container2}>
          {/* Chart Name */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(tabs)/dashboard')}>
            <View style={[styles.finance_box, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}> 
              <Text style={[styles.chartTitle, { color: isDarkMode ? '#fff' : '#181818' }]}>Revenue</Text>
              <View style={[styles.finance_box_in, { backgroundColor: isDarkMode ? '#181818' : '#fff', borderColor: isDarkMode ? '#333' : '#e0e0e0' }]}> 
                <Text style={[styles.chartdate, { color: isDarkMode ? '#fff' : '#181818' }]}>{month}</Text>
                {/* Pie Chart */}
                <View style={{ alignItems: 'center', justifyContent: 'flex-start', height: 200, width: screenWidth * 0.8 }}>
                  <DonutChart
                    data={chartData}
                    total={income + dues}
                    label={""}
                    isDarkMode={isDarkMode}
                  />
                  {/* Legend */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.lblack, marginRight: 6 }} />
                      <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontSize: 13 }}>Income</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.dgray, marginRight: 6 }} />
                      <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontSize: 13 }}>Dues</Text>
                    </View>
                  </View>
                </View>
                {/* Income & Dues */}
                {/* <View style={styles.amountInfo_box}>
                  <View style={styles.amountInfo}>
                    <Text style={[styles.amountInfo_txt, { color: isDarkMode ? '#fff' : '#181818' }]}>Total Income: ₹{income}</Text>
                    <Text style={[styles.amountInfo_txt, { color: isDarkMode ? '#fff' : '#181818' }]}>Dues Amount: ₹{dues}</Text>
                  </View>
                  <View style={styles.amountInfo}>
                    <TouchableOpacity style={[styles.moreinfo, { backgroundColor: isDarkMode ? '#333' : '#808080' }]}><Text style={[styles.amountInfo_txt, { color: isDarkMode ? '#fff' : '#181818' }]}>More</Text></TouchableOpacity>
                  </View>
                </View> */}
              </View>
            </View>
          </TouchableOpacity>
          {/* Scan QR Container */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={{ marginTop: 18, marginBottom: 10 }}
            onPress={() => router.push('/(screens)/scanqr')}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '#232323' : '#fff',
              borderRadius: 16,
              paddingVertical: 18,
              marginHorizontal: 10,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
              borderWidth: 1,
              borderColor: isDarkMode ? '#333' : '#e0e0e0',
            }}>
              {/* <Ionicons name="scan-outline" size={32} color={isDarkMode ? '#fff' : '#616161'} style={{ marginRight: 14 }} /> */}
              <MaterialCommunityIcons name="qrcode-scan" size={35} color={isDarkMode ? '#fff' : '#333'} style={{ marginRight: 14 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>Mark Attendance</Text>
            </View>
          </TouchableOpacity>
          {/* Transactions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24, marginBottom: 2 }}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#181818', marginBottom: 0 }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(screens)/alltransactions')}>
              <Text style={{ color: '#4F8EF7', fontWeight: 'bold', fontSize: 15 }}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flatlisting}>
            {transactions.length > 0 ? (
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id + item.paymentDate}
                renderItem={({ item }) => {
                  // Status logic (mocked for demo, replace with real status if available)
                  let status = 'Sent';
                  let statusColor = '#4F8EF7';
                  if (item.status) {
                    if (item.status === 'Unsuccessful') { statusColor = '#E53935'; status = 'Unsuccessful'; }
                    else if (item.status === 'Pending') { statusColor = '#FFA726'; status = 'Pending'; }
                    else { statusColor = '#4F8EF7'; status = 'Sent'; }
                  } else {
                    // Demo: alternate status for variety
                    const idx = transactions.indexOf(item) % 3;
                    if (idx === 0) { status = 'Unsuccessful'; statusColor = '#E53935'; }
                    else if (idx === 1) { status = 'Sent'; statusColor = '#4F8EF7'; }
                    else { status = 'Pending'; statusColor = '#FFA726'; }
                  }
                  // Avatar color
                  const avatarColors = ['#FFB07C', '#FFD580', '#A5D8FF', '#B5EAD7', '#FFB5B5'];
                  const avatarColor = avatarColors[(item.memberName?.charCodeAt(0) || 0) % avatarColors.length];
                  // Date/time formatting
                  const d = new Date(item.paymentDate);
                  const hours = d.getHours();
                  const minutes = d.getMinutes().toString().padStart(2, '0');
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  const hour12 = hours % 12 || 12;
                  const day = d.getDate();
                  const month = d.toLocaleString('default', { month: 'short' });
                  const dateStr = `${day} ${month} ${d.getFullYear()}, ${hour12}:${minutes} ${ampm}`;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => router.push({
                        pathname: '/(screens)/alltransactions',
                        params: { txnId: item.receiptId || item.id }
                      })}
                    >
                      <View
                        style={[
                          styles.txnCardContainer,
                          {
                            backgroundColor: isDarkMode ? '#232323' : '#fff',
                            borderColor: isDarkMode ? '#333' : '#e0e0e0',
                            shadowColor: isDarkMode ? '#000' : '#bbb',
                          },
                        ]}
                      >
                        {/* Avatar: show image if available, else initial */}
                        {item.imageUrl?.data ? (
                          <Image
                            source={{ uri: item.imageUrl?.data }}
                            style={[
                              styles.txnAvatar,
                              {
                                backgroundColor: isDarkMode ? '#232323' : '#eee',
                                borderWidth: 1,
                                borderColor: isDarkMode ? '#444' : '#bbb',
                              },
                            ]}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.txnAvatar, { backgroundColor: avatarColor }]}> 
                            <Text style={[styles.txnAvatarText, { color: isDarkMode ? '#fff' : '#232323' }]}>{item.memberName?.[0]?.toUpperCase() || '?'}</Text>
                          </View>
                        )}
                        {/* Main content */}
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[styles.txnName, { color: isDarkMode ? '#fff' : '#181818' }]} numberOfLines={1}>{item.memberName}</Text>
                          <Text style={[styles.txnId, { color: isDarkMode ? '#bdbdbd' : '#888' }]}>{item.receiptId ? item.receiptId : (item.id?.slice(0, 9) || '')}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <Text style={[styles.txnDate, { color: isDarkMode ? '#b1b1b1' : '#888' }]}>{dateStr}</Text>
                          </View>
                        </View>
                        {/* Amount and status */}
                        <View style={{ alignItems: 'flex-end', justifyContent: 'center', minWidth: 80 }}>
                          <Text style={[styles.txnAmount, { color: isDarkMode ? '#fff' : '#181818' }]}>₹{item.amountPaid}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20, color: isDarkMode ? '#fff' : '#181818', height: 150 }}>
                💤 No recent transactions found.
              </Text>
            )}
          </View>
        </View>
        <View style={styles.blankbox}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 
  containe2: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    height: moderateScale(50),
    // width : moderateVerticalScale(100),
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  finance_box: {
    backgroundColor: '#fff',
    width: '100%',
    height: moderateScale(360),
    justifyContent: 'center',
    alignItems: 'center',
  },
  finance_box_in: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: moderateScale(280),
    height: moderateScale(280),
    borderRadius: moderateScale(13),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    marginVertical: 12,
    color: '#181818',
    alignSelf: 'flex-start',
    paddingLeft: 30,
    // paddintop : 10,
  },
  chartdate: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginVertical: 12,
    paddingLeft: 12,
    color: '#181818',
  },
  moreinfo: {

    alignItems: 'center',
    color: colors.gwhite,
    backgroundColor: '#808080',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    // borderWidth : 1,
    bordercolor: colors.lgray,
  },
  amountInfo_box: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    color: colors.gwhite,
    // backgroundColor : 'green',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  amountInfo: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    color: colors.gwhite,
  },
  amountInfo_txt: {
    textAlign: 'left',
    color: '#181818',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#181818',
    paddingLeft: 30,
    // backgroundColor : 'green'
  },
  flatlisting: {

    // backgroundColor : 'green',
    // justifyContent : 'center',
    alignItems: 'center',
  },
  // --- Transaction Card Redesign ---
  txnCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4, // Reduced gap between cards
    backgroundColor: '#181818',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    width: moderateScale(340),
    minHeight: moderateScale(80),
    borderWidth: 1,
    borderColor: '#232323',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  txnAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  txnAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  txnName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 0,
  },
  txnId: {
    color: '#bdbdbd',
    fontSize: 13,
    marginTop: 1,
    marginBottom: 1,
  },
  txnDate: {
    color: '#b1b1b1',
    fontSize: 13,
    marginLeft: 2,
  },
  txnAmount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 0,
  },
  txnStatus: {
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 0,
  },
  txnAccountType: {
    color: '#b1b1b1',
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    elevation: 3,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  blankbox: {
    width: 50,
    height: moderateScale(130),
    // borderRadius: 25,
  },
  donutCenterOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

});

export default home;
