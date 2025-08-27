import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2"


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //claudnary url
            required: true,
        },
        thumbnail: {
            type: String, //claudnary url
            required: true,
        },
        title: {
            type: String, 
            required: true,
        },
        description: {
            type: String, 
            required: true,
        },
        duration: {
            type: Number, //claudnary url
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)


videoSchema.plugin(mongooseAggregatePaginate); // Add pagination plugin to the schema, this allows us to use aggregate with pagination



export const Video = mongoose.model("Video",videoSchema)