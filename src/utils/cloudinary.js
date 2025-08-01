import { v2 as cloudinary } from 'cloudinary'; 
import fs from 'fs'; // Importing the Cloudinary library and the file system module


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
 
});


const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath) {
            throw new Error("File path is required for uploading to Cloudinary");
        }
        // upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", 
        })
        console.log("File uploaded successfully", response.url);
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath); // delete the file if upload fails, removing it from the local system
        console.error("Error uploading file to Cloudinary:", error);
    }
}


export { uploadOnCloudinary };

