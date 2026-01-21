import colors from "@/assets/colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Button, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '../../context/ThemeContext';
import { uploadFileToCloudinary } from '../../services/imageService';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import placeholder from '../../assets/images/Avatar/man3.png';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseconfig';
// import { format } from 'date-fns';

const onAgree = () => {
  router.push("/home");
};


const AddMember = () => {
  const { isDarkMode } = useTheme();


  // ...existing code...




  const [image, setImage] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrSvgRef, setQrSvgRef] = useState(null);
  const [pendingQrUpload, setPendingQrUpload] = useState(null);
  // Validation helpers
  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const validateForm = (f) => {
    console.log('Form state:', f);
    if (!f) { console.log('No form'); return false; }
    if (!f.name || f.name.trim().length < 3) { console.log('Name invalid'); return false; }
    if (!f.mobile || !/^\d{10}$/.test(f.mobile)) { console.log('Mobile invalid'); return false; }
    if (!f.email || !validateEmail(f.email)) { console.log('Email invalid'); return false; }
    if (!f.trainingType) { console.log('TrainingType invalid'); return false; }
    if (!f.gender) { console.log('Gender invalid'); return false; }
    if (!f.dob) { console.log('DOB invalid'); return false; }
    if (!f.gymPlan) { console.log('GymPlan invalid'); return false; }
    if (!f.gymPlanduration || f.gymPlanduration === '') { console.log('GymPlanduration invalid'); return false; }
    if (f.admissionFee === '' || isNaN(Number(f.admissionFee))) { console.log('AdmissionFee invalid'); return false; }
    if (!f.joiningDate) { console.log('JoiningDate invalid'); return false; }
    if (f.paidAmount === '' || isNaN(Number(f.paidAmount))) { console.log('PaidAmount invalid'); return false; }
    if (!f.paymentMethod) { console.log('PaymentMethod invalid'); return false; }
    if (!f.address) { console.log('Address invalid'); return false; }
    return true;
  };

  // Watch form changes for validation
  useEffect(() => {
    setFormValid(validateForm(form));
  }, [form]);
  const [loading, setLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [modelvisible, setModalVisible] = useState();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    gender: 'Male',
    trainingType: '',
    email: '',
    dob: new Date(),
    gymPlan: '1 Month',
    gymPlanduration: 30,
    admissionFee: '',
    joiningDate: new Date(),
    paidAmount: '',
    paymentMethod: 'Cash',
    dues: '',
    comments: '',
    address: '',
    activemember: true,
    newmember: true,
    expiredmember: false,
  });

  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showJoinPicker, setShowJoinPicker] = useState(false);
  const [adminUID, setAdminUID] = useState(auth.currentUser?.uid || "");


  //  const [image, setImage] = useState(null);


  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  // Helper to upload QR code after member is created
  // Upload QR code image and update Firestore
  // const uploadQrAndSave = async (memberidString, memberRefId, uid) => {
  //   if (!qrSvgRef) {
  //     // Wait for QR ref to be set after render
  //     setPendingQrUpload({ memberidString, memberRefId, uid });
  //     return;
  //   }
  //   qrSvgRef.toDataURL(async (data) => {
  //     try {
  //       const dataUrl = `data:image/png;base64,${data}`;
  //       const qrCodeUrl = await uploadFileToCloudinary(dataUrl, 'member_qrcodes');
  //       await updateDoc(doc(db, 'admin', uid, 'members', memberRefId), { qrCodeUrl });
  //     } catch (err) {
  //       console.error('QR upload error:', err);
  //     }
  //   });
  // };

  // // Effect: if pendingQrUpload is set and qrSvgRef is ready, upload
  // useEffect(() => {
  //   if (pendingQrUpload && qrSvgRef) {
  //     uploadQrAndSave(pendingQrUpload.memberidString, pendingQrUpload.memberRefId, pendingQrUpload.uid);
  //     setPendingQrUpload(null);
  //   }
  // }, [pendingQrUpload, qrSvgRef]);

  const handleSubmit = async () => {
    console.log('Save pressed');
    console.log('Form valid:', formValid);
    if (loading) return;
    // Field-by-field validation with specific alerts
    if (!form.name || form.name.trim().length < 3) {
      Alert.alert('Invalid Name', 'Name must be at least 3 characters.');
      return;
    }
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      Alert.alert('Invalid Mobile', 'Mobile number must be 10 digits.');
      return;
    }
    if (!form.email || !validateEmail(form.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!form.trainingType) {
      Alert.alert('Missing Training Type', 'Please enter training type.');
      return;
    }
    if (!form.gender) {
      Alert.alert('Missing Gender', 'Please select gender.');
      return;
    }
    if (!form.dob) {
      Alert.alert('Missing DOB', 'Please select date of birth.');
      return;
    }
    if (!form.gymPlan) {
      Alert.alert('Missing Plan', 'Please select a gym plan.');
      return;
    }
    if (!form.gymPlanduration || form.gymPlanduration === '') {
      Alert.alert('Missing Plan Duration', 'Please select a valid plan duration.');
      return;
    }
    if (form.admissionFee === '' || isNaN(Number(form.admissionFee))) {
      Alert.alert('Invalid Admission Fee', 'Please enter a valid admission fee.');
      return;
    }
    if (!form.joiningDate) {
      Alert.alert('Missing Joining Date', 'Please select joining date.');
      return;
    }
    if (form.paidAmount === '' || isNaN(Number(form.paidAmount))) {
      Alert.alert('Invalid Paid Amount', 'Please enter a valid paid amount.');
      return;
    }
      // Alert if paid amount is greater than admission fee + plan price
      const planPrice = parseFloat(selectedPlan?.price || 0);
      const admissionFee = parseFloat(form.admissionFee || 0);
      const paidAmount = parseFloat(form.paidAmount || 0);
      if (paidAmount > (admissionFee + planPrice)) {
        Alert.alert('Overpayment', 'Paid amount cannot be greater than Admission Fee + Plan Price.');
        return;
      }
    if (!form.paymentMethod) {
      Alert.alert('Missing Payment Method', 'Please select payment method.');
      return;
    }
    if (!form.address) {
      Alert.alert('Missing Address', 'Please enter address.');
      return;
    }

    setLoading(true);
    const uid = adminUID || auth.currentUser?.uid;
    console.log('UID:', uid);
    // Use the selected joining date for transactions and financial summary
    const selectedJoinDate = new Date(form.joiningDate);
    const year = selectedJoinDate.getFullYear();
    const monthIndex = selectedJoinDate.getMonth();
    const planDuration = parseInt(form.gymPlanduration) || 30;

    // Calculate expiry date
    const joinDateObj = new Date(form.joiningDate);
    // const planExpireDate = new Date(joinDateObj);
    // planExpireDate.setDate(joinDateObj.getDate() + planDuration - 2);
    let planExpireDate = new Date(joinDateObj);
    // planExpireDate.setDate(planExpireDate.getDate() + planDuration - 1);
    // let planExpireDate = new Date(joinDate);
console.log('Plan Duration:', planDuration);
// Add months
function addMonthsSafe(date, monthsToAdd) {
  const d = new Date(date); // clone the original date
  const day = d.getDate();

  // Set month
  d.setMonth(d.getMonth() + monthsToAdd);
console.log('After adding months:', d);
  // Handle month overflow (e.g., adding 1 month to Jan 31 → Feb 28)
  if (d.getDate() < day) {
    d.setDate(0); // move to last day of previous month
  }

  return d;
}
console.log('Before adjusting for inclusive duration:', planExpireDate);
// Usage:console
// Use the selected joining date to calculate expiry (not today's date)
planExpireDate = addMonthsSafe(joinDateObj, planDuration);

// Subtract 1 day for inclusive duration
planExpireDate.setDate(planExpireDate.getDate() - 1);

console.log(planExpireDate.toISOString().split('T')[0]); // YYYY-MM-DD


  try {
      // 1. Get the highest memberid from Firestore (robust extraction)
      let newMemberId = 1;
      const membersRef = collection(db, 'admin', uid, 'members');
      const q = await getDocs(membersRef);
      let maxId = 0;
      q.forEach(docSnap => {
        const data = docSnap.data();
        if (data.memberid && typeof data.memberid === 'string') {
          // Extract number from KGF-ID-<number>
          const match = data.memberid.match(/KGF-ID-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        }
      });
      newMemberId = maxId + 1;
      const memberidString = `KGF-ID-${newMemberId}`;

      const imageUrl = await uploadFileToCloudinary(image, "member_images");
      const memberRef = await addDoc(collection(db, 'admin', uid, 'members'), {
        ...form,
        memberid: memberidString,
        imageUrl,
        dob: form.dob.toISOString(),
        joiningDate: form.joiningDate.toISOString(),
        planExpireDate: planExpireDate.toISOString(),
        createdAt: new Date().toISOString(),
        activemember: true,
        expiredmember: false,
        newmember: true,
      });

      // Generate and upload QR code for memberid
      // setQrData(memberidString);
      // Upload QR after QRCode ref is set (handled by effect)
      // await uploadQrAndSave(memberidString, memberRef.id, uid);

      // Step 2: Add initial transaction inside the member document
      const monthId = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      await addDoc(
        collection(db, 'admin', uid, 'members', memberRef.id, 'transactions'),
        {
          memberName: form.name,
          paymentDate: selectedJoinDate.toISOString(),
          amountPaid: parseFloat(form.paidAmount) || 0,
          paymentMethod: form.paymentMethod,
          dues: parseFloat(form.dues) || 0,
          planDetail: form.gymPlan,
          planDuration: planDuration,
          planExpireDate: planExpireDate.toISOString(),
          receiptId: `TXN${Date.now()}`,
          adminId: uid
        }
      );
      await setDoc(
        doc(db, 'admin', uid, 'members', memberRef.id, 'plandetails','current'),
        {
          planname: selectedPlan?.name || form.gymPlan,
          paymentDate: selectedJoinDate.toISOString(),
          amountPaid: parseFloat(form.paidAmount) || 0,
          paymentMethod: form.paymentMethod,
          dues: parseFloat(form.dues) || 0,
          // planDetail: form.gymPlan,
          planDuration: planDuration,
          planExpireDate: planExpireDate.toISOString(),
          planStartDate: form.joiningDate.toISOString(),
          receiptId: `TXN${Date.now()}`,
          planPurchaseDate: selectedJoinDate.toISOString(),
        }
      );

      //updating financialyear summary
      const updateFinancialSummary = async (
        adminId,
        amountPaid,
        dues,
        monthIndex,
        year,
        admissionFee = 0
      ) => {
        const month = String(monthIndex + 1).padStart(2, '0'); // "01"–"12"
        const summaryRef = doc(db, 'admin', adminId, 'financialSummary', String(year));

        try {
          const docSnap = await getDoc(summaryRef);

          let monthly = {};
          let yearlyTotal = { income: 0, dues: 0 };

          if (docSnap.exists()) {
            const data = docSnap.data();
            monthly = data.monthly || {};
            yearlyTotal = data.yearlyTotal || { income: 0, dues: 0 };
          }

          // Ensure numbers
          amountPaid = Number(amountPaid) || 0;
          dues = Number(dues) || 0;

          // Add paid amount and dues to this month
          const currentMonthData = monthly[month] || { income: 0, dues: 0 };
          currentMonthData.income = Number(currentMonthData.income) || 0;
          currentMonthData.dues = Number(currentMonthData.dues) || 0;
          currentMonthData.admissionFee = Number(currentMonthData.admissionFee) || 0;
          currentMonthData.income += amountPaid;
          currentMonthData.dues += dues;
          currentMonthData.admissionFee += Number(admissionFee) || 0;
          monthly[month] = currentMonthData;

          // Add to yearlyTotal
          yearlyTotal.income = Number(yearlyTotal.income) || 0;
          yearlyTotal.dues = Number(yearlyTotal.dues) || 0;
          yearlyTotal.income += amountPaid;
          yearlyTotal.dues += dues;

          await setDoc(summaryRef, {
            monthly,
            yearlyTotal,
          }, { merge: true });
        } catch (err) {
          console.error('Error updating financial summary:', err.message);
        }
      };

      // ✅ Update Financial Summary (only once)
      await updateFinancialSummary(
        uid,
        parseFloat(form.paidAmount) || 0,
        parseFloat(form.dues) || 0,
        monthIndex,
        year,
        parseFloat(form.admissionFee) || 0
      );

      ToastAndroid.show('Member and transaction added successfully!', ToastAndroid.LONG);
      setForm({
        name: '',
        mobile: '',
        gender: 'Male',
        trainingType: '',
        email: '',
        dob: new Date(),
        gymPlan: '1 Month',
        gymPlanduration: 30,
        admissionFee: '',
        joiningDate: new Date(),
        paidAmount: '',
        paymentMethod: 'Cash',
        dues: '',
        comments: '',
        address: '',
      });
  setImage(null);
      setLoading(false);
      router.push("/home");
    } catch (error) {
      console.error('Error adding member:', error);
      ToastAndroid.show('Error adding member', ToastAndroid.LONG);
      Alert.alert('Error', error?.message || 'Error adding member');
      setLoading(false);
    }
  };






  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    // Always use the current logged-in admin's UID
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(collection(db, 'admin', uid, 'plans'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(list); 
    });
    return () => unsub();
  }, [auth.currentUser]);


  const uploadImage = async (mode) => {
    try {
      let result = {};
      if (mode === 'gallery') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          // mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          //
          await saveImage(result.assets[0].uri);
        }
      }
      else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.
          launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,


          });
        if (!result.canceled) {
          //
          await saveImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      alert("Error uploading image : " + error.message);
      setOpenModal(false);
    }

  };
  const saveImage = async (image) => {
    try {
      console.log(image)
      setImage({ uri: image });
      setOpenModal(false);
    } catch (error) {
      throw error;
    }
  };


  // Remove Image
  const removeImage = async () => {
    try {
      setImage(null);
      setOpenModal(false);
    } catch ({ message }) {
      alert(message);
      setOpenModal(false);

    }
  }



  useEffect(() => {
    const planPrice = parseFloat(selectedPlan?.price || 0);
    const admission = parseFloat(form.admissionFee || 0);
    const paid = parseFloat(form.paidAmount || 0);
    const dues = planPrice + admission - paid;

    handleChange('dues', dues > 0 ? dues.toFixed(2) : '0');
  }, [selectedPlan, form.admissionFee, form.paidAmount]);



  const [openModal, setOpenModal] = useState(false);
  const transparent = 'rgba(0,0,0,0.2)';

  function renderModel() {
    return (
      <Modal visible={openModal} animationType="fade" transparent={true}>
        <View style={{
          // flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: transparent,
          marginTop: 40,
          paddingBottom: 40,
          height: '90%'
        }}>
          <View style={{
            // flex : 1,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: moderateScale(150),
            width: moderateScale(300),
            backgroundColor: colors.lblack,
            borderRadius: 20,
          }} >
            <View
              style={{
                // backgroundColor: 'green',
                width: "100%",
                height: moderateScale(80),
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage()}
                style={{
                  backgroundColor: colors.twhite,
                  width: moderateScale(60),
                  height: moderateScale(60),
                  // flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}
              >
                <SimpleLineIcons name="camera" size={30} color={isDarkMode? '#111':'#222'} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage('gallery')}
                style={{
                  backgroundColor: colors.twhite,
                  width: moderateScale(60),
                  height: moderateScale(60),
                  // flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}
              >
                <AntDesign name="picture" size={30} color={isDarkMode? '#111':'#222'} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={() => removeImage()}
                style={{
                  backgroundColor: colors.twhite,
                  width: moderateScale(60),
                  height: moderateScale(60),
                  // flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}
              >
                <AntDesign name="delete" size={30} color={isDarkMode? '#111':'#222'} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >Remove</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => setOpenModal(false)}>
              <Text
                style={{
                  width: moderateScale(80),
                  // height: moderateScale(30),
                  // backgroundColor : 'blue',
                  textAlign: 'center',
                  fontSize: moderateScale(15),
                  color: 'grey'
                  // alignContent : 'center'
                }}
              >Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }



  return (
    <SafeAreaView style={[styles.mainbody, { backgroundColor: isDarkMode ? '#181818' : '#fff' }]}>  
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
      {/* Hidden QR code for dataURL extraction */}
      {/* {qrData && (
        <QRCode
          value={qrData}
          size={200}
          getRef={c => setQrSvgRef(c)}
          style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}
        />
      )} */}
      <View style={[styles.headerbox, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}>
        <View style={styles.leftnav}>
          <TouchableOpacity onPress={onAgree} activeOpacity={0.8}><Ionicons name="chevron-back-sharp" size={26} color={isDarkMode ? '#fff' : '#181818'} /></TouchableOpacity>
          <Text style={[styles.navtext, { color: isDarkMode ? '#fff' : '#181818' }]}>Add Members</Text>
        </View>
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={styles.savebox} disabled={loading}>
          <Text style={[styles.savetext, { color: isDarkMode ? '#181818' : '#181818' }]}>Save</Text>
        </TouchableOpacity>
      </View>
     





  <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? '#181818' : '#fff' }]}> 

        <View style={styles.profileimgcontmain}>
          <View style={styles.bg}>
            <View style={[styles.profileimgcont, { backgroundColor: isDarkMode ? '#232323' : '#e0f7fa' }]}>
              <View style={styles.profileimgin} >
                {/* <Image style={styles.profileimg} resizeMode="contain" source={image ? { uri: image } : placeholder} />
                 */}
                <Image
                  resizeMode="contain"
                  source={
                    image && typeof image === 'object' && image.uri
                      ? { uri: image.uri }
                      : typeof image === 'string'
                        ? { uri: image }
                        : placeholder
                  }
                  style={styles.profileimg}
                />
              </View>

              <TouchableOpacity onPress={() => setOpenModal(true)} activeOpacity={0.5} style={[styles.profileimgcam, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#333' : '#e0e0e0' }]}><FontAwesome name="camera" size={18} color={isDarkMode ? '#fff' : colors.cwhite} /></ TouchableOpacity>
            </View>
          </View>
        </View>


        {/* <Text style={styles.title}>Add Gym Member</Text> */}
        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Personal Detail</Text>
        <TextInput placeholder="Name" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} value={form.name} onChangeText={text => handleChange('name', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }, form.name && form.name.length < 3 ? { borderColor: 'red' } : null]} />
        {form.name && form.name.length < 3 && (
          <Text style={{ color: 'red', marginTop: -8, marginBottom: 4, fontSize: 12 }}>Name must be at least 3 characters</Text>
        )}
        <TextInput placeholder="Mobile Number" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} keyboardType="phone-pad" value={form.mobile} onChangeText={text => handleChange('mobile', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }, form.mobile && form.mobile.length !== 10 ? { borderColor: 'red' } : null]} />
        {form.mobile && form.mobile.length !== 10 && (
          <Text style={{ color: 'red', marginTop: -8, marginBottom: 4, fontSize: 12 }}>Mobile number must be 10 digits</Text>
        )}
        <TextInput placeholder="Email" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} value={form.email} onChangeText={text => handleChange('email', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }, form.email && !validateEmail(form.email) ? { borderColor: 'red' } : null]} />
        {form.email && !validateEmail(form.email) && (
          <Text style={{ color: 'red', marginTop: -8, marginBottom: 4, fontSize: 12 }}>Enter a valid email address</Text>
        )}
        <TextInput placeholder="Training Type" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} value={form.trainingType} onChangeText={text => handleChange('trainingType', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }]} />

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Gender</Text>
        <Picker selectedValue={form.gender} onValueChange={value => handleChange('gender', value)} style={[styles.picker, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818' }]}>
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Date of Birth</Text>
        <Button style={[styles.pickstyle, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818' }]} title={form.dob.toDateString()} onPress={() => setShowDOBPicker(true)} />
        {showDOBPicker && (
          <DateTimePicker
            value={form.dob}
            mode="date"
            display="default"
            themeVariant={isDarkMode ? 'dark' : 'light'}
            onChange={(_, date) => {
              setShowDOBPicker(false);
              if (date) handleChange('dob', date);
            }}
          />
        )}

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Select Gym Plan</Text>
        <Picker
          selectedValue={selectedPlan?.id || ''}
          style={[styles.picker, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818' }]}
          onValueChange={(itemValue) => {
            const plan = plans.find(p => p.id === itemValue);
            setSelectedPlan(plan);
            handleChange('gymPlan', plan?.name ? plan.name : '');
            handleChange('gymPlanduration', plan?.duration ? plan.duration : 30);
          }}
        >
          <Picker.Item label="-- Select Plan --" value="" />
          {plans.map((plan) => (
            <Picker.Item
              key={plan.id}
              label={`${plan.name} - ₹${plan.price}`}
              value={plan.id}
            />
          ))}
        </Picker>

        {/* Show plan price if selected */}
        {selectedPlan && selectedPlan.price && (
          <Text style={{ marginBottom: 8, color: isDarkMode ? '#fff' : '#181818' }}>
            Plan Price: ₹{selectedPlan.price}  |  Duration: {selectedPlan.duration} Months
          </Text>
        )}

        <TextInput placeholder="Admission Fees" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} keyboardType="numeric" value={form.admissionFee} onChangeText={text => handleChange('admissionFee', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }]} />
        <TextInput placeholder="Paid Amount" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} keyboardType="numeric" value={form.paidAmount} onChangeText={text => handleChange('paidAmount', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }]} />
        {/* <TextInput placeholder="Dues" placeholderTextColor={colors.pholder} keyboardType="numeric" value={form.dues} onChangeText={text => handleChange('dues', text)} style={styles.input} /> */}
        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Dues Amount</Text>
        <TextInput
          placeholder="Dues"
          placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder}
          keyboardType="numeric"
          value={form.dues}
          editable={false}
          style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }]}
        />


        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Select Joining Date</Text>
        {/* <Button backgroundColor={isDarkMode ? '#232323' : '#333'} color={isDarkMode ? '#fff' : colors.lgrey} style={styles.pickstyle} title={form.joiningDate.toDateString()} onPress={() => setShowJoinPicker(true)} /> */}
        <Button style={[styles.pickstyle, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818' }]} title={form.joiningDate.toDateString()} onPress={() => setShowJoinPicker(true)} />

        {showJoinPicker && (
          <DateTimePicker
            value={form.joiningDate}
            mode="date"
            display="default"
            themeVariant={isDarkMode ? 'dark' : 'light'}
            onChange={(_, date) => {
              setShowJoinPicker(false);
              if (date) handleChange('joiningDate', date);
            }}
          />
        )}

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#181818' }]}>Payment Method</Text>
        <Picker selectedValue={form.paymentMethod} onValueChange={value => handleChange('paymentMethod', value)} style={[styles.picker, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818' }]}>
          <Picker.Item label="Cash" value="Cash" />
          <Picker.Item label="UPI" value="UPI" />
          <Picker.Item label="Card" value="Card" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        <TextInput placeholder="Address" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} value={form.address} onChangeText={text => handleChange('address', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }]} />
        <TextInput placeholder="Comments" placeholderTextColor={isDarkMode ? '#aaa' : colors.pholder} value={form.comments} onChangeText={text => handleChange('comments', text)} style={[styles.input, { backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', color: isDarkMode ? '#fff' : '#181818', borderColor: isDarkMode ? '#333' : '#ccc' }]} />

        {/* <TouchableOpacity title="Submit" onPress={handleSubmit} color="#6200ee" /> */}
        <View style={styles.filler}></View>
      </ScrollView>
      {renderModel()}
      {/* Loader Modal */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <View style={{ backgroundColor: isDarkMode ? '#232323' : '#fff', padding: 32, borderRadius: 16, alignItems: 'center', minWidth: 180 }}>
            <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#181818'} />
            <Text style={{ marginTop: 16, color: isDarkMode ? '#fff' : '#181818', fontSize: 16, fontWeight: 'bold' }}>Adding member...</Text>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AddMember

const styles = StyleSheet.create({
  mainbody: {
    flex: 1,
    // justifyContent : 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
    // gap: 20,
  },
  headerbox: {
    // flex : 1,
    justifyContent: 'space-between',
    height: moderateScale(60),
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftnav: {
    // flex : 1,
    // justifyContent : 'center',
    height: '100%',
    width: moderateScale(200),
    // backgroundColor: 'green',
    alignItems: 'center',
    flexDirection: 'row',
    gap: moderateScale(10),
    paddingLeft: moderateScale(10),
  },
  navtext: {
    fontSize: moderateScale(18),
    fontWeight: 600,
    color: '#181818',
  },
  savebox: {

    backgroundColor: colors.gwhite,
    // paddingRight : moderateScale(10),
    marginRight: moderateScale(10),
    width: moderateScale(60),
    height: moderateScale(26),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',

  },
  savetext: {
    fontSize: moderateScale(14),
    fontWeight: 600,
    textAlign: 'center',
    // color : colors.gwhite,

  },
  Scrollbody: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  imgboxout: {
    backgroundColor: colors.wblack,
    width: moderateScale(150),
    height: moderateScale(150),
    alignItems: 'center',
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    position: 'relative',
    // marginTop : moderateScale(30),
    // color : colors.gwhite,
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    backgroundColor: 'yellow',
    // width: moderateScale(300),
    // height : moderateScale(45),
    // borderRadius : moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  inputbody: {
    backgroundColor: colors.wblack,
    width: moderateScale(300),
    height: moderateScale(45),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // borderColor : 'grey',
  },
  inputval: {
    width: '95%',
  },
  filler: {
    width: '100%',
    height: moderateScale(80),
  },




  container: {
    // flex : 1,
    width: moderateScale(320),
    // height: '100%',
    // padding: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
    textAlign: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 15,
    marginBottom: 12,
    color: '#181818',
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    color: '#181818',
    // width : moderateScale(100),
  },
  picker: {
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    color: '#181818',
    borderRadius: 17,
  },
  pickstyle: {
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    color: '#181818',
    borderRadius: 17,
  },




  profileimgcontmain: {
    width: "100%",
    height: moderateScale(150),
    justifyContent: 'center',
    alignItems: "center",

    // backgroundColor: "red",


    // borderRadius : moderateScale(50),

  },
  profileimgcont: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: '#e0f7fa',
    justifyContent: 'flex-end',
    alignItems: 'center',



    // zIndex : 2,



  },
  profileimg: {
    width: moderateScale(120),
    height: moderateScale(120),
    backgroundColor: '#e0f7fa',
    borderRadius: moderateScale(60),
    zIndex: 2,
    borderWidth: 3,
    borderColor: '#fff',



  },
  profileimgcam: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(10),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: "center",
    zIndex: 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',


  },
  bg: {
    justifyContent: 'center',
    alignItems: "center",
  },
})