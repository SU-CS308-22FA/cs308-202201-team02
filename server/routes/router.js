const express = require('express');
const route = express.Router();
const services = require('../services/render');


//const controller = require("../controller/controller")
const bcrypt = require('bcrypt');
const saltRounds = 10;
route.get("/",services.homeRoutes);
route.get("/login",services.login);
route.get("/editprofile",services.editprofile);
route.get("/ProfilePage",services.ProfilePage);




module.exports= route;
