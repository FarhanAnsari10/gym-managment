  // Helper for formatted time and date
  const formatTime = (date) => {
    const d = new Date(date);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate();
  };
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '../../assets/colors';
import { useTheme } from '../../context/ThemeContext';
// ...existing code...
// (Move Modal JSX into the component, not in import block)
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebaseconfig';
import { uploadFileToCloudinary } from '../../services/imageService';

import { auth } from '../../config/firebaseconfig';

export default function MemberDetails() {
  const { isDarkMode } = useTheme();
  // // QR Modal state
  // const [showQRModal, setShowQRModal] = useState(false);
  // const [qrLoading, setQrLoading] = useState(false);
  const qrSvgRef = useRef(null);
  // const [qrUrl, setQrUrl] = useState(null);
  // const [qrError, setQrError] = useState(null);

  // // Fetch QR from Firestore
  // const fetchQrUrl = async () => {
  //   setQrLoading(true);
  //   setQrError(null);
  //   try {
  //     const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  //     const memberRef = doc(db, 'admin', adminId, 'members', memberId);
  //     const memberSnap = await getDoc(memberRef);
  //     if (memberSnap.exists()) {
  //       const data = memberSnap.data();
  //       if (data.qrCodeUrl) {
  //         setQrUrl(data.qrCodeUrl);
  //       } else {
  //         setQrUrl(null);
  //       }
  //     } else {
  //       setQrUrl(null);
  //     }
  //   } catch (e) {
  //     setQrError('Failed to fetch QR');
  //     setQrUrl(null);
  //   } finally {
  //     setQrLoading(false);
  //   }
  // };

  // // Generate QR and upload to Cloudinary, then save URL to Firestore
  // const generateAndSaveQr = async () => {
  //   setQrLoading(true);
  //   setQrError(null);
  //   try {
  //     // Use a simple API to generate QR PNG (for demo)
  //     const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(memberId)}`;
  //     // Upload to Cloudinary
  //     const uploadResult = await uploadFileToCloudinary({ uri: qrApiUrl }, 'member_qr');
  //     if (!uploadResult.success) {
  //       setQrError('Failed to upload QR');
  //       setQrLoading(false);
  //       return;
  //     }
  //     // Save URL to Firestore
  //     const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  //     const memberRef = doc(db, 'admin', adminId, 'members', memberId);
  //     await updateDoc(memberRef, { qrCodeUrl: uploadResult.url });
  //     setQrUrl(uploadResult.url);
  //   } catch (e) {
  //     setQrError('Failed to generate QR');
  //   } finally {
  //     setQrLoading(false);
  //   }
  // };

  // // When QR modal opens, fetch QR
  // useEffect(() => {
  //   if (showQRModal) fetchQrUrl();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [showQRModal]);




  // QR Modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrError, setQrError] = useState(null);

  // Fetch QR from Firestore
  const fetchQrUrl = async () => {
    setQrLoading(true);
    setQrError(null);
    try {
      const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        if (data.qrCodeUrl) {
          setQrUrl(typeof data.qrCodeUrl === 'string' ? data.qrCodeUrl : data.qrCodeUrl.data);
        } else {
          setQrUrl(null);
        }
      } else {
        setQrUrl(null);
      }
    } catch (e) {
      setQrError('Failed to fetch QR');
      setQrUrl(null);
    } finally {
      setQrLoading(false);
    }
  };

// Generate QR and upload to Cloudinary, then save URL to Firestore
const generateAndSaveQr = async () => {
  setQrLoading(true);
  setQrError(null);

  try {
    // Wait for QR SVG to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!qrSvgRef.current) {
      setQrError("QR ref not ready");
      setQrLoading(false);
      return;
    }

    // Get QR as base64 PNG
    const data = await new Promise((resolve, reject) => {
      try {
        qrSvgRef.current.toDataURL((base64) => resolve(base64));
      } catch (err) {
        reject(err);
      }
    });

    if (!data) {
      setQrError("Failed to generate QR");
      setQrLoading(false);
      return;
    }

    // Upload base64 string directly (same as your working code)
    const dataUrl = `data:image/png;base64,${data}`;
    const qrCodeUrl = await uploadFileToCloudinary(dataUrl, "member_qr");

    if (!qrCodeUrl) {
      setQrError("Failed to upload QR");
      setQrLoading(false);
      return;
    }

    // Save URL to Firestore
    const adminId = auth.currentUser?.uid || "ecNCqm8PgxOEgG9S7puVpm2hVZn2";
    const memberRef = doc(db, "admin", adminId, "members", memberId);

    await updateDoc(memberRef, { qrCodeUrl });
    setQrUrl(qrCodeUrl);

  } catch (e) {
    console.error("QR generation error:", e);
    setQrError("Failed to generate QR");
  } finally {
    setQrLoading(false);
  }
};

