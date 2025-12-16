import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String, 
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
});

//simple password comparison (testing - need hashing potentially)
userSchema.methods.comparePassword = function(candidatePassword) {
    return this.password === candidatePassword;
};

var user = mongoose.model('user', userSchema);
export default user;