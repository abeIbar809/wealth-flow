import WeeklyGoal from './../models/weeklyGoal.js'

const getWeeklyGoals = async (req, res) => {
    const { userId } = req.params;
    try {
        const goals = await WeeklyGoal.find({ userId });
        res.status(200).json(goals);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getCurrentWeekGoals = async (req, res) => {
    const { userId } = req.params;
    try {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const goals = await WeeklyGoal.findOne({ 
            userId, 
            weekStartDate: { $gte: startOfWeek } 
        });
        res.status(200).json(goals);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createWeeklyGoal = async (req, res) => {
    const weeklyGoal = new WeeklyGoal(req.body);
    try {
        await weeklyGoal.save();
        res.status(201).json(weeklyGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateWeeklyGoal = async (req, res) => {
    const { id } = req.params;
    try {
        const goal = await WeeklyGoal.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteWeeklyGoal = async (req, res) => {
    const { id } = req.params;
    try {
        await WeeklyGoal.findByIdAndDelete(id);
        res.status(204).json({ message: "Weekly goal deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export default { getWeeklyGoals, getCurrentWeekGoals, createWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal };