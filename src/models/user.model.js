import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //perfomance decrease but helps in searching
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //claudnary url
        },
        coverImage: {
            type: String, //claudnary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)


userSchema.pre("save", async function(next) {
    if (this.isModified("password")){       // If password is not modified, skip hashing
        this.password = await bcrypt.hash(this.password, 10);       // Hash the password before saving the user
        next()
    } else {
        next()       // If password is not modified, just proceed to the next middleware      
    }    
})        // Hash password before saving user, pre does your work/func just before doing the task(here data saving)

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password); // Compare the provided password with the hashed password
}    


userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { //sign method is used to generate token
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET, //secret key
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        } 

    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { //sign method is used to generate token
            _id: this._id,
        },
        process.env. REFRESH_TOKEN_SECRET, //secret key
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        } 

    )
}



export const User = mongoose.model("User",userSchema)