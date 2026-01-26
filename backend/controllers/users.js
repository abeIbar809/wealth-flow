import User from './../models/user.js' 

const getUser = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

const getSpecUser = async (req, res) => {
    const email = req.params.email;
    try {
        const user = await User.findOne({email: email});
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

const createUser = async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

const updateUser = async (req, res) => {
    const email = req.params.email;
    try {
        const user = await User.findOneAndUpdate({email: email}, req.body, {new: true});
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

const deleteUser = async (req, res) => {
    const email = req.params.email;
    try {
        const user = await User.findOneAndDelete({email: email});
        res.status(204).json({message: "User deleted"});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        //find user by email
        const user = await User.findOne({ email: email });
        
        //if user doesn't exist
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        //password comparison
        const isMatch = user.comparePassword(password);
        
        //if password is wrong
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
        
        res.status(200).json({ user: userResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {getUser, getSpecUser, createUser, updateUser, deleteUser, loginUser};