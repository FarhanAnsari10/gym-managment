// // import { View, Text } from 'react-native'

// // import { SafeAreaView } from 'react-native-safe-area-context'

// // const profile = () => {
// //   return (
// //    <SafeAreaView>
// //       <Text>Profile</Text>
// //     </SafeAreaView>
// //   )
// // }

// // export default profile

// import React from 'react';
// import { View, Button, Alert } from 'react-native';
// import { auth } from '../../config/firebaseconfig';
// import { signOut } from 'firebase/auth';
// import { router } from 'expo-router';

// const profile = ({ navigation }) => {



// const onAgree = () => {
//     router.push("@/addplans")
//   }

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       Alert.alert('Signed Out', 'You have been signed out.');
//       navigation.replace('../(auth)/login'); // Or navigate to login screen
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }
//   };

//   return (
//     <View style={{ marginTop: 20 }}>
//       <Button title="Sign Out" onPress={handleSignOut} />
//       <Button title="add plans" onPress={onAgree} />
//     </View>
//   );
// };

// export default profile;


import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, signOut, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import placeholder from '../../assets/images/Avatar/man3.png';
import { auth, db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';
import { uploadFileToCloudinary } from '../../services/imageService';
// import { moderateScale } from '../../styles/responsiveStyles';
import { moderateScale } from 'react-native-size-matters';



export default function ProfileScreen() {
  // Loader state for holiday marking
  const [holidayLoading, setHolidayLoading] = React.useState(false);
  // ...existing code...
  // For email update modal
  // Email update modal state
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdatePassword, setEmailUpdatePassword] = useState('');
  const [emailUpdateLoading, setEmailUpdateLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [adminDoc, setAdminDoc] = useState(null);
  // Animated value for theme transition
  const themeAnim = React.useRef(new Animated.Value(0)).current;
  const user = auth.currentUser;
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const [passwordPromptVisible, setPasswordPromptVisible] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPasswordInput, setNewPasswordInput] = React.useState('');

  // Use global theme context
  const { isDarkMode, toggleTheme } = useTheme();

  // Fetch admin profile (with image) on mount
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const ref = doc(db, 'admin', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAdminDoc(snap.data());
          setImage(snap.data().imageUrl || null);
        }
      } catch (e) {
        setAdminDoc(null);
      }
    };
    fetchAdmin();
  }, []);

  // Image picker logic (from addmember)
  const uploadImage = async (mode) => {
    try {
      let result = {};
      if (mode === 'gallery') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          await saveImage(result.assets[0].uri);
        }
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          await saveImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      alert('Error uploading image: ' + error.message);
      setOpenModal(false);
    }
  };

  const saveImage = async (imgUri) => {
    try {
      setLoadingImage(true);
      setImage({ uri: imgUri });
      // Upload to Cloudinary
      const uploadRes = await uploadFileToCloudinary({ uri: imgUri }, 'admin_profile');
      if (uploadRes.success && uploadRes.data) {
        // Save to Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          await setDoc(doc(db, 'admin', uid), { ...(adminDoc || {}), imageUrl: uploadRes.data }, { merge: true });
          setImage(uploadRes.data);
        }
      } else {
        Alert.alert('Image Upload Failed', uploadRes.msg || 'Try again.');
      }
      setLoadingImage(false);
      setOpenModal(false);
    } catch (error) {
      setLoadingImage(false);
      setOpenModal(false);
      Alert.alert('Error', error.message || 'Failed to save image');
    }
  };

  const removeImage = async () => {
    try {
      setImage(null);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await setDoc(doc(db, 'admin', uid), { ...(adminDoc || {}), imageUrl: null }, { merge: true });
      }
      setOpenModal(false);
    } catch (e) {
      setOpenModal(false);
    }
  };

  // Animate theme transition
  React.useEffect(() => {
    Animated.timing(themeAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  // Animated colors for smooth transition
  const bgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#181818']
  });
  const headerColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#181818', '#fff']
  });
  const cardBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f9f9f9', '#232323']
  });
  const labelColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#444', '#ccc']
  });
  const inputBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#eee', '#222']
  });
  const inputColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#181818', '#fff']
  });
  const btnBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2196F3', '#007AFF']
  });
  const optionTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff']
  });
  const emailRowBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f0f0f0', '#232323']
  });
  const emailTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff']
  });
  const modalCardBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#232323']
  });
  const modalTitleColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#181818', '#fff']
  });

  const handleStartPasswordChange = () => {
    setShowPasswordModal(true);
  };



  const verifyCurrentPassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      setShowPasswordModal(false);
      setShowNewPasswordModal(true);
    } catch (error) {
      Alert.alert("Auth Failed", "Incorrect current password.");
    }
  };




  const handleUpdatePassword = async () => {
    try {
      await updatePassword(user, newPasswordInput);
      Alert.alert("Success", "Password changed successfully.");
      setShowNewPasswordModal(false);
      signOut(auth);
      router.replace("../login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  const handleStartEmailEdit = () => {
    setPasswordPromptVisible(true);
  };

  // Remove emailCredential logic, use password in email modal
  const verifyAdminPassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, adminPassword);
      await reauthenticateWithCredential(user, credential);
      setPasswordPromptVisible(false);
      setShowEmailModal(true);
      setAdminPassword('');
    } catch (error) {
      Alert.alert("Auth Failed", "Incorrect password. Try again.");
    }
  };

  // const handleUpdateEmail = async () => {
  //   try {
  //     console.log(newEmail);
  //     const user = auth.currentUser;
  //     await sendEmailVerification(user);
  //     await reload(user); // Refresh user state

  //     if (!user.emailVerified) {
  //       Alert.alert(
  //         "Email Not Verified",
  //         "Please verify your current email before changing it."
  //       );
  //       console.log(newEmail);
  //       await sendEmailVerification(user);
  //       return;

  // }

  //     await updateEmail(user, newEmail);
  //     // await sendEmailVerification(user);
  //         await sendEmailVerification(auth.currentUser); // Send verification to new email

  //     Alert.alert("Verification Email Sent", "Check your inbox to verify your new email.");
  //     signOut(auth);
  //     setShowEmailModal(false);
  //         router.replace('../login');

  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   }
  // };

  // Completely new email update logic
  const handleUpdateEmail = async () => {
    setEmailUpdateLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, emailUpdatePassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      const uid = user?.uid;
      if (uid) {
        await setDoc(doc(db, 'admin', uid), { ...(adminDoc || {}), email: newEmail }, { merge: true });
      }
      await sendEmailVerification(auth.currentUser);
      Alert.alert('Success', 'Email updated! Please verify your new email before logging in.');
      setShowEmailModal(false);
      setAdminDoc((prev) => ({ ...(prev || {}), email: newEmail }));
      setEmailUpdatePassword('');
      setEmailUpdateLoading(false);
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Email update error:', error);
      Alert.alert('Email Update Error', error.message || 'Error updating email.');
      setEmailUpdateLoading(false);
    }
  };





  const navigation = useNavigation();
  const [email, setEmail] = React.useState(user?.email || '');
  const [password, setPassword] = React.useState('');

  // const handleUpdateEmail = async () => {
  //   try {
  //     await updateEmail(user, email);
  //     Alert.alert('Success', 'Email updated!');
  //   } catch (error) {
  //     Alert.alert('Error', error.message);
  //   }
  // };

  const handleChangePassword = async () => {
    try {
      await updatePassword(user, password);
      Alert.alert('Success', 'Password changed!');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    router.replace('../login'); // Or wherever your login screen is
  };



  function renderPasswordVerifyModal() {
    return (
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Text style={{ fontSize: 16, color: 'grey' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Enter Current Password</Text>
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity style={styles.btn} onPress={verifyCurrentPassword}>
              <Text style={styles.btnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function renderNewPasswordModal() {
    return (
      <Modal visible={showNewPasswordModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={() => setShowNewPasswordModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Text style={{ fontSize: 16, color:isDarkMode? '#212211':'grey' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Enter New Password</Text>
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="New Password"
              value={newPasswordInput}
              onChangeText={setNewPasswordInput}
            />
            <TouchableOpacity style={styles.btn} onPress={handleUpdatePassword}>
              <Text style={styles.btnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }


  function renderModel() {
    return (
      <Modal visible={passwordPromptVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Admin Password</Text>
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="Password"
              onChangeText={setAdminPassword}
              value={adminPassword}
            />
            <TouchableOpacity style={styles.btn} onPress={verifyAdminPassword}>
              <Text style={styles.btnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    )
  }

  function renderModel1() {
    return (
      <Modal visible={showEmailModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={() => setShowEmailModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Text style={{ fontSize: 16, color: 'grey' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Update Email</Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="New Email"
              onChangeText={setNewEmail}
              value={newEmail}
            />
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="Enter your password"
              value={emailUpdatePassword}
              onChangeText={setEmailUpdatePassword}
            />
            <TouchableOpacity style={styles.btn} onPress={handleUpdateEmail} disabled={emailUpdateLoading}>
              {emailUpdateLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Update Email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}> 
      <Animated.Text style={[styles.header, { color: headerColor, alignSelf: 'center' }]}>Profile</Animated.Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { backgroundColor: cardBg }]}> 
          {/* Profile Image Section */}
          <View style={styles.avatarContainer}>
            <Image
              source={
                image && typeof image === 'object' && image.uri
                  ? { uri: image.uri }
                  : typeof image === 'string'
                  ? { uri: image }
                  : placeholder
              }
              style={[styles.avatar, { borderColor: isDarkMode ? '#232323' : '#fff', backgroundColor: isDarkMode ? '#232323' : '#e0f7fa' }]}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setOpenModal(true)}
              activeOpacity={0.7}
              style={[styles.avatarEditBtn, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#444' : '#e0e0e0' }]}
            >
              <FontAwesome name="camera" size={18} color={isDarkMode ? '#fff' : '#181818'} />
            </TouchableOpacity>
          </View>
          {loadingImage && <ActivityIndicator style={{ marginTop: 10 }} size="small" color="#2196F3" />}
          <Animated.Text style={[styles.profileName, { color: headerColor }]}>{adminDoc?.name || 'Admin'}</Animated.Text>
        </Animated.View>

        {/* Image Picker Modal */}
        <Modal visible={openModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalPickerCard, { backgroundColor: cardBg }]}> 
              <View style={styles.pickerRow}>
                <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage()} style={[styles.pickerBtn, { backgroundColor: isDarkMode ? '#232323' : '#fff' }] }>
                  <SimpleLineIcons name="camera" size={30} color={isDarkMode ? '#fff' : 'black'} />
                  <Text style={[styles.pickerBtnText, { color: isDarkMode ? '#fff' : '#181818' }]}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage('gallery')} style={[styles.pickerBtn, { backgroundColor: isDarkMode ? '#232323' : '#fff' }] }>
                  <AntDesign name="picture" size={30} color={isDarkMode ? '#fff' : 'black'} />
                  <Text style={[styles.pickerBtnText, { color: isDarkMode ? '#fff' : '#181818' }]}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.5} onPress={removeImage} style={[styles.pickerBtn, { backgroundColor: isDarkMode ? '#232323' : '#fff' }] }>
                  <AntDesign name="delete" size={30} color={isDarkMode ? '#fff' : 'black'} />
                  <Text style={[styles.pickerBtnText, { color: isDarkMode ? '#fff' : '#181818' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity activeOpacity={0.5} onPress={() => setOpenModal(false)}>
                <Text style={[styles.pickerCancel, { color: isDarkMode ? '#bbb' : 'grey' }]}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Account Section */}
        <Animated.Text style={[styles.sectionHeader, { color: labelColor }]}>Account</Animated.Text>
        <Animated.View style={[styles.emailRow, { backgroundColor: emailRowBg }]}> 
          <FontAwesome name="envelope" size={20} color={isDarkMode ? '#fff' : '#333'} />
          <Animated.Text style={[styles.emailText, { color: emailTextColor }]}>{user?.email}</Animated.Text>
          {!user?.emailVerified && (
            <>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await user.sendEmailVerification();
                    Alert.alert('Verification Email Sent', 'Please check your inbox.');
                  } catch (e) {
                    Alert.alert('Error', e.message || 'Failed to send verification email.');
                  }
                }}
                style={{ marginRight: 10 }}
                accessibilityLabel="Send verification email"
              >
                <MaterialIcons name="mark-email-unread" size={22} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await user.reload();
                    if (user.emailVerified) {
                      Alert.alert('Success', 'Your email is now verified!');
                    } else {
                      Alert.alert('Not Verified', 'Your email is still not verified. Please check your inbox and click the verification link.');
                    }
                  } catch (e) {
                    Alert.alert('Error', e.message || 'Failed to check verification.');
                  }
                }}
                style={{ marginRight: 10 }}
                accessibilityLabel="Check verification"
              >
                <MaterialIcons name="refresh" size={22} color="#007AFF" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* Settings Section */}
        <Animated.Text style={[styles.sectionHeader, { color: labelColor }]}>Settings</Animated.Text>
        <Animated.View style={[styles.settingsGroup, { backgroundColor: cardBg }]}> 
          <TouchableOpacity style={styles.option} onPress={handleStartPasswordChange}>
            <Feather name="lock" size={24} color={isDarkMode ? '#fff' : '#555'} />
            <Animated.Text style={[styles.optionText, { color: optionTextColor }]}>Change Password</Animated.Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('../addplans')}>
            {/* <FontAwesome name="cogs" size={24} color={isDarkMode ? '#fff' : '#555'} /> */}
            <Ionicons name="settings" size={24} color={isDarkMode ? '#fff' : '#555'} />
            <Animated.Text style={[styles.optionText, { color: optionTextColor }]}>Plan Configuration</Animated.Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.option, {  borderRadius: 8, marginVertical: 8, opacity: holidayLoading ? 0.7 : 1 }]}
            disabled={holidayLoading}
            onPress={async () => {
              Alert.alert(
                'Mark Holiday',
                'Are you sure you want to mark today as a holiday for all members? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                      setHolidayLoading(true);
                      try {
                        const adminId = auth.currentUser?.uid;
                        if (!adminId) throw new Error('No admin user');
                        const membersColRef = require('firebase/firestore').collection(db, 'admin', adminId, 'members');
                        const membersSnap = await require('firebase/firestore').getDocs(membersColRef);
                        const today = new Date();
                        const yyyy = today.getFullYear();
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const dd = String(today.getDate()).padStart(2, '0');
                        const todayStr = `${yyyy}-${mm}-${dd}`;
                        for (const memberDoc of membersSnap.docs) {
                          const memberId = memberDoc.id;
                          const attRef = require('firebase/firestore').doc(db, 'admin', adminId, 'members', memberId, 'attendance', todayStr);
                          await setDoc(attRef, { status: 'holiday', markedAt: new Date() }, { merge: true });
                        }
                        setHolidayLoading(false);
                        Alert.alert('Success', 'Marked holiday for all members today.');
                      } catch (e) {
                        setHolidayLoading(false);
                        Alert.alert('Error', e.message || 'Failed to mark holiday.');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <MaterialIcons name="holiday-village" size={24} color ={ isDarkMode ? '#fff' : '#555'} />
            <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#555' }]}>Mark Holiday for Today{holidayLoading ? ' (Loading...)' : ''}</Text>
            {holidayLoading && <ActivityIndicator size="small" color="#333" style={{ marginLeft: 10 }} />}
          </TouchableOpacity>
        </Animated.View>

        {/* Theme Toggle */}
        <View style={styles.themeRow}>
          <Animated.Text style={{ color: headerColor, fontSize: 16, marginRight: 8 }}>Dark Mode</Animated.Text>
          <TouchableOpacity
            style={[styles.themeToggle, isDarkMode ? styles.themeToggleActive : null]}
            activeOpacity={0.8}
            onPress={toggleTheme}
          >
            <Animated.View
              style={[styles.themeToggleThumb, isDarkMode ? styles.themeToggleThumbActive : null]}
            >
              {isDarkMode ? (
                <Ionicons name="moon" size={18} color="#fff" />
              ) : (
                <Ionicons name="sunny" size={18} color="#FFD600" />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
  
        {/* Logout */}
        <Animated.View style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#2d1818' : '#fff0f0' }]}> 
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="red" />
            <Animated.Text style={[styles.optionText, { color: 'red' }]}>Logout</Animated.Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={{height:moderateScale(120)}}></View>
        {renderModel()}
        {renderModel1()}
        {renderPasswordVerifyModal()}
        {renderNewPasswordModal()}
      </ScrollView>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    paddingVertical: 2,
    // shadow for iOS/Android
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
    marginVertical: 0,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 18,
    paddingVertical: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#e0f7fa',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
    alignSelf: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  emailText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
  },
  themeToggle: {
    width: 54,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  themeToggleActive: {
    backgroundColor: '#232323',
    borderColor: '#444',
    justifyContent: 'flex-end',
  },
  themeToggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  themeToggleThumbActive: {
    backgroundColor: '#181818',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#fff0f0',
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    margin: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },

  themeToggle: {
    width: 54,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  themeToggleActive: {
    backgroundColor: '#232323',
    borderColor: '#444',
    justifyContent: 'flex-end',
  },
  themeToggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  themeToggleThumbActive: {
    backgroundColor: '#181818',
  },

  // Modal for image picker
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalPickerCard: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: 170,
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
  pickerRow: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  pickerBtn: {
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  pickerBtnText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  pickerCancel: {
    width: 80,
    textAlign: 'center',
    fontSize: 15,
    color: 'grey',
    marginTop: 8,
  },
});
