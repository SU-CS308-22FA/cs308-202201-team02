//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const { check, validationResult } = require("express-validator");
const Joi = require("joi");
const { ROLE } = require('./middleware/rolelist')


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var jwt = require('jsonwebtoken');
const uploadFile = require("./services/upload");

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

})


//informationSchema

const informationSchema = new mongoose.Schema({
  Name: {
    type: String,
  },
  Height: {
    type: Number,
  },
  Weight: {
    type: Number,
  },
  Nationality: {
    type: String
  },
  Foot: {
    type: String
  },
  Main_Position: {
    type: String
  },
  Pace: {
    type: Number
  }

});



//const secret = "Thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: secret},['password'] );

const User = new mongoose.model("User", userSchema);
const Video = new mongoose.model("Video", videosSchema);
const Information = new mongoose.model("information", informationSchema);


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
  res.render("UploadVideo", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    }),
  });
});

app.get("/ProfilePageScout", function (req, res) {
  console.log(loggedInUser.role)

  res.render("ProfilePageScout", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
});
app.get("/information", function (req, res) {
  let jwtToken = null;
  if (loggedInUser) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      username: loggedInUser.username
    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("information", {
    token: jwtToken,
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
});

app.get("/ProfilePage", async (req, res) => {
  const { BlobServiceClient } = require("@azure/storage-blob");
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const config = require('./config');
  const accountName = config.getStorageAccountName();

  try {
    const blobs = blobServiceClient.getContainerClient(containerName).listBlobsFlat({ prefix: loggedInUser?.email });
    const urls = [];


    for await (let blob of blobs) {
      const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blob.name}`;
      urls.push(url);
    }

    res.render('ProfilePage', {
      user: JSON.stringify({
        username: loggedInUser?.username,
        email: loggedInUser?.email,
      }),
      Urls: urls,
    });

  } catch (err) {
    currentError = "Something went wrong when fetching videos."
    res.redirect("/error");
    return;
  }
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

  });
  await newUser.save();

  res.redirect("/login");
});

const multer = require('multer');
const inMemoryStorage = multer.memoryStorage()
const uploadStrategy = multer({ storage: inMemoryStorage }).single('video_input');

app.post("/uploadVideo", uploadStrategy, async (req, res) => {
  const name = loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  await uploadFile(req, name);

  const newVideo = new Video({
    email: loggedInUser.email,
    video_name: name,
    //created_at: req.body.created_at,
  });

  await newVideo.save();
  setTimeout(() => res.redirect("/ProfilePage"), 2500);
})

//****************************************** */

app.post("/uploadPhoto", uploadStrategy, async (req, res) => {
  const ppname = 'P' + loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  await uploadFile(req, ppname);

  const newVideo = new Video({
    email: loggedInUser.email,
    video_name: ppname,
    //created_at: req.body.created_at,
  });

  await newVideo.save();
  res.redirect("/ProfilePage");
})
//****************************************** */

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
      } else if (foundUser.password === password && foundUser.role === 'scout') {
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

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.username = username;
    foundUser.email = email;
    foundUser.password = password;

    console.log("trying to update password");
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


app.post("/information", async (req, res) => {

  const newInformation = new Information({
    name: req.body.Name,
    height: req.body.Height,
    weight: req.body.Weight,
    nationality: req.body.Nationality,
    foot: req.body.Foot,
    main_Position: req.body.Main_Position,
    pace: req.body.pace
  });
  await newInformation.save();

});


//registerdan submitlenen seyi catchleriz
//name ve password name olarak görünüyor

let port = process.env.PORT;
if (port == null || port == "") {
port = 8080;
}
app.listen(port);
app.listen(3000, function () {
  console.log("server on 3000");
});
