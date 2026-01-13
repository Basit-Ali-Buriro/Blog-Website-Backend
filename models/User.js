import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";


const userSchema = mongoose.Schema({
    username : {type: String, required : true, unique : true, trim : true, minlength : 3, maxlength : 30},
    email : {type : String, required : true, unique : true, validate: [validator.isEmail, 'Please provide a valid email']},
    password : {type : String, required : true, minlength : 6, select: false},
    profilePic : {type : String, default : ''},
    bio : {type : String, maxlength : 500, default : ''},
    role : {type : String, enum : ['user', 'admin'], default : 'user'}
}, {
    timestamps : true   
})

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
