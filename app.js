//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const {check, validationResult} = require("express-validator");



const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

const urlencodedParser = bodyParser.urlencoded({extended: false})

mongoose.connect("mongodb://localhost:27017/tl_userDB");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,

});
const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, {secret: secret},['password'] );

const User = new mongoose.model("User",userSchema);




app.get("/",function(req, res)
{
  res.render("register");
});
app.get("/login",function(req, res)
{
  res.render("login");
});
app.post("/register",function(req,res){
  const newUser= new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,

  });
  newUser.save(function(err){
    if(err){
        console.log(err);
    }
    else{
      res.json(req.body);
    }
  });
});

app.post("/login",function(req,res)
{
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email : email}, function(err, foundUser){
    if (err){
      console.log(err);
    }else{
      if (foundUser.password === password) {
        res.send("logged in");
      }
   }
  })
})



//registerdan submitlenen seyi catchleriz
//name ve password name olarak görünüyor


app.listen(3000, function(){
  console.log("server on 3000");
});
