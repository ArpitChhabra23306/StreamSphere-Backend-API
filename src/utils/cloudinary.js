import { v2 as cloudinary } from 'cloudinary'; 
import fs from 'fs'; // Importing the Cloudinary library and the file system module


cloudinary.config({ 
    cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
    api_key: 'process.env.CLOUDINARY_API_KEY', 
    api_secret: 'process.env.CLOUDINARY_API_SECRET' 
});


const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath) {
            throw new Error("File path is required for uploading to Cloudinary");
        }

        // upload the file to Cloudinary
        cloudinary.uploader.upload(filePath)
    } catch (error) {
        
    }
}


cloudinary.v2.uploader.upload("dog.mp4", {
  resource_type: "auto", 
  public_id: "my_dog",
  overwrite: true, 
  notification_url: "https://mysite.example.com/notify_endpoint"})
.then(result=>console.log(result));

