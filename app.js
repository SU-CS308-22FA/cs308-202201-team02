//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const {check, validationResult} = require("express-validator");
const Joi = require("joi");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const urlencodedParser = bodyParser.urlencoded({extended: false})
const url = `mongodb+srv://bengisutepe:EFqoy3lDdvVodrPE@cluster0.emaofpz.mongodb.net/?retryWrites=true&w=majority`;

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect("mongodb+srv://bengisutepe:EFqoy3lDdvVodrPE@cluster0.emaofpz.mongodb.net/?retryWrites=true&w=majority",connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })
//SCHEMA
const userSchema = new mongoose.Schema({
  username:{
    type: String,
    min:3,
    unique: true,
    required: [true,"Please check your data entry, no name specified"],

  },
    email: {
      type: String,
      min:3,
      unique: true,
      required: [true,"Please check your data entry, no email specified"],
    },
    password: {
      type: String,
      min:3,
      unique: true,
      required: [true,"Please check your data entry, no password specified"],
    },


});
//const secret = "Thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: secret},['password'] );

const User = new mongoose.model("User",userSchema);


app.get("/",function(req, res)
{
  res.render("register");
});
app.get("/login",function(req, res)
{
  res.render("login");
});

app.get("/editprofile",function(req, res)
{
  res.render("editprofile");
});

app.get("/ProfilePage",function(req, res)
{
  res.render("ProfilePage");
});


//POST
app.post("/register",async(req,res)=>{
  console.log("inside post funct");
  const newUser= new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  await newUser.save();
  
   res.redirect("/ProfilePage");

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
        res.redirect("/ProfilePage");

      }
   }
  })
})



//registerdan submitlenen seyi catchleriz
//name ve password name olarak görünüyor

//let port = process.env.PORT;
//if (port == null || port == "") {
//  port = 3000;
//}
//app.listen(port);
app.listen(3000, function(){
  console.log("server on 3000");
});
