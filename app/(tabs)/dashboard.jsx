import { Ionicons } from '@expo/vector-icons';
import { collection, collectionGroup, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
// Bar Chart for Income vs Dues
import { useRef } from 'react';
import { getMemberPlanRemainingDays } from '../../assets/container/memberexpiry';
import { db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';
function IncomeDuesBarChart({ incomeArr, duesArr }) {
  // Make the chart much wider than the screen for scroll
  const { isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width - 32;
  const extraRight = 60; // Extra space at right for last value
  const width = Math.max(screenWidth, 60 * MONTHS.length + 80 + extraRight); // 60px per month + padding + extra
  const height = 340; // Further increased height for more space below
  const padding = 48; // Slightly more padding for y-axis
  const bottomSpace = 68; // Extra space below x-axis
  const chartW = width - padding * 2 - extraRight/2;
  const chartH = height - padding - bottomSpace;
  const maxY = Math.max(...incomeArr, ...duesArr, 1);
  const barW = 24;
  const gap = 18;
  const scrollRef = useRef();
  // Colors for dark/light mode
  const bgColor = isDarkMode ? '#232323' : '#fff';
  const axisColor = isDarkMode ? '#aaa' : '#444';
  const gridColor = isDarkMode ? '#333' : '#eee';
  const labelColor = isDarkMode ? '#ccc' : '#181818';
  const monthLabelColor = isDarkMode ? '#aaa' : '#888';
  const incomeBarColor = isDarkMode ? '#4F8EF7' : '#181818';
  const duesBarColor = isDarkMode ? '#e67e22' : '#8e44ad';
  const legendIncomeColor = incomeBarColor;
  const legendDuesColor = duesBarColor;
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const monthIdx = now.getMonth();
      // Calculate x offset to center current month
      const x = padding + monthIdx * (barW * 2 + gap) - screenWidth / 2 + barW;
      scrollRef.current.scrollTo({ x: Math.max(0, x), animated: true });
    }
  }, []);
  // Y axis values (fixed)
  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map((p, i) => {
    const y = padding + chartH - p * chartH;
    const val = Math.round(maxY * p);
    return (
      <SvgText key={i} x={padding - 8} y={y + 4} fontSize="11" fill={axisColor} textAnchor="end">{val}</SvgText>
    );
  });
  const yAxisGrid = [0, 0.25, 0.5, 0.75, 1].map((p, i) => {
    const y = padding + chartH - p * chartH;
    return (
      <Line key={i} x1={padding} x2={width - padding} y1={y} y2={y} stroke={gridColor} strokeWidth={1} />
    );
  });
  return (
    <View style={{ backgroundColor: bgColor, borderRadius: 18, marginBottom: 18, padding: 10, flexDirection: 'row' }}>
      {/* Fixed Y axis */}
      <View style={{ width: padding, height, position: 'relative', zIndex: 2 }}>
        <Svg width={padding} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
          {yAxisGrid}
          {yAxisLabels}
        </Svg>
      </View>
      {/* Scrollable chart */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ minWidth: screenWidth }}
        style={{ flex: 1 }}
      >
        <Svg width={width - padding} height={height}>
          <G>
            {/* Gridlines (skip y-axis, already drawn) */}
            {/* X axis labels and bars */}
            {MONTHS.map((m, i) => {
              const x = (i * (barW * 2 + gap)) + 8;
              const income = incomeArr[i] || 0;
              const dues = duesArr[i] || 0;
              const incomeH = (income / maxY) * chartH;
              const duesH = (dues / maxY) * chartH;
              return (
                <G key={m}>
                  {/* Income bar */}
                  <Rect x={x} y={padding + chartH - incomeH} width={barW} height={incomeH} fill={incomeBarColor} rx={4} />
                  {/* Dues bar */}
                  <Rect x={x + barW + 4} y={padding + chartH - duesH} width={barW} height={duesH} fill={duesBarColor} rx={4} />
                  {/* Month label */}
                  <SvgText x={x + barW} y={padding + chartH + 18} fontSize="12" fill={monthLabelColor} textAnchor="middle">{m}</SvgText>
                  {/* Income and Dues values below month, spaced apart */}
                  <SvgText x={x + barW} y={padding + chartH + 34} fontSize="11" fill={incomeBarColor} textAnchor="middle">{income}</SvgText>
                  <SvgText x={x + barW} y={padding + chartH + 48} fontSize="11" fill={duesBarColor} textAnchor="middle">{dues}</SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </ScrollView>
      {/* Legend */}
      <View style={{ position: 'absolute', bottom: 8, left: padding + 10, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 18 }}>
          <View style={{ width: 18, height: 8, backgroundColor: legendIncomeColor, borderRadius: 2, marginRight: 6 }} />
          <Text style={{ color: legendIncomeColor, fontSize: 13 }}>Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 18, height: 8, backgroundColor: legendDuesColor, borderRadius: 2, marginRight: 6 }} />
          <Text style={{ color: legendDuesColor, fontSize: 13 }}>Dues</Text>
        </View>
      </View>
    </View>
  );
}
// Helper: get month names
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Responsive Line Chart Component
// import React, { useRef } from 'react';
function RevenueLineChart({ thisYear, lastYear, isDarkMode }) {
  // Make the chart less stretched horizontally (reduce x-axis distribution)
  // Use theme for dark/light mode
  const theme = useTheme();
  isDarkMode = theme?.isDarkMode ?? isDarkMode;
  const screenWidth = Dimensions.get('window').width - 32;
  const extraRight = 60;
  const monthSpacing = 38; // Reduced from 60 to 38 for closer months
  const width = Math.max(screenWidth, monthSpacing * MONTHS.length + 80 + extraRight);
  const height = 340;
  const padding = 48;
  const bottomSpace = 48;
  const chartW = width - padding * 2 - extraRight/2;
  const chartH = height - padding - bottomSpace;
  const maxY = Math.max(...thisYear, ...lastYear, 1);
  const scrollRef = useRef();
  // Colors for dark/light mode
  const bgColor = isDarkMode ? '#232323' : '#fff';
  const axisColor = isDarkMode ? '#aaa' : '#444';
  const gridColor = isDarkMode ? '#333' : '#eee';
  const labelColor = isDarkMode ? '#ccc' : '#181818';
  const monthLabelColor = isDarkMode ? '#aaa' : '#888';
  const thisYearLineColor = isDarkMode ? '#4F8EF7' : '#333';
  const lastYearLineColor = isDarkMode ? '#aaa' : '#aaa';
  const dotColor = isDarkMode ? '#4F8EF7' : '#4F8EF7';
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const monthIdx = now.getMonth();
      const x = padding + monthIdx * (chartW / 11) - screenWidth / 2 + 30;
      scrollRef.current.scrollTo({ x: Math.max(0, x), animated: true });
    }
  }, []);
  // Y axis values (fixed)
  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map((p, i) => {
    const y = padding + chartH - p * chartH;
    const val = Math.round(maxY * p);
    return (
      <SvgText key={i} x={padding - 8} y={y + 4} fontSize="11" fill={axisColor} textAnchor="end">{val}</SvgText>
    );
  });
  const yAxisGrid = [0, 0.25, 0.5, 0.75, 1].map((p, i) => {
    const y = padding + chartH - p * chartH;
    return (
      <Line key={i} x1={padding} x2={width - padding} y1={y} y2={y} stroke={gridColor} strokeWidth={1} />
    );
  });
  // X: 12 months, closer together
  const points = (data) => data.map((v, i) => [
    padding + i * monthSpacing,
    padding + chartH - (v / maxY) * chartH
  ]);
  function getSmoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` Q${cx},${y0} ${x1},${y1}`;
    }
    return d;
  }
  const thisPts = points(thisYear);
  const lastPts = points(lastYear);
  return (
    <View style={{ backgroundColor: bgColor, borderRadius: 18, marginBottom: 18, padding: 10, flexDirection: 'row' }}>
      {/* Fixed Y axis */}
      <View style={{ width: padding, height, position: 'relative', zIndex: 2 }}>
        <Svg width={padding} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
          {yAxisGrid}
          {yAxisLabels}
        </Svg>
      </View>
      {/* Scrollable chart */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ minWidth: screenWidth }}
        style={{ flex: 1 }}
      >
        <Svg width={width - padding} height={height}>
          <G>
            {/* X axis labels */}
            {MONTHS.map((m, i) => (
              <SvgText key={m} x={padding + i * monthSpacing} y={padding + chartH + 18} fontSize="12" fill={monthLabelColor} textAnchor="middle">{m}</SvgText>
            ))}
            {/* Last year dashed line */}
            <Path d={getSmoothPath(lastPts)} stroke={lastYearLineColor} strokeWidth={2} fill="none" strokeDasharray="6,4" />
            {/* This year solid line */}
            <Path d={getSmoothPath(thisPts)} stroke={thisYearLineColor} strokeWidth={3} fill="none" />
            {/* Dots for this year */}
            {thisPts.map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r={2} fill={dotColor} />
            ))}
          </G>
        </Svg>
      </ScrollView>
      {/* Legend */}
      <View style={{ position: 'absolute', bottom: 8, left: padding + 10, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 18 }}>
          <View style={{ width: 18, height: 3, backgroundColor: thisYearLineColor, borderRadius: 2, marginRight: 6 }} />
          <Text style={{ color: thisYearLineColor, fontSize: 13 }}>This year</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 18, height: 3, backgroundColor: lastYearLineColor, borderRadius: 2, marginRight: 6, borderStyle: 'dashed', borderWidth: 1, borderColor: lastYearLineColor }} />
          <Text style={{ color: lastYearLineColor, fontSize: 13 }}>Last year</Text>
        </View>
      </View>
    </View>
  );
}

