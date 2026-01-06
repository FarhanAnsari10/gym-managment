import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid, TextInput, Image, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebaseconfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { userDetailContext } from '../../context/userDetailContext';
import { useRouter } from 'expo-router';



import { SafeAreaView } from 'react-native-safe-area-context'
import { moderateScale } from 'react-native-size-matters';
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Foundation from '@expo/vector-icons/Foundation';
import colors from '@/assets/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
//import { Colors } from 'react-native/Libraries/NewAppScreen';
import firebase from 'firebase/compat/app';
// import { ActivityIndicator } from 'react-native-web';


const SignIn = () => {





  const router = useRouter();
  const [issecure, setIsSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const onAgree = () => {
    router.push("/signUp")
  }

  const { userDetail, setUserDetail } = useContext(userDetailContext); // ✅ Proper destructuring

  // ✅ Initialize states to avoid `undefined`
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');


  //ResetPassword
  const changepassword = () => {
    if (!email) {
      ToastAndroid.show('Please enter your email above first.', ToastAndroid.LONG);
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        ToastAndroid.show('Password reset email sent. Check your inbox.', ToastAndroid.LONG);
      })
      .catch((error) => {
        ToastAndroid.show(error.message || 'Error sending reset email.', ToastAndroid.LONG);
      });
  }

  // const onSignInClick = async () => {
  //   setLoading(true)
  //   try {
  //     // if()
  //     const resp = await signInWithEmailAndPassword(auth, email, password);
  //     const user = resp.user;
  //     if (!user.emailVerified) {
  //       ToastAndroid.show('Please verify your email before logging in.', ToastAndroid.LONG);
  //       await signOut(auth); // Sign out the user if not verified
  //       return;
  //     }else{
  //     console.log(user);

  //     // ✅ Get user details BEFORE navigation
  //     await getUserDetail(user.email);
  //     // ✅ Navigate after setting user details
  //     router.replace('/(tabs)/home');
  //   }
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);

  //     console.log(error);
  //     ToastAndroid.show('Incorrect Email or Password', ToastAndroid.BOTTOM);
  //   }
  // };


  const onSignInClick = async () => {
    setLoading(true);
    try {
      const resp = await signInWithEmailAndPassword(auth, email, password);
      let user = resp.user;

      // 🔄 Force Firebase to refresh user data
      await user.reload();
      user = auth.currentUser; // Get the latest user info

      console.log("Email Verified:", user.emailVerified); // Debugging step
      //  await saveUser(user);
      if (!user.emailVerified) {
        ToastAndroid.show('Please verify your email before logging in.', ToastAndroid.LONG);
        // await signOut(auth); // Sign out the user if not verified
        await signOut(auth)
          .then(() => {
            console.log("User signed out successfully");
          })
          .catch((signOutError) => {
            console.error("Error signing out:", signOutError);
          });
        setLoading(false);
        // ✅ Redirect to Sign-In Page instead of Home
        router.replace('/(auth)/login');
        return;
      }

      console.log("User is verified:", user.emailVerified);

      // ✅ Get user details BEFORE navigation
      await getUserDetail(user.email);

      // ✅ Navigate after setting user details
      router.replace('/(tabs)/home');

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      ToastAndroid.show('Incorrect Email or Password', ToastAndroid.BOTTOM);
    }
  };






  const getUserDetail = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId); // ✅ Use `user.uid` instead of email
      const result = await getDoc(userRef);
      if (result.exists()) {
        console.log(result.data());
        setUserDetail(result.data());
      } else {
        console.log('No user data found');
      }
    } catch (error) {

      console.log('Error fetching user data:', error);

    }
  };






  const saveUser = async (user) => {
    const data = {
      name: setName('Arif Iqubal'),
      email: email,
      member: false,
      uid: user?.uid,
    };

    // ✅ Use UID as Firestore document ID
    await setDoc(doc(db, 'users', user?.uid), data);
    setUserDetail(data);
  };


  return (
    // <View>
    //   <TextInput
    //     placeholder="Email"
    //     value={email}
    //     onChangeText={(value) => setEmail(value)}
    //   />
    //   <TextInput
    //     placeholder="Password"
    //     value={password}
    //     onChangeText={(value) => setPassword(value)}
    //     secureTextEntry
    //   />
    //   <TouchableOpacity onPress={onSignInClick}>
    //     <Text>Sign In</Text>
    //   </TouchableOpacity>
    // </View>
    //   );
    // };



    <SafeAreaView style={styles.main}>
      <View style={styles.header}>
        <View style={styles.loginimg}>
          <Image source={require("@/assets/images/Password2.png")} style={styles.pasimg} resizeMode="contain" />

        </View>

      </View >
      <View style={styles.body}>
        <View style={styles.logintextbox}><Text style={styles.logintext}>Hey<Text style={styles.gogreen}>, </Text>
          Welc<Text style={styles.gogreen}>o</Text>me<Text style={styles.gogreen}> back!</Text></Text></View>
        <View style={styles.userpasbox}>


          <View style={styles.username}>
            <Fontisto name="email" size={24} color="black" style={styles.mailicon} />
            <TextInput
              style={styles.temp}
              placeholder='Email'
              keyboardType='email-address'
              onChangeText={(value) => setEmail(value)}
            // value={emai}

            // value={email}
            // placeholderTextColor={''}

            />
          </View>

          <View style={styles.password}>
            <Foundation name="key" size={24} color="black" style={styles.keyicon} />
            <TextInput
              style={styles.temp}
              placeholder='Password'
              secureTextEntry={issecure}
              onChangeText={(value) => setPassword(value)}

            //  value={password}
            //  keyboardType='password'

            //  value={password}
            />

            <TouchableOpacity onPress={() => {
              setIsSecure((prev) => !prev)
            }}>
              {issecure ? <MaterialCommunityIcons name="eye" size={24} color="grey" /> : <MaterialCommunityIcons name="eye-off" size={24} color="grey" />}
            </TouchableOpacity>

          </View>
          <TouchableOpacity onPress={changepassword} style={styles.forgetpassword}><Text style={styles.ftextpassword}>Forget Password? </Text></TouchableOpacity>


        </View>
      </View>
      <View style={styles.footer}>
        <View ><TouchableOpacity disabled={loading} activeOpacity={0.8} style={styles.loginbutton} onPress={onSignInClick}>{!loading ? <Text style={styles.loginb}>Login</Text> :
          <ActivityIndicator size={'large'} color={'#666'} />
          // <Text>Loading..</Text>
        }</TouchableOpacity></View>
        {/* <View style={styles.ortextbox}><Text style={styles.ortext}>Or</Text></View> */}
        {/* <View ><TouchableOpacity activeOpacity={0.5} style={styles.congoogle}>
          <Ionicons name="logo-google" size={24} color="black" />
          <Text style={styles.cgoogletext} >Google</Text></TouchableOpacity>
        </View> */}

      </View>
      <View style={styles.signupmainbox}><View style={styles.signupbox}><TouchableOpacity activeOpacity={0.5} onPress={onAgree}><Text style={styles.signuptext}>Don't have an account? <Text style={styles.signupminitext}>Create Now</Text></Text></TouchableOpacity>
      </View></View>


    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  main: {
    // flex : 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    // flex : 3,
    // backgroundColor : 'blue',
    height: moderateScale(250),
    justifyContent: "center",
    alignItems: 'center',
  },
  loginimg: {
    // flex : 1,
    width: moderateScale(180),
    height: moderateScale(180),
    borderRadius: moderateScale(250),


  },
  pasimg: {
    // flex : 1,
    // backgroundColor : colors.pgreen,
    width: moderateScale(180),
    height: moderateScale(180),
    borderRadius: moderateScale(200),


  },
  body: {
    // flex : 3,
    height: moderateScale(230),
    gap: 10,
    // backgroundColor : 'white',
  },

  logintextbox: {
    // flex : 2,
    //  backgroundColor : 'green',
    height: moderateScale(50),
    justifyContent: 'center',
    //  alignItems : 'center',
    paddingLeft: moderateScale(30),
    // flexDirection : 'row',
    // gap : 40


  },
  logintext: {
    // flex : 1,
    //  backgroundColor : 'green',
    //  height : moderateScale(50),
    //  justifyContent :'center',
    // width : moderateScale(50),
    fontSize: moderateScale(25),
    fontWeight: 600,
    paddingLeft: 10


  },
  userpasbox: {
    // flex : 1,
    // height : moderateScale(100),
    // backgroundColor : 'grey',
    alignItems: 'center',
    gap: 20,
    justifyContent: "space-evenly",

  },

  username: {
    // flex : 1,
    borderRadius: moderateScale(30),
    height: moderateScale(45),
    width: moderateScale(300),
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    paddingLeft: 25,
    paddingRight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden'

  },
  password: {
    // flex : 1,
    borderRadius: moderateScale(30),
    height: moderateScale(45),
    width: moderateScale(300),
    backgroundColor: 'white',
    // borderWidth: 1,

    justifyContent: 'flex-start',
    paddingLeft: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 55,
    gap: 10

  },
  forgetpassword: {
    // flex : 1,
    // justifyContent : 'flex-start',
    alignItems: 'center'
  },
  ftextpassword: {
    // flex : 1,
    // justifyContent : 'flex-start',
    color: colors.mblack

  },


  footer: {
    // flex : 4,
    // backgroundColor : 'red',
    height: moderateScale(220),
    // justifyContent : 'space-evenly',
    gap: 15,

    alignItems: 'center',
  },


  loginbutton: {
    backgroundColor: '#24a0ed',
    borderRadius: moderateScale(30),
    // height : moderateScale(45),
    width: moderateScale(250),
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: "center"

  },
  loginb: {
    // backgroundColor : 'yellow',
    color: 'black',
    borderRadius: moderateScale(30),
    // height : moderateScale(45),
    // width : moderateScale(250),
    fontWeight: 600,
    fontSize: moderateScale(15)

  },
  congoogle: {
    borderWidth: 1,
    width: moderateScale(250),
    borderRadius: 200,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    // fontWeight : 200
    // backgroundColor : 'yellow',
  },
  cgoogletext: {
    // borderRadius : moderateScale(30),
    // height : moderateScale(45),
    // width : moderateScale(250),
    fontWeight: 600,
    fontSize: moderateScale(16)
  },
  ortextbox: {
    borderRadius: moderateScale(30),
    // height : moderateScale(45),
    width: moderateScale(250),
    // backgroundColor : 'yellow',
    justifyContent: "center",
    alignItems: 'center',
  },
  ortext: {
    borderRadius: moderateScale(30),
    // backgroundColor : 'yellow',
    textAlign: 'center',
    fontSize: moderateScale(15),
    fontWeight: 600,
  },
  signupbox: {

    borderRadius: moderateScale(30),
    height: moderateScale(45),
    width: moderateScale(250),
    // justifyContent : 'center',
    // alignItems : 'center'

    // backgroundColor : 'yellow',
  },
  signupmainbox: {

    borderRadius: moderateScale(30),
    height: moderateScale(45),
    // width : moderateScale(350),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: moderateScale(25),

    // backgroundColor : 'yellow',
  },
  signuptext: {
    fontSize: moderateScale(12),
    textAlign: "center",
    color: "grey",
  },
  signupminitext: {
    fontWeight: 700,
    fontSize: moderateScale(13),
    color: '#0000EE'
  },
  temp: {
    // fontWeight : 500,
    fontSize: moderateScale(13),
    color: 'black',
    paddingLeft: moderateScale(10),
    // backgroundColor : 'yellow',
    width: moderateScale(200)
    // textAlign : "center",

  },
  mailicon: {
    color: 'grey'
  },
  keyicon: {
    color: 'grey'
  },
  gogreen: {
    color: colors.pgreen
  }
})


export default SignIn;