// When QR modal opens, fetch QR
useEffect(() => {
  if (showQRModal) fetchQrUrl();
}, [showQRModal]);


  const [imageActionModalVisible, setImageActionModalVisible] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [showLoaderModal, setShowLoaderModal] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [member, setMember] = useState(null);
  const [member2, setMember2] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState({});
  const [saving, setSaving] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isRenewalModalVisible, setIsRenewalModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [renewalPlan, setRenewalPlan] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingRenewal, setProcessingRenewal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [renewalPaymentAmount, setRenewalPaymentAmount] = useState('');
  const [showRenewalPaymentModal, setShowRenewalPaymentModal] = useState(false);
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] = useState(null);
  const[newplanprice, setNewPlanPrice] = useState(0);
  const[newtotaldues, setNewTotalDues] = useState(0);
  const[newpaidamount, setNewPaidAmount] = useState(null);
  // Attendance info for current week: [{date, status}]
  const [weekAttendance, setWeekAttendance] = useState([
    { day: 'Mon', status: 'none' },
    { day: 'Tue', status: 'none' },
    { day: 'Wed', status: 'none' },
    { day: 'Thu', status: 'none' },
    { day: 'Fri', status: 'none' },
    { day: 'Sat', status: 'none' },
    { day: 'Sun', status: 'none' },
  ]);
  const [totalStreak, setTotalStreak] = useState(0);
  // Fetch total streak from Firestore
  const fetchTotalStreak = async () => {
    try {
      const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberDocRef = doc(db, 'admin', adminId, 'members', memberId);
      const memberSnap = await getDoc(memberDocRef);
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        setTotalStreak(data.attendanceStreak || 0);
      } else {
        setTotalStreak(0);
      }
    } catch (error) {
      setTotalStreak(0);
    }
  };

  // Parse member data from params
  const memberData = params.memberData ? JSON.parse(params.memberData) : null;
  const memberId = params.memberId;

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      
      // Get member details
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      const memberSnap = await getDoc(memberRef);
      const memberRef2 = doc(db, 'admin', adminId, 'members', memberId,'plandetails', 'current');
      const memberSnap2 = await getDoc(memberRef2);
      
      if (memberSnap.exists()) {
        const m = { id: memberSnap.id, ...memberSnap.data() };
        const m2 = { id: memberSnap2.id, ...memberSnap2.data() };
        // Check expiry and update status if needed
        if (m.planExpireDate && new Date(m.planExpireDate) < new Date()) {
          // Plan expired, update status if not already
          if (m.activemember !== false || m.expiredmember !== true) {
            await updateDoc(memberRef, {
              activemember: false,
              expiredmember: true,
            });
            m.activemember = false;
            m.expiredmember = true;
          }
        }
        setMember(m);
        setMember2(m2);
      } else {
        setMember(memberData); // Fallback to passed data
        setMember2(memberData); // Fallback to passed data
      }

      // Get member transactions
      const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
      const transactionsQuery = query(transactionsRef, orderBy('paymentDate', 'desc'));
      const transactionsSnap = await getDocs(transactionsQuery);
      
      const transactionsData = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching member details:', error);
      Alert.alert('Error', 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const plansRef = collection(db, 'admin', adminId, 'plans');
      const plansSnap = await getDocs(plansRef);
      
      const plansData = plansSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMemberDetails();
    setRefreshing(false);
  };

  const openEditModal = () => {
    setEditingMember({
      name: member.name || '',
      mobile: member.mobile || '',
      trainingType: member.trainingType || '',
      address: member.address || '',
      gender: member.gender || '',
      batchName: member.batchName || '',
      batchTime: member.batchTime || '',
    });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingMember({});
  };

  const saveMemberChanges = async () => {
    try {
  setSaving(true);
  const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  const memberRef = doc(db, 'admin', adminId, 'members', memberId);

      // Prepare update data (only allowed fields)
      const updateData = {
        name: editingMember.name.trim(),
        mobile: editingMember.mobile.trim(),
        trainingType: editingMember.trainingType.trim(),
        address: editingMember.address.trim(),
        gender: editingMember.gender.trim(),
        batchName: editingMember.batchName.trim(),
        batchTime: editingMember.batchTime.trim(),
        updatedAt: new Date()
      };

      // Validate required fields
      if (!updateData.name) {
        Alert.alert('Error', 'Name is required');
        return;
      }

      await updateDoc(memberRef, updateData);

      // Update local state
      setMember(prev => ({ ...prev, ...updateData }));

      Alert.alert('Success', 'Member details updated successfully');
      closeEditModal();
    } catch (error) {
      console.error('Error updating member:', error);
      Alert.alert('Error', 'Failed to update member details');
    } finally {
      setSaving(false);
    }
  };

  // Payment Functions
  const openPaymentModal = () => {
    setPaymentAmount(member.dues?.toString() || '0');
    setIsPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalVisible(false);
    setPaymentAmount('');
  };

  // const processPayment = async () => {
  //   try {
  //     setProcessingPayment(true);
  // const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
  //     const memberRef = doc(db, 'admin', adminId, 'members', memberId);
  //     // Import the transaction ID generator
  //     const { generateTransactionId } = await import('../../container/transactionidgenerator');
  //     const amount = parseFloat(paymentAmount);
  //     const dues = parseFloat(member.dues) || 0;
  //     if (!amount || amount <= 0) {
  //       Alert.alert('Error', 'Please enter a valid payment amount');
  //       return;
  //     }
  //     if (amount > dues) {
  //       Alert.alert('Error', `Amount paid (₹${amount}) cannot exceed current dues (₹${dues}).`);
  //       return;
  //     }
  //     // Prepare plan details
  //     const planDetail = member2?.planname || member?.planType || '';
  //     const planDuration = member2?.planDuration || member?.planDuration || '';
  //     const planExpireDate = member2?.planExpireDate || member?.planExpireDate || '';
  //     // Generate receiptId
  //     const receiptId = generateTransactionId();
  //     // Calculate new dues
  //     const newDues = Math.max(0, (member.dues || 0) - amount);
  //     // Create transaction record with all required fields
  //     const transactionData = {
  //       amountPaid: amount,
  //       dues: newDues,
  //       memberName: member.name || '',
  //       paymentMethod: 'Cash',
  //       planDetail,
  //       planDuration,
  //       planExpireDate,
  //       receiptId,
  //       paymentDate: new Date().toISOString(),
  //       status: 'completed',
  //       adminId: adminId,
  //     };
  //     // Add transaction to member's transactions collection
  //     const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
  //     await addDoc(transactionsRef, transactionData);

  //     // Update member's dues
  //     await updateDoc(memberRef, {
  //       dues: newDues,
  //       lastPaymentDate: new Date(),
  //       updatedAt: new Date()
  //     });

  //     // Update amountPaid in plandetails/current
  //     const planDetailsRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
  //     // Fetch current plan details
  //     let currentPlanDetails = {};
  //     try {
  //       const planDetailsSnap = await getDoc(planDetailsRef);
  //       if (planDetailsSnap.exists()) {
  //         currentPlanDetails = planDetailsSnap.data();
  //       }
  //     } catch (e) {
  //       // ignore if not found
  //     }
  //     const prevAmountPaid = parseFloat(currentPlanDetails.amountPaid) || 0;
  //     const updatedAmountPaid = prevAmountPaid + amount;
  //     const prevDues = parseFloat(currentPlanDetails.dues) || 0;
  //     const updatedPlanDues = Math.max(0, prevDues - amount);
  //     await updateDoc(planDetailsRef, {
  //       amountPaid: updatedAmountPaid,
  //       dues: updatedPlanDues
  //     });

  //     // --- Update admin/financialsummary for month/year ---
  //     // Get planPurchaseDate from plandetails
  //     let planPurchaseDate = currentPlanDetails.planPurchaseDate;
  //     let purchaseDateObj = planPurchaseDate ? new Date(planPurchaseDate) : new Date();
  //     const year = purchaseDateObj.getFullYear();
  //     const month = (purchaseDateObj.getMonth() + 1).toString().padStart(2, '0');
  //     // Path: financialSummary/{year} (fields: monthly.{month}.income, monthly.{month}.dues, yearlyTotalTotal.income, yearlyTotalTotal.dues)
  //     const financialSummaryRef = doc(db,'admin',adminId, 'financialSummary', String(year));
  //     // Fetch current summary
  //     let summarySnap = await getDoc(financialSummaryRef);
  //     let monthly = (summarySnap.exists() && summarySnap.data().monthly) || {};
  //     let yearlyTotalTotal = (summarySnap.exists() && summarySnap.data().yearlyTotalTotal) || { income: 0, dues: 0 };
  //     // Prepare current month values
  //     const prevMonth = monthly[month] || { income: 0, dues: 0 };
  //     const newMonthIncome = (parseFloat(prevMonth.income) || 0) + amount;
  //     const newMonthDues = (parseFloat(prevMonth.dues) || 0) - amount;
  //     // Prepare yearlyTotal values
  //     const newyearlyTotalIncome = (parseFloat(yearlyTotalTotal.income) || 0) + amount;
  //     const newyearlyTotalDues = (parseFloat(yearlyTotalTotal.dues) || 0) - amount;
  //     // Build update object using dot notation for nested fields
  //     // Update the monthly map correctly
  //     const updatedMonthly = { ...monthly };
  //     updatedMonthly[month] = {
  //       income: newMonthIncome,
  //       dues: Math.max(0, newMonthDues),
  //     };
  //     const updateObj = {
  //       monthly: updatedMonthly,
  //       yearlyTotal: {
  //         income: newyearlyTotalIncome,
  //         dues: Math.max(0, newyearlyTotalDues),
  //       },
  //     };
  //     await setDoc(financialSummaryRef, updateObj, { merge: true });

  //     // Update local state
  //     setMember(prev => ({ ...prev, dues: newDues }));
  //     setMember2(prev => ({ ...prev, amountPaid: updatedAmountPaid, dues: updatedPlanDues }));
  //     setTransactions(prev => [transactionData, ...prev]);
  //     Alert.alert('Success', `Payment of ₹${amount} recorded successfully`);
  //     closePaymentModal();
  //   } catch (error) {
  //     console.error('Error processing payment:', error);
  //     Alert.alert('Error', 'Failed to process payment');
  //   } finally {
  //     setProcessingPayment(false);
  //   }
  // };




// const processPlanRenewal = async (adminId, memberId, paymentAmount) => {
//   try {
//     const paidAmount = parseFloat(paymentAmount);
//     if (!paidAmount || paidAmount <= 0) {
//       Alert.alert('Error', 'Please enter a valid payment amount');
//       return;
//     }

//     // --- 1️⃣ Fetch current plan details ---
//     const planDetailsRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
//     let currentPlanDetails = {};
//     try {
//       const planSnap = await getDoc(planDetailsRef);
//       if (planSnap.exists()) currentPlanDetails = planSnap.data();
//     } catch (error) {
//       console.error("Error fetching plan details:", error);
//       return;
//     }

//     const prevDues = parseFloat(currentPlanDetails.dues) || 0;
//     const planPrice = newplanprice|| 0;
//     const planPurchaseDate = currentPlanDetails.planPurchaseDate
//       ? new Date(currentPlanDetails.planPurchaseDate)
//       : new Date();

//     // --- 2️⃣ Determine year and month for financial summary ---
//     const today1 = new Date();
//     const year = planPurchaseDate.getFullYear();
//     const month1 = (planPurchaseDate.getMonth() + 1).toString().padStart(2, '0');
//     const month = (today1.getMonth() + 1).toString().padStart(2, '0');

//     const financialSummaryRef = doc(db, 'admin', adminId, 'financialSummary', String(year));
//     const summarySnap = await getDoc(financialSummaryRef);
//     const monthly = (summarySnap.exists() && summarySnap.data().monthly) || {};
//     const yearlyTotal = (summarySnap.exists() && summarySnap.data().yearlyTotal) || { income: 0, dues: 0 };

//     const prevMonth = monthly[month] || { income: 0, dues: 0 };
//     const prevMonth1 = monthly[month1] || { income: 0, dues: 0 };

//     // --- 3️⃣ Calculate new monthly and yearlyTotal values ---
//     let newMonthIncome, newMonthDues, newyearlyTotalIncome, newyearlyTotalDues, purchasemonthincome, purchasemonthdues;
//     purchasemonthincome = parseFloat(prevMonth1.income) || 0;

//     if(month1 === month){
//       // If renewal month is same as current month, just add to current month
    
     
//       newMonthIncome = (parseFloat(prevMonth.income) || 0) + paidAmount;
//       newMonthDues = (parseFloat(prevMonth.dues) || 0) + prevDues + planPrice - paidAmount;

//       newyearlyTotalIncome = (parseFloat(yearlyTotal.income) || 0) + paidAmount;
//       newyearlyTotalDues = (parseFloat(yearlyTotal.dues) || 0) + planPrice - paidAmount;

    
//     }
//     else{
//     if (prevDues < paidAmount) {
//       // Case 1: Previous dues smaller than paid amount
//       purchasemonthdues = parseFloat(prevMonth1.dues) - prevDues || 0;
//       newMonthIncome = (parseFloat(prevMonth.income) || 0) + paidAmount;
//       newMonthDues = (parseFloat(prevMonth.dues) || 0) +  planPrice - paidAmount;

//       newyearlyTotalIncome = (parseFloat(yearlyTotal.income) || 0) + paidAmount;
//       newyearlyTotalDues = (parseFloat(yearlyTotal.dues) || 0) + planPrice + prevDues- paidAmount;
//     } else {
//       // Case 2: Previous dues >= paid amount
//       purchasemonthdues = parseFloat(prevMonth1.dues) - paidAmount || 0;
//       newMonthIncome = (parseFloat(prevMonth.income) || 0) + paidAmount ;
//       newMonthDues = (parseFloat(prevMonth.dues) || 0) + planPrice;

