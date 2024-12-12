const db = require("../utils/connectDB");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config/config");

class authController {
    login = async (req, res) => {
        try {
            const { email, passwd } = req.body;

            if (!email || !passwd) {
                return res.status(400).json({ message: "email and passwd are required" });
            }

            const sql = `SELECT * FROM users WHERE email = ?`
            const result = await db.query(sql, [email]);

            if (result[0].length === 0) {
                return res.status(400).json({ message: "Invalid Credentials" });
            }

            const user = result[0][0];

            const isMatch = await bcrypt.compare(passwd, user.passwd);

            if (isMatch) {
                const token = jwt.sign(
                    { user_id: user.id, email: user.email, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '2m' }
                );

                const decoded = jwt.verify(token, JWT_SECRET)

                res.json({ token: token, user_id: user.id, email: user.email, role: user.role, exp: decoded.exp });
            } else {
                res.status(400).json({ message: "Invalid Credentials" });
            }
        } catch (error) {
            res.status(500).json({ error: "Unable to login", message: error.message });
        }
    };


    register = async (req, res) => {
        try {
            const { email, passwd } = req.body

            const salt = await bcrypt.genSalt(10)
            const hashedpasswd = await bcrypt.hash(passwd, salt)

            const sql = `INSERT INTO users (email, passwd) VALUES ('${email}', '${hashedpasswd}')`

            await db.query(sql)

            res.send("User created successfully")
        } catch (error) {
            res.status(500).json({ error: "Unable to register", message: error.message })
        }
    }
}

module.exports = authController