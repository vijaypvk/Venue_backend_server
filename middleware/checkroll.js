const db = require("../utils/dbconnection");
const jwt = require("jsonwebtoken");

// Middleware to check user roles
const checkRole = (requiredRoles) => async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access token required" });

        // Verify token and decode user info
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        if (!email) return res.status(401).json({ message: "Invalid token" });

        // Check user's role in the database
        const query = "SELECT role FROM staffdetails WHERE email = ?";
        const [result] = await db.query(query, [email]);
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const userRole = result[0].role;

        // Check if user's role is allowed
        if (!requiredRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Attach user info to the request object
        req.user = { email, role: userRole };
        next();
    } catch (error) {
        console.error("Role check error:", error.message);
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = checkRole;
