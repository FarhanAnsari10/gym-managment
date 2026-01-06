import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import Foundation from '@expo/vector-icons/Foundation';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Formik } from 'formik';
import { useContext, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import * as Yup from 'yup';
import { auth, db } from '../../config/firebaseconfig';
import { userDetailContext } from '../../context/userDetailContext';
import colors from './../../assets/colors';
// import React from 'react';
// import { styles } from './signUp copy';


const SignUp = () => {


 const SignupSchema = Yup.object().shape({
    name: Yup.string()
      .min(4, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Enter Your full name'),
    
    email: Yup.string()
    .email('Invalid email')
    .required('please enter your email'),
    password: Yup.string()
    .min(6,'must contain minimum 6 characters')
    .required('please enter your password'),
    confirmpassword: Yup.string()
    .min(6,'must contain minimum 6 characters')
    .oneOf([Yup.ref('password')],'Password do not match.')
    .required('Confirm password required.'),
  });

  
  const router = useRouter();
  const [loading,setLoading] = useState(false);

  // Secure password fields
  const [issecure1, setIsSecure1] = useState(true);
  const [issecure2, setIsSecure2] = useState(true);

  // User input state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get user context
  const { userDetail, setUserDetail } = useContext(userDetailContext);

  // Sign-up function
  // const createNewAccount = async () => {
  //   setLoading(true)
  //   try {
  //     const resp = await createUserWithEmailAndPassword(auth, email, password);
  //     const user = resp.user;
  //     console.log(user);

  //     await saveUser(user);
  //     setLoading(false);
  //     router.replace('/(tabs)/home'); // Navigate after saving user
  //   } catch (error) {
  //     setLoading(false);
  //     console.log(error.message);
  //     alert(error.message);
  //     ToastAndroid.show('Incorrect Email or Password', ToastAndroid.BOTTOM);
  //   }
  // };



  const createNewAccount = async () => {
    setLoading(true);
    try {
      const resp = await createUserWithEmailAndPassword(auth, email, password);
      const user = resp.user;
      console.log(user);

      // Send email verification
      await sendEmailVerification(auth.currentUser);
      alert('Verification email sent. Please verify your email.');
      await saveUser(user);
      await signOut(auth);
      setLoading(false);

      // Navigate to login page (ensure correct path and case)
      router.replace('/(auth)/login');
    } catch (error) {
      setLoading(false);
      console.log(error.message);
      alert(error.message);
      ToastAndroid.show('Error creating account. Try again.', ToastAndroid.BOTTOM);
    }
  };
  

  


  // Save user to Firestore
  const saveUser = async (user) => {
    const data = {
      name: name,
      email: email,
      member: false,
      uid: user?.uid,
    };

    // ✅ Use UID as Firestore document ID
    await setDoc(doc(db, 'admin', user?.uid), data);
    setUserDetail(data);
  };

  return (
    <SafeAreaView style={styles.main}>
       <Formik initialValues={{
              name : '',
              email : '',
              password : '',
              confirmpassword : '',
            }}
            validationSchema={SignupSchema}
            >
              {({values,errors,touched,handleChange,setFieldTouched,isValid,handlesubmit}) => (


      <><View style={styles.logintextbox}>
            <Text style={styles.logintext}>
              Create<Text style={styles.gogreen}> New </Text>Account
            </Text>
            {/* <Text style={styles.gogreen}>Find Your Perfect Room – Sign Up Now!</Text> */}
          </View><View style={styles.body}>
              <View style={styles.userpasbox}>
                <View style={styles.username}>
                  <Feather name="user" size={24} color="black" style={styles.mailicon} />
                  <TextInput
                    style={styles.temp}
                    placeholder="Enter Your Name"
                    // onChangeText={(value) => setName(value)} 
                    value={values.name} // Controlled by Formik
                    onChangeText={(text) => {
                      handleChange("name")(text); // Updates Formik state
                      setName(text); // Updates local state
                    }}
                    onBlur={() => setFieldTouched('name')} // Mark field as touched

                    />
                </View>
                    {touched.name && errors.name && <Text style={styles.namerror}>{errors.name}</Text>}

                <View style={styles.username}>
                  <Fontisto name="email" size={24} color="black" style={styles.mailicon} />
                  <TextInput
                    style={styles.temp}
                    placeholder="Email"
                    keyboardType="email-address"
                    // onChangeText={(value) => setEmail(value)}
                    value={values.email} // Controlled by Formik
                    onChangeText={(text) => {
                      handleChange("email")(text); // Updates Formik state
                      setEmail(text); // Updates local state
                    }}
                    onBlur={() => setFieldTouched('email')} // Mark field as touched

                     />
                </View>
                {touched.email && errors.email && <Text style={styles.namerror}>{errors.email}</Text>}

                <View style={styles.password}>
                  <Foundation name="key" size={24} color="black" style={styles.keyicon} />
                  <TextInput
                    style={styles.temp}
                    placeholder="Password"
                    secureTextEntry={issecure1}
                    // onChangeText={(value) => setPassword(value)}
                    value={values.password} // Controlled by Formik
                    onChangeText={(text) => {
                      handleChange("password")(text); // Updates Formik state
                      setPassword(text); // Updates local state
                    }}
                    onBlur={() => setFieldTouched('password')} // Mark field as touched

                     />
                  <TouchableOpacity onPress={() => setIsSecure1((prev) => !prev)}>
                    {issecure1 ? (
                      <MaterialCommunityIcons name="eye" size={24} color="grey" />
                    ) : (
                      <MaterialCommunityIcons name="eye-off" size={24} color="grey" />
                    )}
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && <Text style={styles.namerror}>{errors.password}</Text>}

                <View style={styles.password}>
                  <Foundation name="key" size={24} color="black" style={styles.keyicon} />
                  <TextInput
                    style={styles.temp}
                    placeholder="Confirm Password"
                    secureTextEntry={issecure2} 
                    value={values.confirmpassword} // Controlled by Formik
                    onChangeText={(text) => {
                      handleChange("confirmpassword")(text); // Updates Formik state
                      // setPassword(text); // Updates local state
                    }}
                    onBlur={() => setFieldTouched('confirmpassword')} // Mark field as touched

                    
                    />
                  <TouchableOpacity onPress={() => setIsSecure2((prev) => !prev)}>
                    {issecure2 ? (
                      <MaterialCommunityIcons name="eye" size={24} color="grey" />
                    ) : (
                      <MaterialCommunityIcons name="eye-off" size={24} color="grey" />
                    )}
                  </TouchableOpacity>
                </View>
                 {touched.confirmpassword && errors.confirmpassword && <Text style={styles.namerror}>{errors.confirmpassword}</Text>}
                      

              {/* </View> */}
            </View><View style={styles.footer}>
              <TouchableOpacity disabled={!isValid} activeOpacity={0.8} style={styles.loginbutton}onPress={createNewAccount}>
                {!loading ? <Text style={styles.loginb}>Get Started</Text> :
                  <ActivityIndicator size={'large'} color={colors.cwhite} />
                  // <Text>Loading..</Text>
                }


              </TouchableOpacity>

              {/* <View style={styles.ortextbox}>
                <Text style={styles.ortext}>Or</Text>
              </View>

              <TouchableOpacity activeOpacity={0.5} style={styles.congoogle}>
                <Ionicons name="logo-google" size={24} color="black" />
                <Text style={styles.cgoogletext}>Google</Text>
              </TouchableOpacity> */}

              {/* <View style={styles.signupbox}>
                <TouchableOpacity activeOpacity={0.5} onPress={() => router.push('/auth/signIn')}>
                  <Text style={styles.signuptext}>
                    Already have an account? <Text style={styles.signupminitext}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View> */}
              </View>
            </View></>
         )}
            </Formik>
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
main : {
  // flex : 1,
  backgroundColor : '#f0f0f0',
  gap: 20
},
header : {
  // flex : 3,
  // backgroundColor : 'blue',
  height : moderateScale(250),
  justifyContent: "center",
  alignItems : 'center',
},
loginimg : {
  // flex : 1,
  width : moderateScale(180),
  height : moderateScale(180),
  borderRadius : moderateScale(250),
  
  
},
pasimg : {
  // flex : 1,
  // backgroundColor : colors.pgreen,
  width : moderateScale(180),
  height : moderateScale(180),
  borderRadius: moderateScale(200),
 
  
},
body : {
  // flex : 3,
  height : moderateScale(220),
  gap : 20,
  // backgroundColor : 'white',
},

logintextbox : {
  // flex : 2,
 backgroundColor : colors.fgreen,
 height : moderateScale(180),
 justifyContent :'center',
//  alignItems : 'center',
paddingLeft : moderateScale(30),
// flexDirection : 'row',
// gap : 40
borderBottomLeftRadius : 20,
borderBottomRightRadius : 20,
 
  
},
logintext : {
  // flex : 1,
//  backgroundColor : 'green',
//  height : moderateScale(50),
//  justifyContent :'center',
// width : moderateScale(50),
fontSize : moderateScale(25),
fontWeight : 600,
paddingLeft : 10
 
  
},
userpasbox : {
  // flex : 1,
  // height : moderateScale(100),
  // backgroundColor : 'grey',
  alignItems : 'center',
  gap: 20,
  justifyContent : "space-evenly",
  
},

username : {
  // flex : 1,
  borderRadius : moderateScale(30),
  height : moderateScale(45),
  width : moderateScale(300),
  backgroundColor : 'white',
  justifyContent : 'flex-start',
  paddingLeft : 25,
  flexDirection : 'row',
  alignItems : 'center',
  gap : 10
  
},
password : {
  // flex : 1,
  borderRadius : moderateScale(30),
  height : moderateScale(45),
  width : moderateScale(300),
  backgroundColor : 'white',
  justifyContent : 'flex-start',
  paddingLeft : 25,
   flexDirection : 'row',
  alignItems : 'center',
  gap : 10
  
},
temp: {
  // backgroundColor : "yellow",
  // flex: 1
  width : moderateScale(200),
  // paddingRight : 4
  // borderRadius : 100
},

footer : {
  // flex : 4,
  // backgroundColor : 'red',
  height : moderateScale(300),
  justifyContent : 'space-evenly',
  alignItems : 'center',
},


loginbutton : {
  backgroundColor : '#24a0ed',
  borderRadius : moderateScale(30),
  // height : moderateScale(45),
  width : moderateScale(250),
  paddingVertical : 15,
  justifyContent : 'center',
  alignItems : "center"
  
},
loginb : {
  // backgroundColor : 'yellow',
  color : 'black',
  borderRadius : moderateScale(30),
  // height : moderateScale(45),
  // width : moderateScale(250),
  fontWeight : 600,
  fontSize : moderateScale(15)
  
},
congoogle : {
  borderWidth : 1,
  width : moderateScale(250),
  borderRadius : 200,
  paddingVertical : 12,
  justifyContent : 'center',
  alignItems : 'center',
  flexDirection : 'row',
  gap : 10,
  // fontWeight : 200
  // backgroundColor : 'yellow',
},
cgoogletext : {
  // borderRadius : moderateScale(30),
  // height : moderateScale(45),
  // width : moderateScale(250),
  fontWeight: 600,
  fontSize : moderateScale(16)
},
ortextbox : {
  borderRadius : moderateScale(30),
  // height : moderateScale(45),
  width : moderateScale(250),
  // backgroundColor : 'yellow',
  justifyContent : "center",
  alignItems : 'center',
},
ortext : {
  borderRadius : moderateScale(30),
  // backgroundColor : 'yellow',
  textAlign : 'center',
  fontSize : moderateScale(15),
  fontWeight : 600,
},
signupbox : {
  
  borderRadius : moderateScale(30),
  height : moderateScale(45),
  width : moderateScale(250),
  
  // backgroundColor : 'yellow',
},
signuptext : {
fontSize : moderateScale(12),
textAlign : "center",
color : 'grey'
},
signupminitext : {
fontWeight : 700,
fontSize : moderateScale(13),
color : '#0000EE'
},
// temp : {
//   // fontWeight : 500,
//   fontSize : moderateScale(13),
//   color : 'black',
//   paddingLeft : moderateScale(10),
//   backgroundColor : 'white'
//   // textAlign : "center",

//   },
mailicon : {
  color : 'grey'
},
keyicon : {
  color : 'grey'
},
gogreen : {
  // color : colors.pgreen
  color : '#3a1c71'
}, namerror: {
  color : 'red',
  textAlign : 'right',
  width : moderateScale(280),
  // color: '#f9f9f9',
  // backgroundColor : 'black'
  
}
})


export default SignUp;