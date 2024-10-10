const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  // Check if user exists
  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, password: await bcrypt.hash(password, 10) });
    await user.save();
  }

  // Sign JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  res.json({ token });
};


exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    user = new User({
      username,
      password: hashedPassword
    });

    // Save the user to the database
    await user.save();

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Return token and user info
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};