// const express = require('express')
// const Router = express.Router
// const db = require("../utils/dbconnection")
// const router = Router()

// router.route('/venues')
//     .get(async (req, res) => {
//         const query = "SELECT * FROM venues"
//         const result = await db.query(query)
//         console.log(result)
//         res.json({ venues: result[0] })

//     })
//     .post(async (req, res) => {
//         try {
//             // Destructure venue data from the request body
//             const { name, type, location, capacity, projector, ac, micAndSpeaker, photo } = req.body;

//             // Insert query
//             const query = `
//                 INSERT INTO venues (name, type, location, capacity, projector, ac, micAndSpeaker, photo)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             // Execute the query with provided data
//             const [result] = await db.query(query, [name, type, location, capacity, projector, ac, micAndSpeaker, photo]);

//             console.log('Insert result:', result);
//             res.status(201).json({ message: 'Venue added successfully', id: result.insertId });
//         } catch (error) {
//             console.error('Error adding venue:', error);
//             res.status(500).json({ message: 'An error occurred while adding the venue' });
//         }
//     })
//     ;
// router.route('/staffpage')
//     .get(async (req, res) => {
//         const query = "SELECT * FROM staffdetails"
//         const result = await db.query(query)
//         console.log(result)
//         res.json({ staffdetails: result[0] })

//     });

// router.route('/venues/:id')
//     .delete(async (req, res) => {
//         try {
//             const { id } = req.params; // Extract ID from URL
//             const query = "DELETE FROM venues WHERE id = ?";
//             const [result] = await db.query(query, [id]);

//             if (result.affectedRows === 0) {
//                 // No rows were deleted, meaning ID does not exist
//                 return res.status(404).json({ message: "Venue not found" });
//             }
//             console.log("ID to delete:", id);
//             console.log("Delete result:", result);

//             res.json({ message: "Venue deleted successfully" });
//         } catch (error) {
//             console.error("Error during deletion:", error);
//             res.status(500).json({ message: "An error occurred while deleting the venue" });
//         }
//     });




// module.exports = router
const express = require('express');
const Router = express.Router;
const db = require("../utils/dbconnection");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = Router();

// Configure multer to store the uploaded file in a specific folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads'); // Use absolute path to the uploads folder
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the uploads directory exists
        }
        cb(null, uploadDir); // Set the destination folder
    },
    filename: (req, file, cb) => {
        // Use the original file name and append a timestamp to avoid naming conflicts
        const fileName = Date.now() + path.extname(file.originalname); // Append timestamp to the filename
        cb(null, fileName); // Set the filename for the uploaded file
    }
});

// Set up multer with disk storage
const upload = multer({ storage: storage }).single('photo');

// Serve static files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Correct the path

// Get all venues
router.route('/venues')
    .get(async (req, res) => {
        const query = "SELECT * FROM venues";
        try {
            const result = await db.query(query); // Query the database for all venues
            // Add the server's base URL to the photo path
            const venuesWithPhotoUrl = result[0].map((venue) => ({
                ...venue,
                photo: venue.photo ? `http://localhost:8000${venue.photo}` : null // Full URL for photo
            }));
            res.json({ venues: venuesWithPhotoUrl }); // Send the venues with full photo URL
        } catch (error) {
            console.error("Error fetching venues:", error);
            res.status(500).json({ message: "An error occurred while fetching venues" });
        }
    });

// Add a new venue with photo
router.route('/venues')
    .post(upload, async (req, res) => {
        try {
            const { name, type, location, capacity, projector, ac, micAndSpeaker } = req.body;

            // Check if a photo was uploaded
            const photo = req.file ? `/uploads/${req.file.filename}` : null; // Save the path of the uploaded photo in the database

            // If a photo is required, send a response error if no photo is uploaded
            if (!photo) {
                return res.status(400).json({ message: 'Photo is required.' });
            }

            // Convert 'Yes' to 1 and 'No' to 0
            const projectorValue = projector === "Yes" ? 1 : 0;
            const acValue = ac === "Yes" ? 1 : 0;
            const micAndSpeakerValue = micAndSpeaker === "Yes" ? 1 : 0;

            // Insert the new venue into the database
            const query = `
                INSERT INTO venues (name, type, location, capacity, projector, ac, micAndSpeaker, photo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db.query(query, [
                name, type, location, capacity, projectorValue, acValue, micAndSpeakerValue, photo
            ]);

            // Send a success response with the new venue's ID and photo path
            res.status(201).json({ message: 'Venue added successfully', id: result.insertId, photo: photo });
        } catch (error) {
            console.error('Error adding venue:', error);
            res.status(500).json({ message: 'An error occurred while adding the venue' });
        }
    });

// Delete a venue by ID
router.route('/venues/:id')
    .delete(async (req, res) => {
        try {
            const { id } = req.params; // Extract the venue ID from the request parameters
            const query = "DELETE FROM venues WHERE id = ?";
            const [result] = await db.query(query, [id]);

            if (result.affectedRows === 0) {
                // If no rows were deleted, the venue doesn't exist
                return res.status(404).json({ message: "Venue not found" });
            }

            res.json({ message: "Venue deleted successfully" });
        } catch (error) {
            console.error("Error during deletion:", error);
            res.status(500).json({ message: "An error occurred while deleting the venue" });
        }
    });
router.route('/staffpage')
    .get(async (req, res) => {
        const query = "SELECT * FROM staffdetails"
        const result = await db.query(query)
        console.log(result)
        res.json({ staffdetails: result[0] })

    });
module.exports = router;
