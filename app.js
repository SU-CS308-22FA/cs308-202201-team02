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
const axios = require('axios');
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
     rate: {
     type: Number,
     default:0,
    },

    rate_count: {
     type: Number,
     default:0,
    },
    overall_rate: {
     type: Number,
     default:0,
     $round: [ "$overallrate", 2 ]
    },
    age : String,

    club: String,

    scoutposition : String,

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
  like_count: {
    type: Number,
    min: 0,
    default: 0,
    // required: [true, "Please check your data entry, no name specified"],
  },

})

//const secret = "Thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: secret},['password'] );
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
app.get('/profilep',async(req,res,next)=>{
  const searchField = req.query.username;
  const uid = req.body.username;
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  const findResult = await User.findOne({
    username: searchField,
  });
  const { BlobServiceClient } = require("@azure/storage-blob");
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const config = require('./config');
  const accountName = config.getStorageAccountName();
  const urls = [];
  try {
    const blobs = blobServiceClient.getContainerClient(containerName).listBlobsFlat({ prefix: findResult.email });
    const urls = [];


    for await (let blob of blobs) {
      const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blob.name}`;
      urls.push(url);
    }
    console.log(findResult);
      let jwtToken = null;

      jwtToken = jwt.sign({
        email: findResult.email,
        username: findResult.username,
        }, "mohit_pandey_1996", {
          expiresIn: 300000
        });

      User.find({username:{$regex: searchField,$options: '$i'}})
        .then(data=>{
          res.render("profilep", {
            token: jwtToken,

         user: JSON.stringify({
          username: findResult.username,
          email: findResult.email,
          bio: findResult.message,
          role: findResult.role,

          overall_rate: findResult.overall_rate,
        }),
        Urls: urls,
      //  reqs: data.reqs,
      })
    //    res.send(data);
        console.log(req.query);
    //  res.render('profilep', { title: 'profile', user: data,  });
        })



  } catch (err) {
    currentError = "User not exist."
    res.redirect("/error");
    return;
  }

})



app.get('/informationp',async(req,res,next)=>{
  const searchField = req.query.username;
  const uid = req.body.username;
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');
  const findResult = await User.findOne({
    username: searchField,
  });

  try {

    console.log(findResult);
      let jwtToken = null;

      jwtToken = jwt.sign({
        email: findResult.email,
        username: findResult.username,
        }, "mohit_pandey_1996", {
          expiresIn: 300000
        });

      User.find({username:{$regex: searchField,$options: '$i'}})
        .then(data=>{
          res.render("informationp", {
            token: jwtToken,

         user: JSON.stringify({
          username: findResult.username,
          email: findResult.email,
          bio: findResult.message,
          height : findResult.height,
          weight : findResult.weight,
          nationality : findResult.nationality,
          foot : findResult.foot,
          main_Position : findResult.main_Position,
          pace : findResult.pace,
          fullName: findResult.fullName,
          overall_rate: findResult.overall_rate,
        }),

      //  reqs: data.reqs,
      })
    //    res.send(data);
        console.log(req.query);
    //  res.render('profilep', { title: 'profile', user: data,  });
        })



  } catch (err) {
    currentError = "User not exist."
    res.redirect("/error");
    return;
  }

})

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
exports.homeRoutes = (req, res) => {
    // Make a get request to /api/users
    axios.get('http://localhost:3000/api/users')
        .then(function(response){
            res.render('index', { users : response.data });
        })
        .catch(err =>{
            res.send(err);
        })


}
app.get("/ranking", (req, res) => {


User.find({}, (err, tasks) => {

  for(var i = 0; i < tasks.length; i++) {
        for(var j=i+1; j < tasks.length; j++) {
            if(tasks[i].overall_rate < tasks[j].overall_rate) {
                var temp = tasks[i];
                tasks[i] = tasks[j];
                tasks[j] = temp;
            }
        }
    }
  res.render("ranking.ejs", { User: tasks });

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
    }),
      reqs: loggedInUser.reqs,
  });
  console.log(loggedInUser.reqs);
});
app.get("/requestmeeting", function (req, res) {
  console.log(loggedInUser.role)


  let jwtToken = null;

    jwtToken = jwt.sign({
      email: loggedInUser.email,
      username: loggedInUser.username
    }, "mohit_pandey_1996", {
      expiresIn: 300000
    });


  res.render("requestmeeting",{
    token: jwtToken,

    user: JSON.stringify({
      username: loggedInUser?.username,
      email: loggedInUser?.email,
      reqs: loggedInUser?.reqs,
    }),
    reqs: loggedInUser.reqs,


  });
  console.log(loggedInUser.reqs);
});

app.get("/homePage", async (req, res) => {
  const allUrls = [];
  const filterByLikes = req.query.filterByLikes;

  let databaseVideos = [];
  if (filterByLikes) {
    databaseVideos = await Video.find({
      like_count: { $gt: filterByLikes }
    });
  } else {
    databaseVideos = await Video.find();
  }

  const { BlobServiceClient } = require("@azure/storage-blob");
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const config = require('./config');
  const accountName = config.getStorageAccountName();

  try {
    for await (let video of databaseVideos) {
      console.log('vid:');
      console.log(JSON.stringify(video));

      const url = `https://${accountName}.blob.core.windows.net/${containerName}/${video.video_name}`;
      const email = video.video_name.split('_')[0];
      const user = await User.findOne({ email });
      if (!user) {
        currentError = "Something went wrong when fetching videos."
        res.redirect("/error");
        return;
      }
      allUrls.push({
        key: user?.username,
        value: url,
        video_name: video.video_name,
        like_count: video?.like_count ?? 0,
      });
    }

    res.render('homePage', {
      user: JSON.stringify({
        username: loggedInUser?.username,
        email: loggedInUser?.email,
      }),
      allUrls: allUrls,
    });
  } catch (err) {
    currentError = "Something went wrong when fetching videos in the home page."
    res.redirect("/error");
    return;
  }
});

