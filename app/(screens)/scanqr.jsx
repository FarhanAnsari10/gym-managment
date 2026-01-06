

import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import colors from '../../assets/colors';
import cameraeffect from '../../assets/images/cameraeffect.json';
import { auth, db } from '../../config/firebaseconfig';
const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.8; // Increased camera area



export default function ScanQRScreen({ onScan }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);


  // const markAttendanceByMemberId = async (memberId) => {
  //   setAttendanceLoading(true);
  //   try {
  //     const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  //     // const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  //     const today = new Date();
  //     const yyyy = today.getFullYear();
  //     const mm = String(today.getMonth() + 1).padStart(2, '0');
  //     const dd = String(today.getDate()).padStart(2, '0');
  //     const dateStr = `${yyyy}-${mm}-${dd}`;

  //     // Calculate previous day's date string
  //     const prevDate = new Date(today);
  //     prevDate.setDate(today.getDate() - 1);
  //     const prevYyyy = prevDate.getFullYear();
  //     const prevMm = String(prevDate.getMonth() + 1).padStart(2, '0');
  //     const prevDd = String(prevDate.getDate()).padStart(2, '0');
  //     const prevDateStr = `${prevYyyy}-${prevMm}-${prevDd}`;

  //     let memberDocId = null;
  //     let memberName = null;
  //     let prevStreak = 0;

  //     // Try direct doc fetch first
  //     let memberRef = doc(db, 'admin', adminId, 'members', memberId);
  //     let memberSnap = await getDoc(memberRef);
  //     if (memberSnap.exists()) {
  //       const data = memberSnap.data();
  //       memberDocId = memberId;
  //       memberName = data.name || null;
  //       prevStreak = data.attendanceStreak || 0;
  //     } else {
  //       // Fallback: search for memberid field match
  //       const membersCol = collection(db, 'admin', adminId, 'members');
  //       let getDocs, query, where;
  //       try {
  //         ({ getDocs, query, where } = await import('firebase/firestore'));
  //       } catch (e) {
  //         Alert.alert('Error', 'Failed to import Firestore helpers.');
  //         setAttendanceLoading(false);
  //         return;
  //       }
  //       const q = query(membersCol, where('memberid', '==', memberId));
  //       const snap = await getDocs(q);
  //       if (!snap.empty) {
  //         const docSnap = snap.docs[0];
  //         memberDocId = docSnap.id;
  //         const data = docSnap.data();
  //         memberName = data.name || null;
  //         prevStreak = data.attendanceStreak || 0;
  //       }
  //     }

  //     if (!memberDocId) {
  //       Alert.alert('Error', 'Member not found.');
  //       setAttendanceLoading(false);
  //       return;
  //     }

  //     // 1️⃣ Check if today's attendance is already marked
  //     const attendanceRef = doc(db, 'admin', adminId, 'members', memberDocId, 'attendance', dateStr);
  //     const todayAttendanceSnap = await getDoc(attendanceRef);
  //     if (todayAttendanceSnap.exists()) {
  //       Alert.alert('Already Marked', 'Attendance for today is already marked. Streak will not increase again.');
  //       setAttendanceLoading(false);
  //       return;
  //     }

  //     // 2️⃣ Check previous day's attendance for streak logic
  //     const prevAttendanceRef = doc(db, 'admin', adminId, 'members', memberDocId, 'attendance', prevDateStr);
  //     let prevAttendanceSnap = await getDoc(prevAttendanceRef);
  //     let newStreak = 1;
  //     if (prevAttendanceSnap.exists()) {
  //       const prevData = prevAttendanceSnap.data();
  //       if (prevData.status === 'absent') {
  //         newStreak = 1;
  //       } else {
  //         newStreak = prevStreak + 1;
  //       }
  //     } else {
  //       newStreak = 1;
  //     }

  //     // 3️⃣ Mark attendance for today
  //     await setDoc(attendanceRef, {
  //       status: 'present',
  //       date: dateStr,
  //       markedAt: today.toISOString(),
  //     });

  //     // 4️⃣ Update streak in member document
  //     await setDoc(
  //       doc(db, 'admin', adminId, 'members', memberDocId),
  //       { attendanceStreak: newStreak },
  //       { merge: true }
  //     );

  //     // 5️⃣ Store streak in admin/streakcount/{memberId}
  //     await setDoc(
  //       doc(db, 'admin', adminId, 'streakcount', memberDocId),
  //       { streak: newStreak, memberId: memberDocId, updatedAt: today.toISOString() },
  //       { merge: true }
  //     );

  //     Alert.alert('Attendance Marked', `Attendance marked for ${memberName || 'Member'}\nStreak: ${newStreak}`);
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to mark attendance.');
  //   } finally {
  //     setAttendanceLoading(false);
  //   }
  // };



  // Function to mark attendance by memberId (scanned QR data)
  const markAttendanceByMemberId = async (memberId) => {
    setAttendanceLoading(true);
    try {
      const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Calculate previous day's date string
      const prevDate = new Date(today);
      prevDate.setDate(today.getDate() - 1);
      const prevYyyy = prevDate.getFullYear();
      const prevMm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const prevDd = String(prevDate.getDate()).padStart(2, '0');
      const prevDateStr = `${prevYyyy}-${prevMm}-${prevDd}`;

      let memberDocId = null;
      let memberName = null;
      let prevStreak = 0;

      // Try direct doc fetch first
      let memberRef = doc(db, 'admin', adminId, 'members', memberId);
      let memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        memberDocId = memberId;
        memberName = data.name || null;
        prevStreak = data.attendanceStreak || 0;
      } else {
        // Fallback: search for memberid field match
        const membersCol = collection(db, 'admin', adminId, 'members');
        let getDocs, query, where;
        try {
          ({ getDocs, query, where } = await import('firebase/firestore'));
        } catch (e) {
          Alert.alert('Error', 'Failed to import Firestore helpers.');
          setAttendanceLoading(false);
          return;
        }
        const q = query(membersCol, where('memberid', '==', memberId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          memberDocId = docSnap.id;
          const data = docSnap.data();
          memberName = data.name || null;
          prevStreak = data.attendanceStreak || 0;
        }
      }

      if (!memberDocId) {
        Alert.alert('Error', 'Member not found.');
        setAttendanceLoading(false);
        return;
      }

      // 1️⃣ Check if today's attendance is already marked
      const attendanceRef = doc(db, 'admin', adminId, 'members', memberDocId, 'attendance', dateStr);
      const todayAttendanceSnap = await getDoc(attendanceRef);
      if (todayAttendanceSnap.exists()) {
       const data = todayAttendanceSnap.data();

    // ✅ Check specifically if status is "present"
    if (data?.status === 'present') {
      Alert.alert(
        'Already Marked',
        'Attendance for today is already marked as present. Streak will not increase again.'
      );
      setAttendanceLoading(false);
      return;
    }
      }

      // 2️⃣ Check previous day's attendance for streak logic
      const prevAttendanceRef = doc(db, 'admin', adminId, 'members', memberDocId, 'attendance', prevDateStr);
      let prevAttendanceSnap = await getDoc(prevAttendanceRef);
      let newStreak = 1;
      if (prevAttendanceSnap.exists()) {
        const prevData = prevAttendanceSnap.data();
        if (prevData.status === 'absent') {
          newStreak = 1;
        } else {
          newStreak = prevStreak + 1;
        }
      } else {
        newStreak = 1;
      }

      // 3️⃣ Mark attendance for today
      await setDoc(attendanceRef, {
        status: 'present',
        date: dateStr,
        markedAt: today.toISOString(),
        adminId: adminId,
      });

      // 4️⃣ Update streak in member document
      await setDoc(
        doc(db, 'admin', adminId, 'members', memberDocId),
        { attendanceStreak: newStreak },
        { merge: true }
      );

      // 5️⃣ Store streak in admin/streakcount/{memberId}
      await setDoc(
        doc(db, 'admin', adminId, 'streakcount', memberDocId),
        { streak: newStreak, memberId: memberDocId, updatedAt: today.toISOString() },
        { merge: true }
      );

      Alert.alert('Attendance Marked', `Attendance marked for ${memberName || 'Member'}\nStreak: ${newStreak}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanning(false);
    if (onScan) onScan(data);
    if (data) {
      await markAttendanceByMemberId(data);
    } else {
      Alert.alert('QR Code Scanned', 'No data found', [
        { text: 'OK', onPress: () => setScanning(true) }
      ]);
    }
    setTimeout(() => setScanning(true), 1200); // allow re-scan after a short delay
  };

  if (!permission) {
    return <View style={styles.center}><Text style={styles.text}>Requesting camera permission...</Text></View>;
  }
  if (!permission.granted) {
    return <View style={styles.center}><Text style={styles.text}>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scan your QR Code</Text>
      <View style={styles.scanAreaContainer}>
        <View style={styles.scanFrame}>
          {scanning && (
            <>
              <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />
              {/* Lottie camera effect overlay */}
              <LottieView
                source= {cameraeffect}
                autoPlay
                loop
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            </>
          )}
          {/* Corner borders */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
      {/* Loader Modal for Attendance */}
      <Modal
        visible={attendanceLoading}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.mgreen} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#222' }}>Marking Attendance...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)', // translucent overlay
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
  },
  header: {
    color: colors.gwhite,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  scanAreaContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 32,
    flex: 1,
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(34,34,34,0.45)', // translucent dark
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  camera: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.gwhite,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanButton: {
    backgroundColor: colors.mgreen,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 12,
    width: width * 0.7,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: colors.lgray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: width * 0.7,
    alignItems: 'center',
    marginTop: 0,
  },
  uploadButtonText: {
    color: colors.gwhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dblack,
  },
  text: {
    color: colors.gwhite,
    fontSize: 16,
  },
});
