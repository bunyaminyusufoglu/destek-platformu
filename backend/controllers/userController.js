import User from "../models/User.js";

// Kayıt endpoint
export const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    const newUser = new User({ name, email });
    await newUser.save();

    res.status(201).json({ message: "Kullanıcı kaydedildi", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
