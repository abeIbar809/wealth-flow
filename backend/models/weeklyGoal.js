import mongoose from "mongoose"

const weeklyGoalSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    weekStartDate: { 
        type: Date, 
        required: true 
    },
    goals: [{
        category: { type: String, required: true },
        limit: { type: Number, required: true },
        spent: { type: Number, default: 0 }
    }],
    totalLimit: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
});

var weeklyGoal = mongoose.model('weeklyGoal', weeklyGoalSchema);
export default weeklyGoal;