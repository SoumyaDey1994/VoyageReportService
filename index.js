"use strict";
require('dotenv-extended').load();
const express= require("express");
//Create Instance of Express app
const app= express();
//Importing startup actions
require('./startup/db')();
require('./startup/middleware')(app);
require('./startup/routes')(app);

//Configure PORT number
const port= process.env.PORT || 5000;
app.listen(port, ()=>console.log(`Qatar Airways Voyage Report service running at http://localhost:${port}`));