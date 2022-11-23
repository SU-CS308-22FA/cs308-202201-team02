//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const { check, validationResult } = require("express-validator");
const Joi = require("joi");
const {ROLE} = require('./middleware/rolelist')

var jwt = require('jsonwebtoken');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const urlencodedParser = bodyParser.urlencoded({ extended: false })
const url = `mongodb+srv://bengisutepe:EFqoy3lDdvVodrPE@cluster0.emaofpz.mongodb.net/?retryWrites=true&w=majority`;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect("mongodb+srv://bengisutepe:EFqoy3lDdvVodrPE@cluster0.emaofpz.mongodb.net/?retryWrites=true&w=majority", connectionParams)
  .then(() => {
    console.log('Connected to the database ')
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  })


//SCHEMAS


//User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    min: 3,
    unique: true,
    required: [true, "Please check your data entry, no name specified"],

  },
  email: {
    type: String,
    min: 3,
    unique: true,
    required: [true, "Please check your data entry, no email specified"],
  },
  password: {
    type: String,
    min: 3,
    required: [true, "Please check your data entry, no password specified"],
  },
  role: {
    type: String,
    default: 'basic',
    enum: ["basic", "scout"]
   },

   biographydescription: {
    type: String,
   },

});

//Videos schema
const videosSchema = new mongoose.Schema({
  email: {
    type: String,
    min: 3,
    //required: [true, "Please check your data entry, no email specified"],
  },

  video_name: {
    type: String,
    min: 3,
    required: [true, "Please check your data entry, no name specified"],
  },

  /*
  created_at: {
    type: Date,
    min: 3,
    default: Date.now,
  },
  */

  location_url: {
    type: String,
    min: 3,
    required: [true, "Please specify your videos url, no url specified"],
  },

})



//const secret = "Thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: secret},['password'] );

const User = new mongoose.model("User", userSchema);
const Video = new mongoose.model("Video", videosSchema);



var loggedInUser = null;
var currentError = "";

app.get("/", function (req, res) {
  res.render("register");
});
app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/editprofile", function (req, res) {
  res.render("editprofile", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
});
app.get("/editprofileScout", function (req, res) {
  res.render("editprofileScout", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
      biographydescription: loggedInUser?.biographydescription,
    })
  });
});
app.get("/help", function (req, res) {
  res.render("help");
});
app.get("/helpScout", function (req, res) {
  res.render("helpScout");
});

app.get("/scoutSignupRequest", function (req, res) {
  res.render("scoutSignupRequest");
});

app.get("/error", function (req, res) {
  res.render("error", {
    error: currentError
  });
});

app.get("/UploadVideo", function (req, res) {
  let jwtToken = null;
  
  if (loggedInUser) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      video_name: loggedInUser.video_name,
      location_url: loggedInUser.location_url
    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("UploadVideo", {
    token: jwtToken,
    user: JSON.stringify({
      email: loggedInUser?.email,
      video_name: loggedInUser?.video_name,
      location_url: loggedInUser?.location_url,

    })
  });
});

app.get("/ProfilePage", function (req, res) {
  console.log(loggedInUser.role)
  let jwtToken = null;
  if (loggedInUser.role !== ROLE.SCOUT) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      username: loggedInUser.username
    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("ProfilePage", {
    token: jwtToken,
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
});

app.get("/ProfilePageScout", function (req, res) {
  console.log(loggedInUser.role)
  let jwtToken = null;
  if (loggedInUser.role !== ROLE.BASIC) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      username: loggedInUser.username
    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("ProfilePageScout", {
    token: jwtToken,
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
      biographydescription: loggedInUser?.biographydescription,
    })
  });
});



app.get("/ProfilePage", function (req, res) {
  let jwtToken = null;
  if (loggedInUser) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      video_name: loggedInUser.username
    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("ProfilePage", {
    token: jwtToken,
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
});


//POST
app.post("/register", async (req, res) => {
  console.log("inside post funct");
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    currentError = "this email is already on the system."
    res.redirect("/error");
    return;
  }

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    biographydescription: req.body.biographydescription,
    
  });
  await newUser.save();

  res.redirect("/login");
});

app.post("/uploadVideo", async (req, res) => {
  const existingUser = await Video.findOne({ email: req.body.email });

 
  const newVideo = new Video({
    email: loggedInUser.email,
    video_name: req.body.video_name,
    //created_at: req.body.created_at,
    location_url: req.body.location_url
  });

  await newVideo.save();
  res.redirect("/ProfilePage");

})

app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then(function (foundUser) {
    if (!foundUser) {
      currentError = "no user with this email."
      res.redirect("/error");
    } else {
      if (foundUser.password === password && foundUser.role === 'basic') {
        loggedInUser = foundUser;
        res.redirect("/ProfilePage");
      } else if (foundUser.password === password && foundUser.role === 'scout'){
        loggedInUser = foundUser;
        res.redirect("/ProfilePageScout");
      } else {
        currentError = "incorrect password"
        res.redirect("/error");
      }
    }
  }).catch(function (e) {
    currentError = "login error."
    res.redirect("/error");
  })
})

app.post("/editProfile", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.username = username;
    foundUser.email = email;
    foundUser.password = password;

    console.log("trying to update password");
    await foundUser.save();

    loggedInUser = foundUser;
    res.redirect("/ProfilePage");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })
})
app.post("/editProfileScout", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const biographydescription = req.body.biographydescription;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.username = username;
    foundUser.email = email;
    foundUser.password = password;
    foundUser.biographydescription = biographydescription;

    await foundUser.save();

    loggedInUser = foundUser;
    res.redirect("/ProfilePageScout");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })
})

app.get("/logout", function (req, res) {
  loggedInUser = null;
  res.redirect("/login");
})

app.get("/deleteUser", function (req, res) {
  User.deleteOne({ email: loggedInUser?.email }).then(function () {
    console.log("User deleted");
    loggedInUser = null;
    res.redirect("/login");

  }).catch(function (error) {
    console.log(error); // Failure
  });
})






//registerdan submitlenen seyi catchleriz
//name ve password name olarak görünüyor

//let port = process.env.PORT;
//if (port == null || port == "") {
 //port = 3000;
//}
//app.listen(port);
app.listen(3000, function () {
  console.log("server on 3000");
});