app.get("/homePageScout", async (req, res) => {
  const allUrls = [];

  const { BlobServiceClient } = require("@azure/storage-blob");
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const config = require('./config');
  const accountName = config.getStorageAccountName();

  try {
    const blobs = blobServiceClient.getContainerClient(containerName).listBlobsFlat();
    for await (let blob of blobs) {
      const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blob.name}`;

      const email = blob.name.split('_')[0];
      const user = await User.findOne({ email });
      if (!user) {
        currentError = "Something went wrong when fetching videos."
        res.redirect("/error");
        return;
      }

      const video = await Video.findOne({ video_name: blob.name });
      allUrls.push({
        key: user?.username,
        value: url,
        video_name: blob.name,
      });
      console.log(allUrls[0]);
    }

    res.render('homePageScout', {
      user: JSON.stringify({
        username: loggedInUser?.username,
        email: loggedInUser?.email,
      }),
      allUrls: allUrls,
    });
  } catch (err) {
    currentError = "Something went wrong when fetching videos in the home page."
    res.redirect("/error");
    return;
  }
});

/**
 	 * Save the like of the video of the user in an async approach after defining
 	 * With the help of the condition the we checked wheter video ok or not.
 	 * If not (!) redirected error.
	 * After return the if the like count equals null or undefined video like count defined as 1 else video like count incereas 1.
	 * Redirected to homePage after all.
 	 */

app.get("/likeVideo", async function (req, res) {
  const video = await Video.findOne({video_name: req.query.video_name});
  if (!video) {
    currentError = "Something went wrong when liking video in the home page."
    res.redirect("/error");
    return;
  }

  video.like_count = (video.like_count === null || video.like_count === undefined) ? 1 : video.like_count + 1;
  await video.save();

  res.redirect("/homePage");
  return;
});

/**
 	 * Save the rate of the user in an async approach after defining.
   * Check whether rate null or undefined.
   * After add rate and rate score for the total rate.
   * Increment rate count by 1 for every click.
   * Calculate overall rate with rate divided by rate count.
	 * Redirected to homePage after all.
 	 */

app.get("/rateVideo", async function (req, res) {
  console.log("---");

  const user = await User.findOne({username: req.query.username});
  if (!user) {
    currentError = "Something went wrong when rating video in the home page."
    res.redirect("/error");
    return;
  }

  user.rate = (user.rate === null || user.rate === undefined) ? 0 : Number(user.rate) + Number(req.query.rate_score);
  user.rate_count = (user.rate_count === null || user.rate_count === undefined) ? 0 : Number(user.rate_count) + 1;

  user.overall_rate= (user.rate === null || user.rate === undefined) ? 0 : Number(user.rate)/ Number(user.rate_count);

  await user.save();

  res.redirect("/homePageScout");
  return;
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
  const { BlobServiceClient } = require("@azure/storage-blob");
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const config = require('./config');
  const accountName = config.getStorageAccountName();
  const urls = [];
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
        bio: loggedInUser?.message,

        overall_rate: loggedInUser?.overall_rate,

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

findResult.save();
foundUser.save();
})

console.log(findResult)

  res.redirect("/ProfilePageScout");

})





app.post("/help",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');

  const message = req.body.message;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.message = message;


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

app.post("/editProfile",  async (req, res) => {
  //const photoName = 'P'+loggedInUser.email + '_' + Math.random().toString().replace(/0\./, '');

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phone = req.body.phone;

  User.findOne({ email: loggedInUser?.email }).then(async function (foundUser) {
    console.log("ff");
    console.log(foundUser);
    foundUser.username = username;
    foundUser.email = email;
    foundUser.password = password;
    foundUser.phone = phone;


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
  //  await uploadFile(req, photoName);
  //  const newVideo = new Video({
  //    email: loggedInUser.email,
  //    video_name: photoName,
      //created_at: req.body.created_at,
  //  });
  //  await newVideo.save();
    res.redirect("/information");
  }).catch(function (error) {
    console.log("EDIT error"); // Fail
    console.log(error);
  })
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
