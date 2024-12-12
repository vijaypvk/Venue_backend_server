
const express = require('express');
const cors = require('cors');
const router = require('./routes/routes'); 

const app = express();
app.use(cors());
app.use(express.json());


app.use('/', router);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