//       newyearlyTotalIncome = (parseFloat(yearlyTotal.income) || 0) + paidAmount;
//       newyearlyTotalDues = (parseFloat(yearlyTotal.dues) || 0) + planPrice - paidAmount;
//     }}

//     // --- 4️⃣ Update monthly & yearlyTotal maps ---
//     const updatedMonthly = { ...monthly, [month1]: { income: purchasemonthincome, dues: Math.max(0, purchasemonthdues) },[month]: { income: newMonthIncome, dues: Math.max(0, newMonthDues) } };
//     const updateObj = {
//       monthly: updatedMonthly,
//       yearlyTotal: { income: newyearlyTotalIncome, dues: Math.max(0, newyearlyTotalDues) },
//     };

//     await setDoc(financialSummaryRef, updateObj, { merge: true });

//     console.log('✅ Plan renewal financial summary updated successfully');

//     // --- 5️⃣ Optionally, update member's current plan dues to 0 after renewal ---
//     // await updateDoc(planDetailsRef, {
//     //   dues: 0,
//     //   lastRenewalDate: new Date(),
//     //   updatedAt: new Date(),
//     // }
//   // );

//     Alert.alert('Success', `Plan renewed successfully. Payment of ₹${paidAmount} recorded.`);
//   } catch (error) {
//     console.error('Error processing plan renewal:', error);
//     Alert.alert('Error', 'Failed to process plan renewal');
//   }
// };


const processPayment = async () => {
  try {
    setProcessingPayment(true);

    const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
    const memberRef = doc(db, 'admin', adminId, 'members', memberId);

    // Import the transaction ID generator
    const { generateTransactionId } = await import('../../container/transactionidgenerator');

    const amount = parseFloat(paymentAmount);
    const dues = parseFloat(member?.dues) || 0;

    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }
    if (amount > dues) {
      Alert.alert('Error', `Amount paid (₹${amount}) cannot exceed current dues (₹${dues}).`);
      return;
    }

    // Prepare plan details safely
    const planDetail = member2?.planname || member?.planType || '';
    const planDuration = member2?.planDuration || member?.planDuration || '';
    const planExpireDate = member2?.planExpireDate
      ? new Date(member2.planExpireDate)
      : member?.planExpireDate
      ? new Date(member.planExpireDate)
      : null;

    const receiptId = generateTransactionId();

    // Calculate new dues
    const newDues = Math.max(0, dues - amount);

    // Transaction record
    const transactionData = {
      amountPaid: amount,
      dues: newDues,
      memberName: member?.name || '',
      paymentMethod: 'Cash',
      planDetail,
      planDuration,
      planExpireDate,
      receiptId,
      paymentDate: new Date().toISOString(),
      status: 'completed',
      adminId,
    };

    // Add transaction
    const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
    await addDoc(transactionsRef, transactionData);

    // Update member dues
    await updateDoc(memberRef, {
      dues: newDues,
      lastPaymentDate: new Date(),
      updatedAt: new Date(),
    });

    // Update plandetails/current
    const planDetailsRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
    let currentPlanDetails = {};
    try {
      const planDetailsSnap = await getDoc(planDetailsRef);
      if (planDetailsSnap.exists()) {
        currentPlanDetails = planDetailsSnap.data();
      }
    } catch (e) {}

    const prevAmountPaid = parseFloat(currentPlanDetails.amountPaid) || 0;
    const updatedAmountPaid = prevAmountPaid + amount;
    const prevPlanDues = parseFloat(currentPlanDetails.dues) || 0;
    const updatedPlanDues = Math.max(0, prevPlanDues - amount);

    await updateDoc(planDetailsRef, {
      amountPaid: updatedAmountPaid,
      dues: updatedPlanDues,
    });

    // --- Update financial summary per month ---
    // Determine month from planPurchaseDate or current date
    const planPurchaseDate = currentPlanDetails.planPurchaseDate
      ? new Date(currentPlanDetails.planPurchaseDate)
      : new Date();
    const year = planPurchaseDate.getFullYear();
    const month = (planPurchaseDate.getMonth() + 1).toString().padStart(2, '0');

    const financialSummaryRef = doc(db, 'admin', adminId, 'financialSummary', String(year));
    let summarySnap = await getDoc(financialSummaryRef);
    let monthly = (summarySnap.exists() && summarySnap.data().monthly) || {};
    let yearlyTotal = (summarySnap.exists() && summarySnap.data().yearlyTotal) || { income: 0, dues: 0 };

    // Update month dues and income
    const prevMonth = monthly[month] || { income: 0, dues: 0 };
    const updatedMonthIncome = (parseFloat(prevMonth.income) || 0) + amount;
    const updatedMonthDues = Math.max(0, (parseFloat(prevMonth.dues) || 0) - amount);

    // Update yearly totals
    const updatedYearlyIncome = (parseFloat(yearlyTotal.income) || 0) + amount;
    const updatedYearlyDues = Math.max(0, (parseFloat(yearlyTotal.dues) || 0) - amount);

    monthly[month] = {
      income: updatedMonthIncome,
      dues: updatedMonthDues,
    };

    await setDoc(
      financialSummaryRef,
      {
        monthly,
        yearlyTotal: {
          income: updatedYearlyIncome,
          dues: updatedYearlyDues,
        },
      },
      { merge: true }
    );

    // Update local state
    setMember(prev => ({ ...prev, dues: newDues }));
    setMember2(prev => ({ ...prev, amountPaid: updatedAmountPaid, dues: updatedPlanDues }));
    setTransactions(prev => [transactionData, ...prev]);

    Alert.alert('Success', `Payment of ₹${amount} recorded successfully`);
    closePaymentModal();
  } catch (error) {
    console.error('Error processing payment:', error);
    Alert.alert('Error', 'Failed to process payment');
  } finally {
    setProcessingPayment(false);
  }
};




