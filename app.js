//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");


const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/tl_userDB");

const userSchema = {
  username: String,
  email: String,
  password: String,
  password2: String,
}

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
    password2: req.body.password2,
  });
  newUser.save(function(err){
    if(err){
        console.log(err);
    }
    else{
      res.send("successfull")
    }
  });
});
//registerdan submitlenen seyi catchleriz
//name ve password name olarak görünüyor


app.listen(3000, function(){
  console.log("server on 3000");
});
