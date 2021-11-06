// Requiring the necessary libraries
require("dotenv").config();
const session = require("express-session");
const express = require("express");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv");
const multer = require("multer");

// creating an express server
const app = express();

// Setting up the view engine and static locations
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Connecting to 'ADP-Project' datbase
mongoose.connect("mongodb://localhost:27017/ADP-Project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Creating a database schema
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String
  },
  fname : {type : String, default : ""},

  lname : {type : String, default : ""},

  address : {type : String, default : ""},

  city : {type : String, default : ""},

  state : {type : String, default : ""},

  eaddress : {type : String, default : ""},

  phone : {type : Number, default : 0},

  inlineRadioOptions : {type : String, default : ""},

  date1 : {type : Date, default :"2000-11-11"},

  date2 : {type : Date, default :"2000-11-11"},

  reason : {type : String, default : ""},
});

// Creating a collection of Users and creating user strategy for passport
const User = mongoose.model("User", userSchema);
var uName;

///////////////////////////////////////////////////////////////////
/////////// All the access and redirect routes below////////////////
///////////////////////////////////////////////////////////////////

app.get("/", function (req, res) {
  res.render("index_login.ejs", {msg:""});
});

app.get("/otp", function(req,res){
  res.render("otp.ejs", {msg:""});
})

app.get('/reset', function(req,res){
  res.render('reset.ejs', {msg : ""});
})

app.post("/login", function (req, res) {
  uName = req.body.email;
  var pwd = req.body.password;
  const newUser = new User({
    userName: uName,
    password: pwd,
    // img : Binary(req.body.file)
  });
  User.find({ userName: uName}, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser.length == 1) {
        // res.render("form.ejs");
        if (foundUser[0].password === pwd) {
          console.log("Password matches and he will be logged in");
          res.render('viewdata.ejs', {data : foundUser[0]});
        } 
        else {
            console.log(foundUser);
          console.log("The password is a mismatch");
          res.render("index_login.ejs", {msg:"The password is incorrect!"})
        }
      } 
      else {
          newUser.save(function(err){
              if(err){
                  console.log(err);
              }
              else{
                  console.log("New User created");
              }
          });
          res.render("request.ejs")
      }
    }
  });
});

app.post('/submit', function(req, res) {
  User.findOne({userName : uName}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      foundUser.fname = req.body.fname;
      foundUser.lname = req.body.lname;
      foundUser.address = req.body.address;
      foundUser.city = req.body.city;
      foundUser.state = req.body.state;
      foundUser.eaddress = req.body.eaddress;
      foundUser.phone = req.body.phone;
      foundUser.inlineRadioOptions = req.body.inlineRadioOptions;
      foundUser.date1 = req.body.date1;
      foundUser.date2 = req.body.date2;
      foundUser.reason = req.body.reason;
      console.log("Info saved");
    }
    foundUser.save(function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Details are modified successfully");
        res.render('viewdata.ejs', {data : foundUser});
      }
    })
  })  
  // console.log(req.body);
});

var otp;
app.post("/otp", function(req,res){

  studentMail = req.body.email;
  otp = Math.round(Math.random() * 1000000);

  var msg = `
    <h3>This is your 6-digit OTP valid only for 10 minutes</h3>
    <h>${otp}</h>
  `

  User.find({userName : studentMail}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser.length === 1){
        async function main() {
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com",
          // host: "smtp.mail.yahoo.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: "piyushverma0007@outlook.com", // generated ethereal user
              // user: "piyushverma476@yahoo.com", // generated ethereal user
              pass: process.env.mailPASS, // generated ethereal password
          },
          tls:{
              rejectUnauthorized:false
          },
          });
      
          // send mail with defined transport object
          let info = await transporter.sendMail({
          from: "OAS-IITMandi"+' <piyushverma0007@outlook.com>', // sender address
          to: studentMail, // list of receivers
          subject: "Reset", // Subject line
          html: msg, // html body
          });
      
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          return res.render("reset.ejs", {msg : ""});
        }
        main().catch(console.error);
      }
      else{
        res.render("otp.ejs", {msg: "This email is not registered"});
      }
    }
  })

})

app.post("/pwdreset", function(req,res){
  const uName = req.body.email
  var genOTP = req.body.otp;
  const newPwd = req.body.new;
  const cnf = req.body.cnf;
  if(genOTP == otp){
    if(newPwd === cnf){
      User.findOne({userName : uName}, function(err, foundUser){
        if(err){
          console.log(err);
        }
        else{
          foundUser.password = newPwd;
          foundUser.save(function(err){
            if(err){
              console.log(err);
            }
            else{
              console.log("Password changed succesfully");
            }
          })
        }
      });
      res.redirect('/');
    }
    else{
      res.render("otp.ejs", {msg:"The two passwords did not match"});
    }
  }
  else{
    res.render('reset.ejs', {msg: "Invalid OTP"});
  }
})
// The server will listen on port 3000
app.listen(process.env.PORT||3000, function () {
  console.log("Server running on port 3000");
});


// 12QW#$er