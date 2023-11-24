const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const multer =require('multer')
var bodyParser = require('body-parser')
 
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('/Public'))


const storage = multer.diskStorage({
    destination:function(req,file,cb) {
        return cb(null, "./Public/files")

    },
    filename: function (req,file,cb) {
        console.log('file came',file)
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({storage})
app.post('/uploadresume',upload.array('file'),(req, res) =>{

  console.log(req.body)
  //console.log(req.file)
}) 




const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "saijyothi@123",
    database: "newdigitalexamination4"
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to the database");
    }
});

// User registration endpoint
app.post('/signup',upload.array('file'), (req, res) => {
    // console.log('body',req.body)
    console.log('file',req.file)
    const { name, email, password, qualification, uploadresume } = req.body;
    //console.log(storage)
        

    //Check if the email address is already in use
    const checkEmailQuery = "SELECT * FROM signup WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log(result)
        if (result.length !== 0) {
            return res.status(400).json({ error: 'Email address is already in use' });
        }
        else{
        // If the email is not in use, insert the new user into the database
        const sql = "INSERT INTO signup(name, email, password, qualification, uploadresume) VALUES (?, ?, ?, ?, ?)";
        const values = [name, email, password, qualification, uploadresume];

        db.query(sql, values, (insertErr, data) => {
            if (insertErr) {
                console.error("Database insertion error:", insertErr);
                return res.status(500).json({ error: 'Error in user registration' });
            } else {
                console.log('User registered successfully');
                return res.json(data);
            }
        });
    }
    });
});

// User login endpoint
app.post('/login', (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;

    // Query the database to check the user's credentials
    const sql = "SELECT * FROM signup WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, data) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (data.length > 0) {
            return res.json("Success"); // Successful login
        } else {
            console.log("Login failed for email:", email);
            return res.status(401).json("Failed"); // Failed login
        }
    });
    // res.send('from signup')
});

app.listen(8081, () => {
    console.log("Server is running on port 8081");
});
