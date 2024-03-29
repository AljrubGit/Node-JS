const User = require('../models/user.model');
const bcrypt = require('bcrypt');
//jwt--> generar el token
const {
  validatePassword,
  validateEmail,
  usedEmail,
} = require('../../utils/validators');

const { generateSign } = require('../../utils/jwt');

const login = async (req, res) => {
  try {
    const userInfo = await User.findOne({ email: req.body.email });
    if (!userInfo) {
      return res.status(400).json({ message: 'El email es invalido' });
    }
    if (!bcrypt.compareSync(req.body.password, userInfo.password)) {
      return res.status(400).json({ message: 'La contraseña es incorrecta' });
    }
    // generar un token

    const token = generateSign(userInfo.id, userInfo.email);
    console.log(token);
    return res.status(200).json({ token, userInfo });
  } catch (error) {}
};

const register = async (req, res) => {
  try {
    // RegExp --> expresiones regulares,  patrones
    const newUser = new User(req.body);
    // validar la contraseña
    if (!validatePassword(newUser.password)) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    if (!validateEmail(newUser.email)) {
      return res
        .status(400)
        .json({ message: 'Email no tiene formato correcto' });
    }

    if ((await usedEmail(newUser.email)) > 0) {
      return res.status(400).json({ message: 'El email ya existe' });
    }
    newUser.password = bcrypt.hashSync(newUser.password, 10);
    const createdUser = await newUser.save();
    return res.status(200).json(createdUser);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = { login, register };