// Accept all required values as a single object for clarity and future-proofing
const processPlanRenewal = async ({
  adminId,
  memberId,
  renewalPaymentAmount,
  selectedPlanForRenewal,
  member2,
  // Add more fields here if needed in future
}) => {
  try {
    const paidAmount = parseFloat(renewalPaymentAmount);
    const planPrice2 = parseFloat(selectedPlanForRenewal?.price) || 0;
    console.log('Plan Price:', planPrice2);
    console.log('Plan Price:', paidAmount);
    if (!paidAmount || paidAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    // --- 1️⃣ Fetch current plan details ---
    const planDetailsRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
    let currentPlanDetails = {};
    try {
      const planSnap = await getDoc(planDetailsRef);
      if (planSnap.exists()) currentPlanDetails = planSnap.data();
    } catch (error) {
      console.error("Error fetching plan details:", error);
      return;
    }

    const prevDues = parseFloat(currentPlanDetails.dues) || 0;
    const planPrice = parseFloat(selectedPlanForRenewal?.price) || 0;
    const planPurchaseDate = currentPlanDetails.planPurchaseDate
      ? new Date(currentPlanDetails.planPurchaseDate)
      : new Date();

    // --- 2️⃣ Determine year and month for financial summary ---
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    // const prevMonthIndex = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    // const prevMonth = (prevMonthIndex + 1).toString().padStart(2, '0');
    // Convert string to Date object
const dateObj = new Date(planPurchaseDate);

// Get current month (0-11)
// const prevMonth = dateObj.getMonth();
    const prevMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    console.log('Previous Month:', prevMonth);


    const financialSummaryRef = doc(db, 'admin', adminId, 'financialSummary', String(year));
    const summarySnap = await getDoc(financialSummaryRef);
    const monthly = (summarySnap.exists() && summarySnap.data().monthly) || {};
    const yearlyTotal = (summarySnap.exists() && summarySnap.data().yearlyTotal) || { income: 0, dues: 0 };

    // --- 3️⃣ Carry forward previous month dues ---
    let carryForwardDues = 0;
    if (monthly[prevMonth]) {
      console.log('Previous Month Dues:', monthly[prevMonth].dues);
      carryForwardDues = parseFloat(monthly[prevMonth].dues) || 0;
    }
    const totalDuesBeforePayment = prevDues + planPrice;
    const remainingDues = Math.max(0, totalDuesBeforePayment - paidAmount);

    // --- 4️⃣ Update monthly & yearlyTotal values ---
    const prevMonthData = monthly[prevMonth] || { income: 0, dues: 0 };
    const currentMonthData = monthly[month] || { income: 0, dues: 0 };

    // Clear previous dues when carried forward
    const updatedPrevMonth = {
      ...prevMonthData,
      dues: (parseFloat(prevMonthData.dues) - prevDues|| 0) ,
    };
    let updatedCurrentMonth = {};
if(prevMonth === month){
   updatedCurrentMonth = {
      income: (parseFloat(currentMonthData.income) || 0) + paidAmount,
      dues:  (parseFloat(currentMonthData.dues) || 0) + remainingDues - prevDues ,
    };
} else{
     updatedCurrentMonth = {
      income: (parseFloat(currentMonthData.income) || 0) + paidAmount,
      dues:  (parseFloat(currentMonthData.dues) || 0) + remainingDues ,
    };
  }

    const updatedMonthly = {
      ...monthly,
      [prevMonth]: updatedPrevMonth,
      [month]: updatedCurrentMonth,
    };

    const updatedYearlyTotal = {
      income: (parseFloat(yearlyTotal.income) || 0) + paidAmount,
      dues: (parseFloat(yearlyTotal.dues) || 0) + remainingDues - prevDues,
    };

    await setDoc(financialSummaryRef, {
      monthly: updatedMonthly,
      yearlyTotal: updatedYearlyTotal,
    }, { merge: true });

    console.log('✅ Plan renewal financial summary updated successfully');

    // --- 5️⃣ Update member plan expiry logic ---
    const prevExpireDate = member2?.planExpireDate
      ? member2.planExpireDate.toDate
        ? member2.planExpireDate.toDate() // Firestore Timestamp
        : new Date(member2.planExpireDate) // ISO string
      : null;

    let baseDate;
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    if (prevExpireDate && prevExpireDate > todayMid) {
      baseDate = prevExpireDate;
    } else {
      baseDate = todayMid;
    }

    function addMonths(date, months) {
      const d = new Date(date);
      const targetMonth = d.getMonth() + months;
      const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
      const month = targetMonth % 12;
      const day = d.getDate();
      const newDate = new Date(targetYear, month, day);
      if (newDate.getMonth() !== month) {
        newDate.setDate(0);
      }
      return newDate;
    }

    const duration = Number(selectedPlanForRenewal?.duration || 0);
    let newExpireDate = addMonths(baseDate, duration);
    newExpireDate.setDate(newExpireDate.getDate() - 1);
    const expiryISO = newExpireDate.toISOString();
    const nowISO = new Date().toISOString();

    // --- 6️⃣ Create transaction record ---
    const transactionData = {
      amountPaid: paidAmount,
      dues: remainingDues,
      memberName: member2?.name || '',
      paymentDate: nowISO,
      paymentMethod: 'Cash',
      planDetail: selectedPlanForRenewal?.name,
      planDuration: selectedPlanForRenewal?.duration,
      planExpireDate: expiryISO,
      receiptId: `TXN${Date.now()}`,
      status: 'completed',
      type: 'renewal',
      adminId: adminId,
    };

    const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
    await addDoc(transactionsRef, transactionData);

    // --- 7️⃣ Update member doc ---
    const memberRef = doc(db, 'admin', adminId, 'members', memberId);
    await updateDoc(memberRef, {
      planExpireDate: expiryISO,
      planType: selectedPlanForRenewal?.name,
      planId: selectedPlanForRenewal?.id,
      status: 'active',
      lastRenewalDate: nowISO,
      dues: remainingDues,
      updatedAt: nowISO,
      newmember: false,
      activemember: true,
      expiredmember: false,
    });

    await setDoc(planDetailsRef, {
      amountPaid: paidAmount,
      paymentDate: nowISO,
      paymentMethod: 'Cash',
      planDuration: selectedPlanForRenewal?.duration,
      planPurchaseDate: nowISO,
      planStartDate: nowISO,
      planname: selectedPlanForRenewal?.name,
      dues: remainingDues,
      planExpireDate: expiryISO,
    }, { merge: true });

    Alert.alert(
      'Success',
      `Plan renewed successfully until ${newExpireDate.toLocaleDateString()}\nPayment: ₹${paidAmount}\nRemaining Dues: ₹${remainingDues}`
    );
    setShowRenewalPaymentModal(false);
    setIsRenewalModalVisible(false);
  } catch (error) {
    console.error('Error processing plan renewal:', error);
    Alert.alert('Error', 'Failed to process plan renewal');
  }
};





  // Renewal Functions
  const openRenewalModal = () => {
    setIsRenewalModalVisible(true);
  };

  const closeRenewalModal = () => {
    setIsRenewalModalVisible(false);
    setRenewalPlan('');
  };

  const processRenewal = async () => {
    try {
      setProcessingRenewal(true);
  const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      
      if (!renewalPlan) {
        Alert.alert('Error', 'Please select a renewal plan');
        return;
      }

      // Find the selected plan
      const selectedPlan = plans.find(plan => plan.id === renewalPlan);
      if (!selectedPlan) {
        Alert.alert('Error', 'Selected plan not found');
        return;
      }

      // Set selected plan and show payment modal
      setSelectedPlanForRenewal(selectedPlan);
      setRenewalPaymentAmount(selectedPlan.price.toString());
      setShowRenewalPaymentModal(true);
      setProcessingRenewal(false);
    } catch (error) {
      console.error('Error processing renewal:', error);
      Alert.alert('Error', 'Failed to process renewal');
      setProcessingRenewal(false);
    }
  };

//   const processRenewalPayment = async () => {
//     try {
//       setProcessingRenewal(true);
//   const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
//       const memberRef = doc(db, 'admin', adminId, 'members', memberId);

//       const paymentAmount = parseFloat(renewalPaymentAmount);
//       if (!paymentAmount || paymentAmount <= 0) {
//         Alert.alert('Error', 'Please enter a valid payment amount');
//         return;
//       }

//       // Calculate total due (previous dues + plan price)
//       const previousDues = parseFloat(member2.dues) || 0;
//       const planPrice = parseFloat(selectedPlanForRenewal.price) || 0;
//       const totalDue = previousDues + planPrice;
//       setNewPlanPrice(planPrice);

//       // If paid more than total due, alert and prevent
//       if (paymentAmount > totalDue) {
//         Alert.alert('Error', `Amount paid (₹${paymentAmount}) cannot exceed total due (₹${totalDue}).`);
//         setProcessingRenewal(false);
//         return;
//       }

//       // Calculate new dues
//       const newDues = totalDue - paymentAmount;

//       // Calculate new expiry date based on plan duration
//       const currentDate = new Date().toISOString();
// // Helper: safely convert Firestore/ISO to Date
// // 1️⃣ Convert Firestore Timestamp (or ISO string) to JS Date
// const prevExpireDate = member2?.planExpireDate
//   ? member2.planExpireDate.toDate
//     ? member2.planExpireDate.toDate() // Firestore Timestamp
//     : new Date(member2.planExpireDate) // already ISO string
//   : null;

// const today = new Date();
// today.setHours(0, 0, 0, 0); // normalize

// // 2️⃣ Decide base date
// let baseDate;
// if (prevExpireDate && prevExpireDate > today) {
//   baseDate = prevExpireDate; // extend from previous expiry
// } else {
//   baseDate = today; // expired → start from today
// }

// // 3️⃣ Add months safely
// function addMonths(date, months) {
//   const d = new Date(date);
//   const targetMonth = d.getMonth() + months;
//   const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
//   const month = targetMonth % 12;

//   const day = d.getDate();
//   const newDate = new Date(targetYear, month, day);

//   // Fix month rollover (e.g., Jan 31 → Feb 28)
//   if (newDate.getMonth() !== month) {
//     newDate.setDate(0);
//   }

//   return newDate;
// }

// const duration = Number(selectedPlanForRenewal?.duration || 0);
// let newExpireDate = addMonths(baseDate, duration);

// // Inclusive: subtract 1 day
// newExpireDate.setDate(newExpireDate.getDate() - 1);

// // 4️⃣ Convert to ISO string for Firestore storage
// const expiryISO = newExpireDate.toISOString();

// console.log("✅ New expiry ISO:", expiryISO); 
// // Example output: "2025-10-17T00:00:00.000Z"




// const nowISO = new Date().toISOString();
// // const expiryISO = prevExpireDate; // Use UTC ISO for Firestore
//       // Create transaction record for renewal payment with all required fields
//       const transactionData = {
//         amountPaid: paymentAmount,
//         dues: newDues,
//         memberName: member.name || '',
//         paymentDate: nowISO,
//         paymentMethod: 'Cash',
//         planDetail: selectedPlanForRenewal.name,
//         planDuration: selectedPlanForRenewal.duration,
//         planExpireDate: expiryISO,
//         receiptId: generateTransactionId(),
//         status: 'completed',
//         type: 'renewal',
//         adminId: adminId,
//       };

//       // Add transaction to member's transactions collection
//       const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
//       await addDoc(transactionsRef, transactionData);

//       // Update member's plan details, dues, and status booleans
//       await updateDoc(memberRef, {
//         planExpireDate: expiryISO,
//         planType: selectedPlanForRenewal.name,
//         planId: selectedPlanForRenewal.id,
//         status: 'active',
//         lastRenewalDate: nowISO,
//         dues: newDues,
//         updatedAt: nowISO,
//         newmember: false,
//         activemember: true,
//         expiredmember: false,
//       });

//       // --- Update plandetails/current with all required fields, all dates as ISO string ---
//       const planDetailsRef = doc(db, 'admin', adminId, 'members', memberId, 'plandetails', 'current');
//       await setDoc(planDetailsRef, {
//         amountPaid: paymentAmount,
//         paymentDate: nowISO,
//         paymentMethod: 'Cash',
//         planDuration: selectedPlanForRenewal.duration,
//         planPurchaseDate: nowISO,
//         planStartDate: nowISO,
//         planname: selectedPlanForRenewal.name,
//         dues: newDues,
//         planExpireDate: expiryISO,
//       }, { merge: true });
//         processPlanRenewal(adminId, memberId, paymentAmount,selectedPlanForRenewal, member2);
//       // Update local state
//       setMember(prev => ({ 
//         ...prev, 
       
//         status: 'active',
       
//         newmember: false,
//         activemember: true,
//         expiredmember: false,
//       }));

//       // Update member2 (plandetails) state
//       setMember2(prev => ({
//         ...prev,
//         amountPaid: paymentAmount,
//         paymentDate: nowISO,
//         paymentMethod: 'Cash',
//         planDuration: selectedPlanForRenewal.duration,
//         planPurchaseDate: nowISO,
//         planStartDate: nowISO,
//         planname: selectedPlanForRenewal.name,
//         dues: newDues,
//         planExpireDate: expiryISO,
//       }));

//       // Update transactions list
//       setTransactions(prev => [transactionData, ...prev]);

//       const duesMessage = `Dues after renewal: ₹${newDues}`;

//       Alert.alert('Success', `Plan renewed successfully until ${newExpireDate.toLocaleDateString()}\nPayment: ₹${paymentAmount}\n${duesMessage}`);
//       setShowRenewalPaymentModal(false);
//       closeRenewalModal();
//     } catch (error) {
//       console.error('Error processing renewal payment:', error);
//       Alert.alert('Error', 'Failed to process renewal payment');
//     } finally {
//       setProcessingRenewal(false);
//     }
//   };

  const closeRenewalPaymentModal = () => {
    setShowRenewalPaymentModal(false);
    setRenewalPaymentAmount('');
    setSelectedPlanForRenewal(null);
  };

  // Function to mark attendance for today
  const markAttendance = async () => {
    Alert.alert(
      'Mark Attendance',
      'Are you sure you want to mark attendance for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark',
          style: 'default',
          onPress: async () => {
            setAttendanceLoading(true);
            try {
              const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;
              if (!memberId) {
                Alert.alert('Error', 'Member ID not found.');
                setAttendanceLoading(false);
                return;
              }

              // --- Mark absent for missing days ---
              // Get all attendance docs for this member
              const attendanceColRef = collection(db, 'admin', adminId, 'members', memberId, 'attendance');
              const attendanceSnap = await getDocs(attendanceColRef);
              let attendedDates = new Set();
              attendanceSnap.forEach(docSnap => {
                attendedDates.add(docSnap.id); // doc id is dateStr
              });
              // Find last attendance date (present or absent)
              let lastDate = null;
              if (attendedDates.size > 0) {
                // Get max date
                lastDate = Array.from(attendedDates).sort().pop();
              }
              // If lastDate is not today, fill in missing days as absent
              if (lastDate && lastDate < dateStr) {
                let d = new Date(lastDate);
                d.setDate(d.getDate() + 1);
                while (d <= today) {
                  const fillDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  if (!attendedDates.has(fillDateStr) && fillDateStr !== dateStr) {
                    const absentRef = doc(db, 'admin', adminId, 'members', memberId, 'attendance', fillDateStr);
                    await setDoc(absentRef, {
                      status: 'absent',
                      date: fillDateStr,
                      markedAt: new Date().toISOString(),
                      adminId: adminId,
                    });
                  }
                  d.setDate(d.getDate() + 1);
                }
              }

              // Save attendance for today (present)
              const attendanceRef = doc(db, 'admin', adminId, 'members', memberId, 'attendance', dateStr);
              await setDoc(attendanceRef, {
                status: 'present',
                date: dateStr,
                markedAt: today.toISOString(),
                adminId: adminId,
              });

              // --- Streak logic ---
              const prevDate = new Date(today);
              prevDate.setDate(prevDate.getDate() - 1);
              const prevDateStr = prevDate.toISOString().split('T')[0];
              const prevAttendanceRef = doc(db, 'admin', adminId, 'members', memberId, 'attendance', prevDateStr);
              const prevAttendanceSnap = await getDoc(prevAttendanceRef);
              let newStreak = 1;
              if (prevAttendanceSnap.exists()) {
                const prevData = prevAttendanceSnap.data();
                if (prevData.status === 'present') {
                  const memberDocRef = doc(db, 'admin', adminId, 'members', memberId);
                  const memberDocSnap = await getDoc(memberDocRef);
                  const prevStreak = memberDocSnap.exists() ? memberDocSnap.data().attendanceStreak || 0 : 0;
                  newStreak = prevStreak + 1;
                }
              }
              await setDoc(
                doc(db, 'admin', adminId, 'members', memberId),
                { attendanceStreak: newStreak },
                { merge: true }
              );

              Alert.alert('Attendance Marked', `Attendance marked \nStreak: ${newStreak}`);
              fetchWeekAttendance();
            } catch (error) {
              console.error('Error marking attendance:', error);
              Alert.alert('Error', 'Failed to mark attendance');
            } finally {
              setAttendanceLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchMemberDetails();
    fetchPlans();
    fetchWeekAttendance();
    fetchTotalStreak();
  }, [memberId]);

  // Fetch attendance for current week (Mon-Sun)
  const fetchWeekAttendance = async () => {
    try {
  const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const today = new Date();
      // Find Monday of current week
      const monday = new Date(today);
      const dayOfWeek = today.getDay();
      // JS: 0=Sun, 1=Mon, ..., 6=Sat
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setDate(today.getDate() + diffToMonday);
      // Build array of dates for Mon-Sun
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDates.push({
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          jsDate: d,
        });
      }
      // Fetch attendance docs for these dates
      const attendanceColRef = collection(db, 'admin', adminId, 'members', memberId, 'attendance');
      const attendanceSnap = await getDocs(attendanceColRef);
      const attendanceMap = {};
      attendanceSnap.forEach(docSnap => {
        attendanceMap[docSnap.id] = (docSnap.data().status || '').toLowerCase();
      });
      // Build weekAttendance array, set Sunday as 'holiday' if not present
      const weekArr = weekDates.map((d, idx) => {
        let status = attendanceMap[d.date] || 'none';
        // If Sunday (idx === 6), set as 'holiday' if not present or not already marked
        if (idx === 6 && (status === 'none' || status === 'absent')) {
          status = 'holiday';
        }
        return {
          day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx],
          status,
        };
      });
      setWeekAttendance(weekArr);
    } catch (error) {
      console.error('Error fetching week attendance:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading member details...</Text>
        </View>
      </SafeAreaView>
    );
  }
            {/* Hidden QR SVG for PNG generation */}

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Member not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }







  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? colors.dblack : '#ededed' }}>
      {/* Header */}
  <View style={{ backgroundColor: isDarkMode ? colors.dblack : '#222', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
  <Text style={{ color: isDarkMode ? colors.gwhite : '#eee', fontSize: 20, fontWeight: 'bold' }}>Member Detail</Text>
        {/* <Ionicons name="notifications-outline" size={26} color="#fff" /> */}
        {/* <View></View> */}
      </View>

  <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: isDarkMode ? colors.dblack : '#ededed' }}>
        {/* Profile Card */}
  <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 18, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, position: 'relative' }}>
          {/* Edit Icon at top right */}
          <View style={{ position: 'absolute', top: 10, right: 16, zIndex: 2 }}>
            <TouchableOpacity onPress={openEditModal} style={{ padding: 2 }}>
              <Ionicons name="pencil" size={18} color={isDarkMode ? colors.gwhite : '#222'} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', minHeight: 120 }}>
            <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: isDarkMode ? colors.lgray : '#e0e0e0', marginRight: 18, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <Image
                source={member.imageUrl?.data ? { uri: member.imageUrl.data } : require('../../assets/images/Avatar/man3.png')}
                style={{ width: 70, height: 70, borderRadius: 10 }}
              />
              <TouchableOpacity
                onPress={() => setImageActionModalVisible(true)}
                style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: isDarkMode ? colors.dblack : '#fff', borderRadius: 12, padding: 3, elevation: 2 }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={18} color={isDarkMode ? colors.gwhite : '#222'} />
              {/* Image Action Modal */}
              <Modal
                visible={imageActionModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setImageActionModalVisible(false)}
              >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 16, padding: 24, width: 280, alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 18 }}>Update Profile Image</Text>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                      onPress={async () => {
                        setImageActionModalVisible(false);
                        setShowLoaderModal(true);
                        setUpdatingImage(falsee);
                        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                        if (!permissionResult.granted) {
                          Alert.alert('Permission required', 'Please allow camera access.');
                          setUpdatingImage(false);
                          setShowLoaderModal(false);
                          return;
                        }
                        const pickerResult = await ImagePicker.launchCameraAsync({
                          allowsEditing: true,
                          aspect: [1, 1],
                          quality: 0.7,
                        });
                        if (pickerResult.cancelled || !pickerResult.assets || !pickerResult.assets.length) {
                          setUpdatingImage(false);
                          setShowLoaderModal(false);
                          return;
                        }
                        const imageUri = pickerResult.assets[0].uri;
                        const uploadResult = await uploadFileToCloudinary({ uri: imageUri }, 'member_images');
                        if (!uploadResult.success) {
                          Alert.alert('Upload failed', uploadResult.msg || 'Could not upload image.');
                          setUpdatingImage(false);
                          setShowLoaderModal(false);
                          return;
                        }
                    const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
                        const memberRef = doc(db, 'admin', adminId, 'members', memberId);
                        await updateDoc(memberRef, {
                          imageUrl: { data: uploadResult.data },
                          updatedAt: new Date(),
                        });
                        setMember(prev => ({ ...prev, imageUrl: { data: uploadResult.data } }));
                        Alert.alert('Success', 'Profile image updated!');
                        setUpdatingImage(false);
                        setShowLoaderModal(false);
                      }}
                    >
                      <Ionicons name="camera" size={22} color={isDarkMode?"#eee":"#222"} style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16 }}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                      onPress={async () => {
                        setImageActionModalVisible(false);
                        setShowLoaderModal(true);
                        setUpdatingImage(true);
                        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (!permissionResult.granted) {
                          Alert.alert('Permission required', 'Please allow gallery access.');
                          setUpdatingImage(false);
                          setShowLoaderModal(false);
                          return;
                        }
                        const pickerResult = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          allowsEditing: true,
                          aspect: [1, 1],
                          quality: 0.7,
                        });
                        if (pickerResult.cancelled || !pickerResult.assets || !pickerResult.assets.length) {
                          setUpdatingImage(false);
                          setShowLoaderModal(false);
                          return;
                        }
                        const imageUri = pickerResult.assets[0].uri;
                        const uploadResult = await uploadFileToCloudinary({ uri: imageUri }, 'member_images');
                        if (!uploadResult.success) {
                          Alert.alert('Upload failed', uploadResult.msg || 'Could not upload image.');
                          setUpdatingImage(false);
                          setShowLoaderModal(false);
                          return;
                        }
                    const adminId = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
                        const memberRef = doc(db, 'admin', adminId, 'members', memberId);
                        await updateDoc(memberRef, {
                          imageUrl: { data: uploadResult.data },
                          updatedAt: new Date(),
                        });
                        setMember(prev => ({ ...prev, imageUrl: { data: uploadResult.data } }));
                        Alert.alert('Success', 'Profile image updated!');
                        setUpdatingImage(false);
                        setShowLoaderModal(false);
                      }}
                    >
                      <Ionicons name="image" size={22} color={isDarkMode?"#eee":"#222"} style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16 }}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                      onPress={async () => {
                        Alert.alert(
                          'Delete Image',
                          'Are you sure you want to delete the profile image?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                setShowLoaderModal(true);
                                setUpdatingImage(true);
                                const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
                                const memberRef = doc(db, 'admin', adminId, 'members', memberId);
                                await updateDoc(memberRef, {
                                  imageUrl: { data: '' },
                                  updatedAt: new Date(),
                                });
                                setMember(prev => ({ ...prev, imageUrl: { data: '' } }));
                                Alert.alert('Success', 'Profile image deleted.');
                                setUpdatingImage(false);
                                setShowLoaderModal(false);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash" size={22} color="#d00" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, color: '#d00' }}>Delete Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#eee', width: '100%', alignItems: 'center' }}
                      onPress={() => setImageActionModalVisible(false)}
                    >
                      <Text style={{ fontSize: 15 }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, height: 100, justifyContent: 'space-between', paddingVertical: 2 }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: isDarkMode ? colors.gwhite : undefined }}>{member.name || 'Unknown'}</Text>
                <Text style={{ color: isDarkMode ? colors.twhite : '#444', fontSize: 14, marginTop: 2 }}>+91 {member.mobile || ''}</Text>
              </View>
              {/* <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={{ color: '#888', fontSize: 13 }}>Batch Time </Text>
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.batchTime || 'N/A'}</Text>
                <Text style={{ color: '#888', fontSize: 13, marginLeft: 12 }}>ID </Text>
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.memberid || member.id || 'N/A'}</Text>
              </View> */}
            </View>
          </View>
          {/* Details below image, aligned left */}
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={{ color: isDarkMode ? colors.twhite : '#888', fontSize: 13 }}>Gender: </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 13, color: isDarkMode ? colors.gwhite : '#222' }}>{member.gender || 'N/A'}</Text>
          <Text style={{ color: isDarkMode ? colors.twhite : '#888', fontSize: 13,marginLeft: 100 }}>ID: </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 13, color: isDarkMode ? colors.gwhite : '#222' }}>{member.memberid || member.id || 'N/A'}</Text>
            </View>
          <View style={{ flexDirection: 'column', flexWrap: 'wrap', marginLeft: 2 }}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Training Type: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 ,color: isDarkMode ? colors.gwhite : '#414141'}}>{member.trainingType || 'General Training'}</Text>
            </View>
           
            <View style={{ flexDirection: 'row', marginBottom: 4  }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Address: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13,color: isDarkMode ? colors.gwhite : '#414141' }}>{member.address || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Batch Name: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13,color: isDarkMode ? colors.gwhite : '#414141' }}>{member.batchName || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Batch Time: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13,color: isDarkMode ? colors.gwhite : '#414141' }}>{member.batchTime || 'N/A'}</Text>
            </View>
            {/* <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>ID: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.memberid || member.id || 'N/A'}</Text>
            </View> */}
          </View>
          <View style={{ borderBottomWidth: 1, borderColor: '#eee', marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 }}>
            <TouchableOpacity onPress={markAttendance} style={{ alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={28} color={isDarkMode ? '#fff':'#222'} />
              <Text style={{ fontSize: 12, color: isDarkMode ? colors.gwhite : '#414141', marginTop: 2 }}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openRenewalModal} style={{ alignItems: 'center' } }>
              <Ionicons name="refresh-circle-outline" size={28} color={isDarkMode?"#eee":"#222"} />
              <Text style={{ fontSize: 12, color: isDarkMode ? colors.gwhite : '#414141', marginTop: 2 }}>Renew</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => {
                if (member.mobile) {
                  Linking.openURL(`tel:${member.mobile}`);
                } else {
                  Alert.alert('No mobile number', 'This member does not have a mobile number.');
                }
              }}
            >
              <Ionicons name="call-outline" size={28} color={isDarkMode?"#eee":"#222"} />
              <Text style={{ fontSize: 12, color: isDarkMode ? colors.gwhite : '#414141', marginTop: 2 }}>Call</Text>
            </TouchableOpacity>
            {/* QR Icon Button */}
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => setShowQRModal(true)}>
              <Ionicons name="qr-code-outline" size={28} color={isDarkMode?"#eee":"#222"} />
              <Text style={{ fontSize: 12, color: isDarkMode ? colors.gwhite : '#414141', marginTop: 2 }}>QR</Text>
            </TouchableOpacity>
  
      {/* QR Modal */}
      <Modal
        visible={showQRModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 18, padding: 28, alignItems: 'center', width: 320, position: 'relative' }}>
            {/* Share icon at top right if loading or showing QR */}
            {(qrLoading || (typeof qrUrl === 'string' && qrUrl.trim() !== '')) && (
              <TouchableOpacity
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                onPress={async () => {
                  if (qrUrl) {
                    try {
                      const { shareAsync, isAvailableAsync } = await import('expo-sharing');
                      const FileSystem = await import('expo-file-system');
                      const canShare = await isAvailableAsync();
                      if (!canShare) {
                        Alert.alert('Sharing not available on this device.');
                        return;
                      }
                      // Use cache directory for Android 10 compatibility
                      const fileUri = `${FileSystem.cacheDirectory}member_qr_${memberId}.png`;
                      try { await FileSystem.deleteAsync(fileUri, { idempotent: true }); } catch {}
                      const downloadRes = await FileSystem.downloadAsync(qrUrl, fileUri);
                      const localUri = downloadRes && downloadRes.uri ? downloadRes.uri : null;
                      if (localUri) {
                        await shareAsync(localUri);
                      } else {
                        await shareAsync(qrUrl);
                      }
                    } catch (e) {
                      try {
                        const { shareAsync } = await import('expo-sharing');
                        await shareAsync(qrUrl);
                      } catch {
                        Alert.alert('Share failed', 'Could not share QR code.');
                      }
                    }
                  }
                }}
              >
                <Ionicons name="share-social-outline" size={24} color={isDarkMode?"#eee":"#222"} />
              </TouchableOpacity>
            )}
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 18,color: isDarkMode ? colors.gwhite : '#414141' }}>Member QR Code</Text>
            {/* Hidden QR SVG for PNG generation */}
            {showQRModal && !qrUrl && (
              <View style={{ position: 'absolute', left: -10000, top: -10000, width: 1, height: 1, overflow: 'hidden' }} accessible={false} importantForAccessibility="no-hide-descendants">
                <QRCode
                  value={memberId}
                  size={200}
                  getRef={qrSvgRef}
                  backgroundColor="#fff"
                  color="#000"
                />
              </View>
            )}
            {qrLoading ? (
              <ActivityIndicator size="large" color="#1a7f37" style={{ marginVertical: 24 }} />
            ) : (typeof qrUrl === 'string' && qrUrl.trim() !== '') ? (
              <Image source={{ uri: qrUrl }} style={{ width: 200, height: 200, marginBottom: 18, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }} />
            ) : qrError ? (
              <Text style={{ color: 'red', marginBottom: 18 }}>{qrError}</Text>
            ) : (
              <Text style={{ color: '#888', marginBottom: 18 }}>No QR found for this member.</Text>
            )}
            {!qrUrl && !qrLoading && (
              <TouchableOpacity
                style={{ backgroundColor: '#1a7f37', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24, marginBottom: 10 }}
                onPress={generateAndSaveQr}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Generate QR</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ marginTop: 6, padding: 8, borderRadius: 8, backgroundColor: '#eee', width: '100%', alignItems: 'center' }}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={{ fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
          </View>
        </View>

        {/* Packages Section */}
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, marginLeft: 2 }}>Package Details</Text>
        <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 14, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}>
          <Text style={{ color: '#f7b500', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{member2?.planname || 'No Plan'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Start Date</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15,color: isDarkMode ? colors.gwhite : '#414141' }}>{member2?.planStartDate ? new Date(member2.planStartDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>End Date</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15,color: isDarkMode ? colors.gwhite : '#414141' }}>{member2?.planExpireDate ? new Date(member.endDate || member2.planExpireDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Amount Paid</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15,color: isDarkMode ? colors.gwhite : '#414141' }}>{member2?.amountPaid !== undefined ? `₹${member2.amountPaid}` : (member2?.paidAmount !== undefined ? `₹${member2.paidAmount}` : 'N/A')}</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Due Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15,color: isDarkMode ? colors.gwhite : '#414141' }}>{member2?.dues !== undefined ? `₹${member2.dues}` : 'N/A'}</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Package Duration</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15,color: isDarkMode ? colors.gwhite : '#414141' }}>{member2?.planDuration !== undefined ? `${member2.planDuration}` : 'N/A'}</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Days Remaining</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15,color: isDarkMode ? colors.gwhite : '#414141' }}>
                {(() => {
                  const end = member2?.planExpireDate;
                  if (!end) return 'N/A';
                  const endDate = new Date(end);
                  const today = new Date();
                  // Zero out time for both dates
                  endDate.setHours(0,0,0,0);
                  today.setHours(0,0,0,0);
                  const diff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                  return diff < 0 ? 0 : diff;
                })()}
              </Text>
            </View>
          </View>
        </View>
      {/* Clear Dues Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#1a7f37',
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          marginHorizontal: 10,
          marginBottom: 30,
          marginTop: 10,
        }}
        onPress={openPaymentModal}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Clear Dues</Text>
      </TouchableOpacity>

        {/* Attendance UI for current week, now clickable */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/(screens)/AttendanceMonth',
              params: {
                memberId: memberId,
                memberName: member?.name || '',
              },
            });
          }}
        >
          <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 18, padding: 24, marginBottom: 12, marginTop: 32, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDarkMode ? colors.gwhite : '#414141', marginBottom: 12 }}>Attendance</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              {weekAttendance.map((dayObj, idx) => {
                // Find today's index in weekAttendance
                const today = new Date();
                const todayIdx = (() => {
                  // weekAttendance is Mon-Sun, get today's index (0=Mon, 6=Sun)
                  let dow = today.getDay();
                  return dow === 0 ? 6 : dow - 1;
                })();
                const isToday = idx === todayIdx;
                // Show dash for holiday or Sunday, else show icon/color
                if (dayObj.status === 'holiday' || (idx === 6 && dayObj.status !== 'present' && dayObj.status !== 'absent')) {
                  return (
                    <View key={dayObj.day+idx} style={{ alignItems: 'center', marginHorizontal: 6 }}>
                      <Text style={{ fontSize: 16, color: isToday ? '#222' : '#888', fontWeight: isToday ? '900' : 'bold', textDecorationLine: isToday ? 'underline' : 'none' }}>{dayObj.day}</Text>
                      <View style={{ marginTop: 6 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#bbb', fontSize: 22, fontWeight: 'bold' }}>-</Text>
                        </View>
                      </View>
                    </View>
                  );
                }
                let bgColor = '#eee', icon = 'remove', iconColor = '#bbb';
                if (dayObj.status === 'present') {
                  bgColor = '#4CAF50'; icon = 'checkmark'; iconColor = '#fff';
                } else if (dayObj.status === 'absent') {
                  bgColor = '#F44336'; icon = 'close'; iconColor = '#fff';
                }
                return (
                  <View key={dayObj.day+idx} style={{ alignItems: 'center', marginHorizontal: 6 }}>
                    <Text style={{ fontSize: 16, color: isToday ? '#222' : '#888', fontWeight: isToday ? '900' : 'bold', textDecorationLine: isToday ? 'underline' : 'none' }}>{dayObj.day}</Text>
                    <View style={{ marginTop: 6 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name={icon} size={22} color={iconColor} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>

        {/* Total Streak Display */}
        <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 14, padding: 16, marginBottom: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a7f37', marginBottom: 4 }}>Total Streak</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flame" size={26} color="#ff9800" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#ff9800' }}>{totalStreak}</Text>
          </View>
        </View>

        {/* Transaction History Section */}
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, marginLeft: 2 }}>Transaction History</Text>
        {transactions && transactions.length > 0 ? (
          transactions.map((txn, idx) => (
            <View
              key={txn.id || idx}
              style={{
                backgroundColor: isDarkMode ? '#444' : '#fff',
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                marginBottom: 12,
                marginHorizontal: 2,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Left: Avatar, Name, Date */}
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Image
                  source={member.imageUrl?.data ? { uri: member.imageUrl.data } : require('../../assets/images/Avatar/man3.png')}
                  style={{ width: 38, height: 38, borderRadius: 19, marginRight: 10 }}
                />
                <View>
                  <Text style={{ color: isDarkMode ? colors.twhite : '#bbb', fontSize: 11, fontWeight: '600', marginBottom: 1 }}>TXN : {txn.receiptId}</Text>
                  <Text style={{ color: isDarkMode ? colors.gwhite : '#212121', fontWeight: 'bold', fontSize: 16 }}>{member.name || 'Unknown'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="ellipse" size={12} color="#4ade80" style={{ marginRight: 4 }} />
                    <Text style={{ color: isDarkMode ? colors.gwhite : '#aaa', fontSize: 12, marginRight: 8 }}>{formatTime(txn.paymentDate)}</Text>
                    <Text style={{ color: isDarkMode ? colors.gwhite : '#aaa', fontSize: 12 }}>|  {formatDate(txn.paymentDate)}</Text>
                  </View>
                </View>
              </View>
              {/* Right: Price only */}
              <View style={{ alignItems: 'flex-end', justifyContent: 'center', height: 38 }}>
                <Text style={{ color: isDarkMode ? colors.gwhite : '#434343', fontSize: 17 }}>₹{txn.amountPaid}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: isDarkMode ? colors.twhite : '#888', fontSize: 15, marginLeft: 2, marginBottom: 18 }}>No transactions found.</Text>
        )}
      </ScrollView>

      {/* Edit Member Modal */}
       <Modal
         visible={isEditModalVisible}
         animationType="slide"
         transparent={true}
         onRequestClose={closeEditModal}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Edit Member</Text>
               <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                 <Ionicons name="close" size={24} color={colors.gwhite} />
               </TouchableOpacity>
             </View>

             <ScrollView style={styles.modalScrollView}>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Name *</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.name}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, name: text }))}
                   placeholder="Enter member name"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Mobile Number</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.mobile}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, mobile: text }))}
                   placeholder="Enter mobile number"
                   placeholderTextColor={colors.twhite}
                   keyboardType="phone-pad"
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Training Type</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.trainingType}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, trainingType: text }))}
                   placeholder="Enter training type"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Address</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.address}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, address: text }))}
                   placeholder="Enter address"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Gender</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.gender}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, gender: text }))}
                   placeholder="Enter gender"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Batch Name</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.batchName}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, batchName: text }))}
                   placeholder="Enter batch name"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Batch Time</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.batchTime}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, batchTime: text }))}
                   placeholder="Enter batch time"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
             </ScrollView>

             <View style={styles.modalFooter}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={closeEditModal}
               >
                 <Text style={styles.cancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={[styles.modalButton, styles.saveButton]}
                 onPress={saveMemberChanges}
                 disabled={saving}
               >
                 <Text style={styles.saveButtonText}>
                   {saving ? 'Saving...' : 'Save Changes'}
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

      {/* Payment Modal */}
      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={closePaymentModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.gwhite} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="Enter payment amount"
                  placeholderTextColor={colors.twhite}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoText}>
                  Current Dues: ₹{member.dues || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Remaining after payment: ₹{Math.max(0, (member.dues || 0) - parseFloat(paymentAmount || 0))}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePaymentModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={processPayment}
                disabled={processingPayment}
              >
                <Text style={styles.saveButtonText}>
                  {processingPayment ? 'Processing...' : 'Record Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Renewal Modal */}
      <Modal
        visible={isRenewalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRenewalModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Renew Plan</Text>
              <TouchableOpacity onPress={closeRenewalModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.gwhite} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Renewal Plan</Text>
                {plans.length > 0 ? (
                  <View style={styles.planContainer}>
                    {plans.map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        style={[
                          styles.planButton,
                          renewalPlan === plan.id && styles.planButtonActive
                        ]}
                        onPress={() => setRenewalPlan(plan.id)}
                      >
                        <Text style={[
                          styles.planButtonText,
                          renewalPlan === plan.id && styles.planButtonTextActive
                        ]}>
                          {plan.name}
                        </Text>
                        <Text style={[
                          styles.planPriceText,
                          renewalPlan === plan.id && styles.planPriceTextActive
                        ]}>
                          ₹{plan.price}
                        </Text>
                        <Text style={[
                          styles.planDurationText,
                          renewalPlan === plan.id && styles.planDurationTextActive
                        ]}>
                          {plan.duration} Month
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noPlansContainer}>
                    <Text style={styles.noPlansText}>No plans available</Text>
                    <Text style={styles.noPlansSubText}>Please add plans in the Plans section</Text>
                  </View>
                )}
              </View>

              <View style={styles.renewalInfo}>
                <Text style={styles.renewalInfoText}>
                  Current Status: {member.status || 'Active'}
                </Text>
                <Text style={styles.renewalInfoText}>
                  Current Plan: {member.planType || 'No Plan'}
                </Text>
                {member.planExpireDate && (
                  <Text style={styles.renewalInfoText}>
                    Current Expiry: {new Date(member.planExpireDate).toLocaleDateString()}
                  </Text>
                )}
                {member.planExpireDate && new Date(member.planExpireDate) < new Date() && (
                  <Text style={[styles.renewalInfoText, styles.expiredText]}>
                    ⚠️ Plan Expired
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRenewalModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={processRenewal}
                disabled={processingRenewal}
              >
                <Text style={styles.saveButtonText}>
                  {processingRenewal ? 'Processing...' : 'Renew Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Renewal Payment Modal */}
      <Modal
        visible={showRenewalPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRenewalPaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Renewal Payment</Text>
              <TouchableOpacity onPress={closeRenewalPaymentModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.gwhite} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScrollView}>
              {selectedPlanForRenewal && (
                <View style={styles.planInfo}>
                  <Text style={styles.planInfoTitle}>Selected Plan</Text>
                  <Text style={styles.planInfoText}>Name: {selectedPlanForRenewal.name}</Text>
                  <Text style={styles.planInfoText}>Duration: {selectedPlanForRenewal.duration} Months</Text>
                  <Text style={styles.planInfoText}>Price: ₹{selectedPlanForRenewal.price}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={renewalPaymentAmount}
                  onChangeText={setRenewalPaymentAmount}
                  placeholder="Enter payment amount"
                  placeholderTextColor={colors.twhite}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoText}>
                  Current Dues: ₹{member2.dues || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Plan Price: ₹{selectedPlanForRenewal?.price || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Plan Cost: ₹{selectedPlanForRenewal?.price || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  {parseFloat(renewalPaymentAmount || 0) >= (selectedPlanForRenewal?.price || 0) 
                    ? `Remaining dues after full payment: ₹${Math.max(0, ((member2.dues || 0) + (selectedPlanForRenewal?.price || 0)) - parseFloat(renewalPaymentAmount || 0))}`
                    : `Dues after partial payment: ₹${Math.max(0, ((member2.dues || 0) + (selectedPlanForRenewal?.price || 0)) - parseFloat(renewalPaymentAmount || 0))}`
                  }
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRenewalPaymentModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => processPlanRenewal({
                  adminId: auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2',
                  memberId,
                  renewalPaymentAmount,
                  selectedPlanForRenewal,
                  member2,
                })}
                disabled={processingRenewal}
              >
                <Text style={styles.saveButtonText}>
                  {processingRenewal ? 'Processing...' : 'Confirm Renewal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loader Modal */}
      <Modal
        visible={showLoaderModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 12, padding: 32, alignItems: 'center' }}>
            <Ionicons name="cloud-upload-outline" size={36} color={isDarkMode?"#eee":"#222"} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Updating Image...</Text>
          </View>
        </View>
      </Modal>

      {/* Attendance Loader Modal */}
      <Modal
        visible={attendanceLoading}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: isDarkMode ? colors.wblack : '#fff', borderRadius: 12, padding: 32, alignItems: 'center' }}>
            <Ionicons name="cloud-upload-outline" size={36} color={isDarkMode?"#eee":"#222"} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Marking Attendance...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dblack,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.wblack,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gwhite,
  },
  editButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gwhite,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.gwhite,
    fontSize: 16,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.wblack,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gwhite,
    marginBottom: 5,
  },
  memberStatus: {
    fontSize: 16,
    color: colors.twhite,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.wblack,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.twhite,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gwhite,
  },
  paymentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gwhite,
    marginBottom: 15,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.wblack,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gwhite,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.twhite,
    marginTop: 2,
  },
  transactionStatus: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTransactionsText: {
    color: colors.twhite,
    fontSize: 16,
    marginTop: 10,
  },
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gwhite,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gwhite,
  },
     actionButtonText: {
     color: colors.dblack,
     fontSize: 16,
     fontWeight: '600',
     marginLeft: 10,
   },
   // Modal Styles
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalContent: {
     backgroundColor: colors.dblack,
     borderRadius: 15,
     width: '90%',
     maxHeight: '80%',
     borderWidth: 1,
     borderColor: colors.wblack,
   },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 20,
     borderBottomWidth: 1,
     borderBottomColor: colors.wblack,
   },
   modalTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: colors.gwhite,
   },
   closeButton: {
     padding: 5,
   },
   modalScrollView: {
     padding: 20,
   },
   inputGroup: {
     marginBottom: 20,
   },
   inputLabel: {
     fontSize: 14,
     color: colors.twhite,
     marginBottom: 8,
     fontWeight: '500',
   },
   textInput: {
     backgroundColor: colors.wblack,
     borderRadius: 8,
     padding: 12,
     fontSize: 16,
     color: colors.gwhite,
     borderWidth: 1,
     borderColor: colors.twhite,
   },
   statusContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
   },
   statusButton: {
     flex: 1,
     paddingVertical: 10,
     paddingHorizontal: 15,
     borderRadius: 8,
     borderWidth: 1,
     borderColor: colors.twhite,
     marginHorizontal: 5,
     alignItems: 'center',
   },
   statusButtonActive: {
     backgroundColor: colors.gwhite,
     borderColor: colors.gwhite,
   },
   statusButtonText: {
     color: colors.twhite,
     fontSize: 14,
     fontWeight: '500',
   },
   statusButtonTextActive: {
     color: colors.dblack,
   },
   modalFooter: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     padding: 20,
     borderTopWidth: 1,
     borderTopColor: colors.wblack,
   },
   modalButton: {
     flex: 1,
     paddingVertical: 12,
     borderRadius: 8,
     alignItems: 'center',
     marginHorizontal: 5,
   },
   cancelButton: {
     backgroundColor: 'transparent',
     borderWidth: 1,
     borderColor: colors.twhite,
   },
   saveButton: {
     backgroundColor: colors.gwhite,
   },
   cancelButtonText: {
     color: colors.twhite,
     fontSize: 16,
     fontWeight: '600',
   },
       saveButtonText: {
      color: colors.dblack,
      fontSize: 16,
      fontWeight: '600',
    },
    // Payment Modal Styles
    paymentInfo: {
      backgroundColor: colors.wblack,
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
    },
    paymentInfoText: {
      color: colors.twhite,
      fontSize: 14,
      marginBottom: 5,
    },
    // Renewal Modal Styles
    planContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    planButton: {
      width: '48%',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.twhite,
      marginBottom: 10,
      alignItems: 'center',
    },
    planButtonActive: {
      backgroundColor: colors.gwhite,
      borderColor: colors.gwhite,
    },
    planButtonText: {
      color: colors.twhite,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
    },
    planButtonTextActive: {
      color: colors.dblack,
    },
    planPriceText: {
      color: colors.twhite,
      fontSize: 12,
    },
    planPriceTextActive: {
      color: colors.dblack,
    },
    renewalInfo: {
      backgroundColor: colors.wblack,
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
    },
         renewalInfoText: {
       color: colors.twhite,
       fontSize: 14,
       marginBottom: 5,
     },
     // Additional Plan Styles
     planDurationText: {
       color: colors.twhite,
       fontSize: 10,
       marginTop: 2,
     },
     planDurationTextActive: {
       color: colors.dblack,
     },
     noPlansContainer: {
       alignItems: 'center',
       paddingVertical: 20,
     },
     noPlansText: {
       color: colors.twhite,
       fontSize: 16,
       fontWeight: '600',
       marginBottom: 5,
     },
     noPlansSubText: {
       color: colors.twhite,
       fontSize: 12,
       opacity: 0.7,
     },
     expiredText: {
       color: '#ff6b6b',
       fontWeight: 'bold',
     },
     expiredStatus: {
       color: '#ff6b6b',
       fontWeight: 'bold',
     },
     // Renewal Payment Modal Styles
     planInfo: {
       backgroundColor: colors.wblack,
       padding: 15,
       borderRadius: 8,
       marginBottom: 15,
     },
     planInfoTitle: {
       color: colors.gwhite,
       fontSize: 16,
       fontWeight: 'bold',
       marginBottom: 8,
     },
     planInfoText: {
       color: colors.twhite,
       fontSize: 14,
       marginBottom: 3,
     },
   });