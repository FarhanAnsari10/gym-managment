//  import {CLOUDINARY_CLOUD_NAME, CLOUDINARY_CLOUD_PRESET} from "@/constants"
// import { ResponseType } from "@/constants/types";
// import axios from 'axios'
// //  import {ResponseType} from "@/types"
 
 
//  const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

//  export const uploadFileToCloudinary = async (
//     file : {uri? : string} | string,
//     folderName: string
//  ): Promise<ResponseType> =>{
//     try {
//         if(typeof file == 'string'){
//             return {success: true,data :file};
//         }
//         if(file && file.uri){
//             const formData = new FormData();
//             formData.append("file",{
//                 uri : file?.uri,
//                 type : "image/jpeg",
//                 name : file?.uri?.split("/").pop() || "file.jpg"
//             } as any);


//             formData.append("upload_preset", CLOUDINARY_CLOUD_PRESET);
//             formData.append("folder",folderName);

//             const respone = await axios.post (CLOUDINARY_API_URL,formData,{
//                 headers:{
//                     "Content-Type": "multipart/form-data",
//                 },
//             });

//             console.log("upload image result : ", respone?.data);
//             return {success : true , data : respone?.data?.secure_url};
//         }
//         return {success:true};
//     } catch (error:any) {
//         console.log("got error uploading file: ",error);
//         return {success : false,msg: error.message || "Could nt upload file"};
        
//     }
//  }



// export const getProfileImage = (file:any) => {
//     if(file && typeof file == "string") return file;
//     if(file && typeof file == "object") return file.uri;

//     return require("../assets/images/Avatar/man3.png")
// }



// utils/uploadFileToCloudinary.ts

import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_CLOUD_PRESET } from "@/constants";
import { ResponseType } from "@/constants/types"; // make sure this is defined correctly

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string
): Promise<ResponseType> => {
  try {
    // If file is already a string (URL), return it directly
    if (typeof file === 'string') {
      return { success: true, data: file };
    }

    // If file is a local file URI
    if (file && file.uri) {
      const uriParts = file.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: `image/${fileType}`,
        name: `upload.${fileType}`,
      } as any);

      formData.append('upload_preset', CLOUDINARY_CLOUD_PRESET);
      formData.append('folder', folderName);

      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Uploaded to Cloudinary:', response.data);

      return {
        success: true,
        // data: response.data.secure_url, // Cloudinary URL
          data: response.data.secure_url, // ✅ correct
      };
    }

    return { success: false, msg: 'Invalid file object' };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error.response?.data || error.message);
    return {
      success: false,
      msg: error.message || 'Failed to upload to Cloudinary',
    };
  }
};





// utils/image.ts
export const getProfileImage = (file: any): any => {
  if (file && typeof file === 'string') return file;
  if (file && typeof file === 'object' && file.uri) return file.uri;

  return require('../assets/images/Avatar/man3.png'); // fallback image
};
