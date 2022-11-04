//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const {check, validationResult} = require("express-validator");

const app = express();
app.use(cookieParser());

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
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekey.",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.get('/', function(req, res){
  res.redirect('/register')
})

app.get('/login', function(req, res) {
  if(req.session.username && req.session.password){
    res.render('userprofile',{ username: req.session.username, email: req.session.email, password: req.session.password })
  }else{
    res.render('login');
  }
  // res.send('recibido');

});
app.get('/register', function(req, res) {
  if(req.session){
    console.log(req.session);
  }
  res.render('register');
});

app.get('/ProfilePage', function(req, res){
  console.log("req session userprofile" + req.session);
  if(req.session.username){
    console.log("session exists");
    res.render('userprofile',{ username: req.session.username, email: req.session.email, password: req.session.password })
  }else{
    res.redirect('/login')
  }
})


//burdan sildin 3.09


//POST
//POST REQUESTS
app.post('/login', function(req, res) {
  console.log("req session login" + req.session);

  User.findOne({
    email: req.body.email
  }).then(
    (user) => {
      console.log(user);

      if(user.password == req.body.password){
        req.session.email = req.body.email
        req.session.password = req.body.password
        res.redirect("/ProfilePage")

      }else{
        res.send("Wrong Password");
      }
    }
  ).catch(
    (error) => {
      res.send("email is wrong!")
    }
  );


});


app.post('/register', function(req, res) {
  console.log(req.body);

  const userInstance = new User(
  {
    username: req.body.username,
    password : req.body.password,
    email: req.body.email
  });

  User.findOne({
    email: req.body.email
  }).then((user) => {
    res.render("register", {errorMsg: "Email already exits"})

   }).catch(
    userInstance.save((err) => {
      if (err) {
        console.log(err);
        res.send("error")
      }else{
        res.redirect("/login")
      }
    })
  );


});

//burdan sildin 3.11



//registerdan submitlenen seyi catchleriz
//name ve password name olarak görünüyor
//let port = process.env.PORT;
//if (port == null || port == "") {
  //port = 3000;
//}
//app.listen(port);
app.listen(3000, function(){
  console.log("server on 3000");
});
