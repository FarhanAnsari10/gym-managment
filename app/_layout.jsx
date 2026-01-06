// 



import { Stack } from "expo-router";
// import {userDetailContext} from './../context/userDetailContext'
// import { useState } from "react";

// export default function RootLayout() {

//   const [userDetail,setUserDetail]= useState();
//   return (
//   <userDetailContext.Provider value={{userDetail,setUserDetail}}>
//   <Stack screenOptions={{headerShown:false,animation :"ios_from_right",gestureDirection : "horizontal"}}/>
//   </userDetailContext.Provider>
//   )
// }


import { userDetailContext } from './../context/userDetailContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useState } from "react";

export default function RootLayout() {
  const [userDetail, setUserDetail] = useState();

  return (
    <ThemeProvider>
      <userDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <Stack screenOptions={{ headerShown: false, animation: "ios_from_right", gestureDirection: "horizontal" }} />
      </userDetailContext.Provider>
    </ThemeProvider>
  );
}
