//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const { check, validationResult } = require("express-validator");
const Joi = require("joi");
const { ROLE } = require('./middleware/rolelist')
const uploadFile = require("./services/upload");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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

const requestsSchema = new mongoose.Schema({
   name: String,
   status: String,
  });
const request = mongoose.model("request", requestsSchema);
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
  phone: String,
  role: {
    type: String,
    default: 'basic',
    enum: ["basic", "scout"]
  },
  height :  String,

  message : String,

  weight : String,

  nationality : String,

  foot : String,

  main_Position : String,

  pace : String,

  fullName: String,

  message : String,

   biographydescription: {
    type: String,
   },
   requests: [
     {
         request: { type: mongoose.Schema.Types.ObjectId, ref: 'request' },
       post: String,
       timeInPost: String,
   }
],
 reqs:[{
   type: String,
 }],
 accreqs :[{
   type: String,
 }],
 rejreqs:[{
   type: String,
 }],

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

const scoutReq = new mongoose.Schema({
  username: String,
  email: String,
  smessage: String,

});
const User = new mongoose.model("User", userSchema);
const Video = new mongoose.model("Video", videosSchema);
const Scout = new mongoose.model("scoutReq",scoutReq );

var loggedInUser = null;
var currentError = "";

app.get("/", function (req, res) {
  res.render("register");
});
app.get("/login", function (req, res) {
  res.render("login");
});
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
  res.render("help", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
});
app.get("/helpScout", function (req, res) {
  res.render("helpScout", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
    })
  });
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

app.get("/getmeeting", function (req, res) {
  console.log(loggedInUser.role)


  let jwtToken = null;
  if (loggedInUser.role !== ROLE.BASIC) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      username: loggedInUser.username,

    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("getmeeting", {
    token: jwtToken,
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
      reqs: loggedInUser?.reqs,
      accreqs: loggedInUser?.accreqs,
    }),
      reqs: loggedInUser.reqs,
      accreqs: loggedInUser.accreqs,
  });
  console.log(loggedInUser.reqs);
});
app.get("/requestmeeting", function (req, res) {
  console.log(loggedInUser.role)

  let jwtToken = null;
  if (loggedInUser.role !== ROLE.BASIC) {
    jwtToken = jwt.sign({
      email: loggedInUser.email,
      username: loggedInUser.username,

    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });
  }

  res.render("requestmeeting",{
    token: jwtToken,

    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
      reqs: loggedInUser?.reqs,
      accreqs: loggedInUser?.accreqs,

    }),
    reqs: loggedInUser.reqs,
    accreqs: loggedInUser.accreqs,
    
  });
  console.log(loggedInUser.reqs);
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

app.get("/ProfilePage", async (req, res) => {
  const { BlobServiceClient, logger } = require("@azure/storage-blob");
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
        message: loggedInUser?.message,
      }),
      Urls: urls,
    });

  } catch (err) {
    currentError = "Something went wrong when fetching videos."
    res.redirect("/error");
    return;
  }
});

app.get("/informationEdit", function (req, res) {
  res.render("informationEdit", {
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,

    })
  });
});
app.get("/information", function (req, res) {
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

  res.render("information", {
    token: jwtToken,
    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
      height: loggedInUser?.height,
      weight: loggedInUser?.weight,
      pace : loggedInUser?.pace,
      fullName : loggedInUser?.fullName,
      nationality : loggedInUser?.nationality,
      main_Position : loggedInUser?.main_Position,
      foot : loggedInUser?.foot,
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

app.post("/scoutSignupRequest", async (req, res) => {
  const name = req.body.sname;
  const email = req.body.semail;
  const message = req.body.smessage;
  console.log(name);
  console.log(email);
  console.log(message);

  const newReq = new Scout({
    username: name,
    email: email,
    smessage: message,

    //created_at: req.body.created_at,
  });

  await newReq.save();
  console.log("inside post funct");
  res.redirect("/login");
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

app.post("/requestmeeting",  async (req, res) => {
  const uid = req.body.username;
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  const findResult = await User.findOne({
    username: uid,

  });
  console.log(findResult);
User.findOne({ email: loggedInUser?.email }).then(async function (foundUser){
findResult.reqs.push(foundUser.username);
foundUser.reqs.push(findResult.username);

await findResult.save();
await foundUser.save();
})

console.log(findResult)

  res.redirect("/profilePageScout");

})
app.post("/help",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');

  const message = req.body.message;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.message = message;
// bak

    console.log("trying to update password");
    await foundUser.save();

    loggedInUser = foundUser;
    res.redirect("/ProfilePage");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })

})

app.post("/helpScout",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');

  const message = req.body.message;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.message = message;


    console.log("trying to update password");
    await foundUser.save();

    loggedInUser = foundUser;
    res.redirect("/ProfilePageScout");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })

})
app.post("/accept",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  const requester = req.body.requester;
  console.log(requester);
  const findResult = await User.findOne({
    username: requester,
  });
  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
  //console.log("ff");


    foundUser.accreqs.push(requester);
    findResult.accreqs.push(foundUser.username);

    foundUser.reqs.splice(requester);
    findResult.reqs.splice(foundUser.username);


     await foundUser.save();
     await findResult.save();
     console.log(foundUser);


    res.redirect("/ProfilePage");
  }).catch(function (error) {
    console.log("accept error"); // Fail
    console.log(error);
  })
})
app.post("/reject",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  const rejected = req.body.rejected;
  console.log(rejected);
  const findResult = await User.findOne({
    username: rejected,
  });
  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
  //console.log("ff");
    console.log(foundUser);
    foundUser.rejreqs.push(rejected);
    findResult.rejreqs.push(foundUser.username);

    foundUser.reqs.splice(rejected);
    findResult.reqs.splice(foundUser.username);

    await foundUser.save();
    await findResult.save();


    res.redirect("/ProfilePage");
  }).catch(function (error) {
    console.log("reject error"); // Fail
    console.log(error);
  })
})
app.post("/editProfile",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phone = req.body.phone;
  const message = req.body.message;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.username = username;
    foundUser.email = email;
    foundUser.password = password;
    foundUser.phone = phone;
    foundUser.message = message;

    console.log("trying to update password");
    await foundUser.save();


    loggedInUser = foundUser;
  //  await uploadFile(req, photoName);
  //  const newVideo = new Video({
  //    email: loggedInUser.email,
  //    video_name: photoName,
      //created_at: req.body.created_at,
  //  });
  //  await newVideo.save();
    res.redirect("/ProfilePage");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })
})
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



app.post("/informationEdit", async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phone = req.body.phone;

  const weight = req.body.weight;
    const height = req.body.height;
    const pace = req.body.pace;
    const fullName = req.body.fullName;
    const nationality = req.body.nationality;
    const main_Position = req.body.main_Position;
    const foot = req.body.foot;
  //diger
  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.username = username;
    foundUser.email = email;
    foundUser.password = password;
    foundUser.phone = phone;
    foundUser.weight = weight;
    foundUser.height = height;
    foundUser.pace = pace;
    foundUser.fullName = fullName;
    foundUser.nationality = nationality;
    foundUser.main_Position = main_Position;
    foundUser.foot = foot;

    console.log("trying to update password");
    await foundUser.save();

    loggedInUser = foundUser;

    res.redirect("/information");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })
})

//////



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