import { auth } from '../../config/firebaseconfig';

import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';

export default function Dashboard() {
  // --- Revenue data for chart ---
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartData, setChartData] = useState({ thisYear: Array(12).fill(0), lastYear: Array(12).fill(0) });
  const [duesData, setDuesData] = useState(Array(12).fill(0));
  const [graphTab, setGraphTab] = useState(0); // 0: Income/Dues, 1: Revenue
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ members: 0, active: 0, expired: 0, new: 0, dues: 0 });
  const [expiringSoon, setExpiringSoon] = useState({ d1_3: 0, d4_7: 0, d8_15: 0 });
  const [expiryLoading, setExpiryLoading] = useState(true);
  const [revenue, setRevenue] = useState({ month: 0, year: 0, total: 0 });
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });
  const [transactions, setTransactions] = useState([]);
  const [monthAdmissionFee, setMonthAdmissionFee] = useState(0);

  // Extracted fetchData for use in pull-to-refresh
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      // Define today at the top
      const today = new Date();
      // Revenue for chart (fetch selected year and previous year)
      const thisYearNum = selectedYear;
      const lastYearNum = selectedYear - 1;
      const getYearData = async (yearNum) => {
        const yearStr = yearNum.toString();
        const uid = auth.currentUser?.uid;
        if (!uid) return { income: Array(12).fill(0), dues: Array(12).fill(0) };
        const summaryRef = doc(db, 'admin', uid, 'financialSummary', yearStr);
        const docSnap = await getDoc(summaryRef);
        let arr = Array(12).fill(0);
        let duesArr = Array(12).fill(0);
        if (docSnap.exists()) {
          const data = docSnap.data();
          for (let m = 1; m <= 12; m++) {
            const key = m.toString().padStart(2, '0');
            arr[m - 1] = data.monthly?.[key]?.income || 0;
            duesArr[m - 1] = data.monthly?.[key]?.dues || 0;
          }
        }
        return { income: arr, dues: duesArr };
      };
      const [thisYearObj, lastYearObj] = await Promise.all([
        getYearData(thisYearNum),
        getYearData(lastYearNum)
      ]);
      setChartData({ thisYear: thisYearObj.income, lastYear: lastYearObj.income });
      setDuesData(thisYearObj.dues);

      // Members summary
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const membersSnap = await getDocs(collection(db, 'admin', uid, 'members'));
      // Fetch current plan details for each member
      const { getCurrentPlanDetails } = await import('../hooks/getCurrentPlanDetails');
      const membersRaw = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Fetch plan details in parallel
      const members = await Promise.all(membersRaw.map(async m => {
        const plan = await getCurrentPlanDetails(uid, m.id);
        return { ...m, currentPlan: plan };
      }));
      // Only count members with a valid currentPlan
      const validMembers = members.filter(m => m.currentPlan);
      const total = validMembers.length;
      const active = validMembers.filter(m => m.activemember).length;
      const expired = validMembers.filter(m => m.expiredmember).length;
      const newMembers = validMembers.filter(m => m.newmember).length;
      const dues = validMembers.reduce((sum, m) => sum + (parseFloat(m.dues) || 0), 0);
      // Calculate payment buckets
      let fullyPaidCount = 0, fullyPaidAmount = 0;
      let partiallyPaidCount = 0, partiallyPaidAmount = 0, partiallyPaidDues = 0;
      let notPaidCount = 0;
      validMembers.forEach(m => {
        // Use currentPlan for dues and amountPaid
        const paid = parseFloat(m.currentPlan?.amountPaid) || 0;
        const duesVal = parseFloat(m.currentPlan?.dues) || 0;
        // Fully paid: dues == 0 and paid > 0
        if (duesVal === 0 && paid > 0) {
          fullyPaidCount++;
          fullyPaidAmount += paid;
        }
        // Partially paid: dues > 0 and paid > 0
        else if (duesVal > 0 && paid > 0) {
          partiallyPaidCount++;
          partiallyPaidAmount += paid;
          partiallyPaidDues += duesVal;
        }
        // Not paid: dues > 0 and paid == 0
        else if (duesVal > 0 && paid === 0) {
          notPaidCount++;
        }
      });
      setSummary({
        members: total, active, expired, new: newMembers, dues,
        fullyPaidCount, fullyPaidAmount,
        partiallyPaidCount, partiallyPaidAmount, partiallyPaidDues,
        notPaidCount
      });

      // Expiry buckets: 1-3d, 4-7d, 8-15d (using getMemberPlanRemainingDays)
      setExpiryLoading(true);
      let d1_3 = 0, d4_7 = 0, d8_15 = 0;
      const expiryPromises = members.map(async m => {
        if (!m.id) return null;
        const days = await getMemberPlanRemainingDays(uid, m.id);
        if (typeof days === 'number') {
          if (days >= 1 && days <= 3) d1_3++;
          else if (days >= 4 && days <= 7) d4_7++;
          else if (days >= 8 && days <= 15) d8_15++;
        }
      });
      await Promise.all(expiryPromises);
      setExpiringSoon({ d1_3, d4_7, d8_15 });
      setExpiryLoading(false);

      // Revenue summary
      const year = today.getFullYear().toString();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const summaryRef = doc(db, 'admin', uid, 'financialSummary', year);
      const docSnap = await getDoc(summaryRef);
      let monthIncome = 0, yearIncome = 0, totalIncome = 0, admissionFeeThisMonth = 0;
      if (docSnap.exists()) {
        const data = docSnap.data();
        monthIncome = data.monthly?.[month]?.income || 0;
        yearIncome = Object.values(data.monthly || {}).reduce((sum, m) => sum + (m.income || 0), 0);
        totalIncome = data.totalIncome || yearIncome;
        admissionFeeThisMonth = data.monthly?.[month]?.admissionFee || 0;
      }
      setRevenue({ month: monthIncome, year: yearIncome, total: totalIncome });
      setMonthAdmissionFee(admissionFeeThisMonth);
  // State for current month's admissionFee
 

      // Attendance summary (today)
      const q = query(
  collectionGroup(db, 'attendance'),
  where('adminId', '==', uid)
);
console.log('Attendance query:', q);
const attendanceSnap = await getDocs(q);

      // const attendanceSnap = await getDocs(collectionGroup(db, 'attendance'));
      let present = 0, absent = 0;
      const todayStr = today.toISOString().slice(0, 10);
      attendanceSnap.forEach(doc => {
        const data = doc.data();
        if (data.date === todayStr) {
          if (data.status === 'present') present++;
          else if (data.status === 'absent') absent++;
        }
      });
      setAttendance({ present, absent });

      // Recent transactions
      const txnSnap = await getDocs(query(collectionGroup(db, 'transactions'), orderBy('paymentDate', 'desc'), limit(5)));
      const txns = txnSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txns);
    } catch (e) {
      setError(e.message || 'Error loading dashboard');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const onRefresh = () => {
    fetchData(true);
  };

  if (loading) {
     return (
      <View style={[styles.center, { backgroundColor: isDarkMode ? '#181818' : '#f7f7f7' }]}> 
        <ActivityIndicator size="large" color={isDarkMode ? '#4F8EF7' : '#4F8EF7'} />
        <Text style={{ marginTop: 8, color: isDarkMode ? '#fff' : '#181818' }}>Loading dashboard...</Text>
      </View>
    );
  }
  if (error) {
    return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#181818' : '#f7f7f7' }}>
      {/* Custom Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 32 : 32,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? '#181818' : '#f7f7f7',
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#232323' : '#eee',
        elevation: 2,
        zIndex: 10
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, marginRight: 10 }}>
          <Ionicons name="arrow-back" size={26} color={isDarkMode ? '#fff' : '#181818'} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818' }}>Dashboard</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
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
      >
        {/* Year Selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedYear(selectedYear - 1)}
            style={{ padding: 8, backgroundColor: '#eee', borderRadius: 8, marginRight: 10 }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginHorizontal: 8 }}>{selectedYear}</Text>
          <TouchableOpacity
            onPress={() => setSelectedYear(selectedYear + 1)}
            style={{ padding: 8, backgroundColor: '#eee', borderRadius: 8, marginLeft: 10 }}
            disabled={selectedYear >= currentYear}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: selectedYear >= currentYear ? '#aaa' : '#181818' }}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        {/* Graph Switcher */}
        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 8, backgroundColor: '#222', borderRadius: 12, overflow: 'hidden' }}>
          <TouchableOpacity onPress={() => setGraphTab(0)} style={{ paddingVertical: 8, paddingHorizontal: 24, backgroundColor: graphTab === 0 ? '#fff' : 'transparent', borderRadius: 12 }}>
            <Text style={{ color: graphTab === 0 ? '#181818' : '#fff', fontWeight: 'bold', fontSize: 15 }}>Income/Dues</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGraphTab(1)} style={{ paddingVertical: 8, paddingHorizontal: 24, backgroundColor: graphTab === 1 ? '#fff' : 'transparent', borderRadius: 12 }}>
            <Text style={{ color: graphTab === 1 ? '#181818' : '#fff', fontWeight: 'bold', fontSize: 15 }}>Revenue</Text>
          </TouchableOpacity>
        </View>
        {/* Graphs */}
        {graphTab === 0 ? (
          <>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 8, alignSelf: 'center' }}>Overview</Text>
            <IncomeDuesBarChart incomeArr={chartData.thisYear} duesArr={duesData} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 8, alignSelf: 'center' }}>Revenue Graph</Text>
            <RevenueLineChart thisYear={chartData.thisYear} lastYear={chartData.lastYear} isDarkMode={isDarkMode} />
          </>
        )}
        {/* Expiring Soon Containers */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 8 }}>Expiring Members</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#e53935', borderRadius: 14, padding: 14, marginRight: 6, alignItems: 'center' }}
            onPress={() => router.push({ pathname: '/(tabs)/member', params: { expiringDays: '1-3' } })}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{expiryLoading ? '...' : expiringSoon.d1_3}</Text>
            <Text style={{ color: '#fff', fontSize: 13 }}>1-3 days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#e67e22', borderRadius: 14, padding: 14, marginHorizontal: 6, alignItems: 'center' }}
            onPress={() => router.push({ pathname: '/(tabs)/member', params: { expiringDays: '4-7' } })}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{expiryLoading ? '...' : expiringSoon.d4_7}</Text>
            <Text style={{ color: '#fff', fontSize: 13 }}>4-7 days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#4F8EF7', borderRadius: 14, padding: 14, marginLeft: 6, alignItems: 'center' }}
            onPress={() => router.push({ pathname: '/(tabs)/member', params: { expiringDays: '8-15' } })}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{expiryLoading ? '...' : expiringSoon.d8_15}</Text>
            <Text style={{ color: '#fff', fontSize: 13 }}>8-15 days</Text>
          </TouchableOpacity>
        </View>
        {/* Member Summary */}
      <View style={styles.row}>
        <DashboardCard icon="people" label="Members" value={summary.members} color="#4F8EF7" isDarkMode={isDarkMode} />
        <DashboardCard icon="person" label="Active" value={summary.active} color="#14A166" isDarkMode={isDarkMode} />
      </View>
      <View style={styles.row}>
        <DashboardCard icon="alert-circle" label="Expired" value={summary.expired} color="#e53935" isDarkMode={isDarkMode} />
        <DashboardCard icon="person-add" label="New" value={summary.new} color="#bdbdbd" isDarkMode={isDarkMode} />
      </View>
      {/* Financial Summary Heading */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 8, marginTop: 8, alignSelf: 'center' }}>Financial Summary</Text>
      <View style={{ gap: 14 }}>
        {/* All Members Container */}
        <View style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#333' : '#eee' }]}> 
          <Text style={styles.summaryTitle}>All Members</Text>
          <Text style={styles.summaryText}>Total Revenue: <Text style={styles.summaryValue}>₹{revenue.total}</Text></Text>
          <Text style={styles.summaryText}>Total Income ({new Date().getFullYear()}): <Text style={styles.summaryValue}>₹{revenue.year}</Text></Text>
          <Text style={styles.summaryText}>Total Dues: <Text style={styles.summaryValue}>₹{summary.dues}</Text></Text>
        </View>
        {/* Admission Fee Income for Current Month */}
        <View style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#333' : '#eee', alignItems: 'center' }]}> 
          <Text style={styles.summaryTitle}>Admission Fee Income ({new Date().toLocaleString('default', { month: 'short' })})</Text>
          <Text style={{ fontSize: 18, color: '#4F8EF7', fontWeight: 'bold', marginTop: 6 }}>₹ {monthAdmissionFee}</Text>
        </View>
        {/* Fully Paid Members */}
        <TouchableOpacity
          style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#14A16622' : '#e8f5e9', borderColor: isDarkMode ? '#14A166' : '#81c784' }]}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(tabs)/member', params: { paymentStatus: 'fullyPaid' } })}
        >
          <Text style={styles.summaryTitle}>Fully Paid Members</Text>
          <Text style={styles.summaryText}>Count: <Text style={styles.summaryValue}>{summary.fullyPaidCount || 0}</Text></Text>
          <Text style={styles.summaryText}>Amount: <Text style={styles.summaryValue}>₹{summary.fullyPaidAmount || 0}</Text></Text>
          <Text style={styles.summaryText}>Dues: <Text style={styles.summaryValue}>₹0</Text></Text>
        </TouchableOpacity>
        {/* Partially Paid Members */}
        <TouchableOpacity
          style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#e67e2222' : '#fff3e0', borderColor: isDarkMode ? '#e67e22' : '#ffb74d' }]}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(tabs)/member', params: { paymentStatus: 'partiallyPaid' } })}
        >
          <Text style={styles.summaryTitle}>Partially Paid Members</Text>
          <Text style={styles.summaryText}>Count: <Text style={styles.summaryValue}>{summary.partiallyPaidCount || 0}</Text></Text>
          <Text style={styles.summaryText}>Amount: <Text style={styles.summaryValue}>₹{summary.partiallyPaidAmount || 0}</Text></Text>
          <Text style={styles.summaryText}>Dues: <Text style={styles.summaryValue}>₹{summary.partiallyPaidDues || 0}</Text></Text>
        </TouchableOpacity>
        {/* Not Paid Members */}
        <TouchableOpacity
          style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#e5393522' : '#ffebee', borderColor: isDarkMode ? '#e53935' : '#e57373' }]}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(tabs)/member', params: { paymentStatus: 'notPaid' } })}
        >
          <Text style={styles.summaryTitle}>Not Paid Members</Text>
          <Text style={styles.summaryText}>Count: <Text style={styles.summaryValue}>{summary.notPaidCount || 0}</Text></Text>
        </TouchableOpacity>
      </View>
      {/* Revenue Section (previous big containers) */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 8, marginTop: 18, alignSelf: 'center' }}>Revenue</Text>
      <View style={styles.bigRow}>
        <DashboardCard icon="cash" label={`Revenue (${new Date().toLocaleString('default', { month: 'short' })})`} value={`₹${revenue.month}`} color="#4F8EF7" isDarkMode={isDarkMode} big />
        <DashboardCard icon="cash" label={`Revenue (${new Date().getFullYear()})`} value={`₹${revenue.year}`} color="#14A166" isDarkMode={isDarkMode} big />
      </View>
      <View style={styles.bigRow}>
        <DashboardCard icon="cash" label="Total Revenue" value={`₹${revenue.total}`} color="#181818" isDarkMode={isDarkMode} big />
        <DashboardCard icon="card" label="Total Dues" value={`₹${summary.dues}`} color="#e67e22" isDarkMode={isDarkMode} big />
      </View>
      {/* Attendance */}
      <View style={styles.row}>
        <DashboardCard icon="checkmark-circle" label="Present Today" value={attendance.present} color="#14A166" isDarkMode={isDarkMode} />
        <DashboardCard icon="close-circle" label="Absent Today" value={attendance.absent} color="#e53935" isDarkMode={isDarkMode} />
      </View>
      {/* Recent Transactions */}
      {/* <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#181818', marginTop: 18 }]}>Recent Transactions</Text>
      <View style={{ marginTop: 8 }}>
        {transactions.length === 0 ? (
          <Text style={{ color: isDarkMode ? '#aaa' : '#888', textAlign: 'center', marginVertical: 16 }}>No recent transactions.</Text>
        ) : (
          transactions.map(txn => (
            <View key={txn.id} style={[styles.txnCard, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#333' : '#eee' }]}> 
              <Ionicons name="card" size={28} color="#4F8EF7" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontWeight: 'bold', fontSize: 15 }}>{txn.memberName || 'Unknown'}</Text>
                <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 13 }}>{txn.paymentDate ? new Date(txn.paymentDate).toLocaleString() : ''}</Text>
              </View>
              <Text style={{ color: '#14A166', fontWeight: 'bold', fontSize: 16 }}>₹{txn.amountPaid}</Text>
            </View>
          ))
        )}
      </View> */}
      <View style = {{height: moderateScale(110)}}></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  card: { flex: 1.25, alignItems: 'center', marginHorizontal: 8, padding: 20, borderRadius: 16, borderWidth: 1, elevation: 2, minWidth: 110 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  txnCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  bigRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  bigCard: { flex: 1, alignItems: 'center', justifyContent: 'center', margin: 6, paddingVertical: 28, paddingHorizontal: 10, borderRadius: 18, borderWidth: 1, elevation: 3, minHeight: 110 },
  summaryContainer: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    marginHorizontal: 2
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#958f6bff',
    textAlign: 'center'
  },
  summaryText: {
    fontSize: 15,
    color: '#8c7979ff',
    marginBottom: 2,
    textAlign: 'center'
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#4F8EF7',
    fontSize: 15
  },
});

function DashboardCard({ icon, label, value, color, isDarkMode, big }) {
  return (
    <View style={[
      styles.card,
      big && styles.bigCard,
      { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#333' : '#eee' }
    ]}>
      <Ionicons name={icon} size={big ? 38 : 28} color={color} style={{ marginBottom: big ? 10 : 6, alignSelf: 'center' }} />
  <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontWeight: 'bold', fontSize: big ? 18 : 16, textAlign: 'center' }}>{value}</Text>
      <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: big ? 15 : 12, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}
