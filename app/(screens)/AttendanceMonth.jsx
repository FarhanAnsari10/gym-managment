
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';

import { auth } from '../../config/firebaseconfig';


const AttendanceMonth = () => {
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const memberId = params.memberId;
  const memberName = params.memberName;
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ count: 0, startDate: null });
  // Fetch streak info
  const fetchStreak = useCallback(async () => {
    if (!memberId) return;
    try {
  const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  // Fetch from member doc: admin/{adminId}/members/{memberId}
  const memberRef = doc(db, 'admin', adminId, 'members', memberId);
  const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        setStreakInfo({ count: data.attendanceStreak || 0, startDate: null });
      } else {
        setStreakInfo({ count: 0, startDate: null });
      }
    } catch (error) {
      setStreakInfo({ count: 0, startDate: null });
    }
  }, [memberId]);

  const fetchAttendance = useCallback(async (monthStr = currentMonth) => {
    if (!memberId) return;
    try {
  const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  // Correct Firestore path: admin/{adminId}/members/{memberId}/attendance
  const attendanceRef = collection(db, 'admin', adminId, 'members', memberId, 'attendance');
      const snapshot = await getDocs(attendanceRef);
      const marks = {};
      snapshot.forEach(doc => {
        const status = doc.data().status?.toLowerCase();
        if (status === 'present') {
          marks[doc.id] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: '#4CAF50' },
              text: { color: 'white', fontWeight: 'bold' },
            },
          };
        } else if (status === 'absent') {
          marks[doc.id] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: '#F44336' },
              text: { color: 'white', fontWeight: 'bold' },
            },
          };
        } else if (status === 'holiday' || status === 'sunday') {
          marks[doc.id] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: '#FFEB3B' }, // yellow
              text: { color: '#222', fontWeight: 'bold' },
            },
          };
        }
      });

      // Mark only the first column (Sunday) of each week as yellow for the visible month
      const [year, month] = monthStr.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      let d = new Date(firstDay);
      // Find the first Sunday in the month
      if (d.getDay() !== 0) {
        d.setDate(d.getDate() + (8 - d.getDay()));
      }
      // For each week, mark the Sunday (first column)
      while (d <= lastDay) {
        const dateStr = d.toISOString().slice(0, 10);
        if (!marks[dateStr]) {
          marks[dateStr] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: '#FFEB3B' },
              text: { color: '#222', fontWeight: 'bold' },
            },
          };
        }
        d.setDate(d.getDate() + 7); // Move to next Sunday
      }
      setMarkedDates(marks);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, [memberId, currentMonth]);

  useEffect(() => {
    fetchAttendance(currentMonth);
    fetchStreak();
  }, [fetchAttendance, fetchStreak, currentMonth]);


  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const mark = markedDates[day.dateString];
    if (mark) {
      const bg = mark.customStyles.container.backgroundColor;
      if (bg === '#4CAF50') {
        setSelectedStatus('Present');
      } else if (bg === '#F44336') {
        setSelectedStatus('Absent');
      } else if (bg === '#FFEB3B') {
        setSelectedStatus('Holiday/Sunday');
      }
    } else {
      setSelectedStatus('No Record');
    }
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#181818' : '#fff' }]}> 
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#181818' : '#fff', borderBottomColor: isDarkMode ? '#232323' : '#eee' }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#222' }]}>{memberName ? `${memberName}'s Attendance` : 'Attendance Calendar'}</Text>
        <View style={{ width: 26 }} />
      </View>
      <Calendar
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={onDayPress}
        onMonthChange={(month) => {
          const monthStr = `${month.year}-${String(month.month).padStart(2, '0')}`;
          setCurrentMonth(monthStr);
        }}
        enableSwipeMonths={true}
        theme={{
          todayTextColor: isDarkMode ? '#4F8EF7' : '#1976D2',
          arrowColor: isDarkMode ? '#4F8EF7' : '#1976D2',
          backgroundColor: isDarkMode ? '#181818' : '#fff',
          calendarBackground: isDarkMode ? '#232323' : '#fff',
          dayTextColor: isDarkMode ? '#fff' : '#222',
          textDisabledColor: isDarkMode ? '#888' : '#ccc',
          monthTextColor: isDarkMode ? '#fff' : '#222',
          textSectionTitleColor: isDarkMode ? '#aaa' : '#888',
          selectedDayBackgroundColor: isDarkMode ? '#4F8EF7' : '#1976D2',
          selectedDayTextColor: '#fff',
          todayBackgroundColor: isDarkMode ? '#232323' : '#fff',
        }}
        style={[styles.calendar, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}> 
            <Text style={[styles.modalDate, { color: isDarkMode ? '#4F8EF7' : '#1976D2' }]}>{selectedDate}</Text>
            <Text style={[styles.modalStatus, { color: isDarkMode ? '#fff' : '#222' }]}>{selectedStatus}</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Streak Info at the bottom */}
      <View style={[styles.streakContainer, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}> 
        <Ionicons name="flame" size={32} color="#ff7a00" style={{ marginBottom: 4 }} />
        <Text style={[styles.streakTitle, { color: isDarkMode ? '#aaa' : '#888' }]}>Current Streak</Text>
        <Text style={styles.streakCount}>{streakInfo.count} days</Text>
        {streakInfo.startDate && (
          <Text style={[styles.streakStart, { color: isDarkMode ? '#4F8EF7' : '#1976D2' }]}>Started: {streakInfo.startDate}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  calendar: {
    borderRadius: 12,
    elevation: 2,
    margin: 16,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 220,
    elevation: 4,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  modalStatus: {
    fontSize: 16,
    color: '#222',
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  streakTitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7a00',
    marginBottom: 2,
  },
  streakStart: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 2,
  },
});

export default AttendanceMonth;
