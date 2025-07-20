const asyncHandler = (fn) => async(req,res,next) => {
    try {
        await fn(req,res,next) //executing fn we took
    } catch (error) {
        res.status(err.code || 500).json({
            success: false, //for front end to know status
            message: err.message
        })
    }
} //high order function

export {asyncHandler}


