// Requiring the necessary libraries
require("dotenv").config();
const session = require("express-session");
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

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
    type: String,
    required: true,
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
          res.render("request.ejs");
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
      }
    })
  })  
  // console.log(req.body);
});

var otp;
app.post("/reset", function(req,res){
  async function main() {
    studentMail = req.body.email;
    var otp = Math.round(Math.random() * 1000000);

    var msg = `
      <h3>This is your 6-digit OTP valid only for 10 minutes</h3>
      <h>${msg}</h>
    `
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "piyushverma0007@outlook.com", // generated ethereal user
        pass: process.env.mailPASS, // generated ethereal password
    },
    tls:{
        rejectUnauthorized:false
    },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
    // from: name+" "+email+' <piyushverma0007@outlook.com>', // sender address
    from: 'OAS-IITMandi', // sender address
    to: studentMail, // list of receivers
    subject: "Password Reset", // Subject line
    html: msg, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return res.render("/pwdreset");
  }
  main().catch(console.error);
})

app.post("/pwdreset", function(req,res){
  mail = req.body.mail;
  newPwd = req.body.new;
  cnf = req.body.cnf;
  if(newPwd === cnf){
    User.findOne({userName : mail}, function(err, foundUser){
      if(err){
        console.log(err);
      }
      else{
        foundUser.password = newPwd;
      }
    });
    res.render('/');
  }
  else{
    res.redirect("/pwdReset", {msg,msg});
  }
})
// The server will listen on port 3000
app.listen(3000, function () {
  console.log("Server running on port 3000");
});


// 12QW#$er