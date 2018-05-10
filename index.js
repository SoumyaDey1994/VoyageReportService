"use strict";
const express= require("express");
const mongoose= require('mongoose');
mongoose.Promise= require("bluebird");  // To handle the mongoose promise deprecation
const joi= require('joi');

const analyzeReport= require('./reportAnalysis');
const dbOperation= require('./dbOperations');

//connect to MongoDb database on MLAB
mongoose.connect(`mongodb://admin:${encodeURIComponent('super@admin')}@ds014578.mlab.com:14578/voyage_report`)
        .then(()=> console.log("Scccessfully Connected to MongoDB Server of mLAB..."))
        .catch((error)=> console.log("Cannot connect to MongoDB Server of mLAB...", error));

//Create Instance of Express app
const app= express();
//Parse request and response object as JSON
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const port= process.env.PORT || 5000;

//statement object schema 
const statementSchema=joi.object().keys({
    statementNo: joi.number().required(),
    statement: joi.string().required()
})

//schema to validate user submitted report
const submittedJourneyReportSchema={
    report: joi.array().items(statementSchema).min(1).required()
}

//Get request to resource http://localhost:5000
app.get('/', (req, res)=>{
    res.sendFile('public/index.html', {root: __dirname});
});

//GET the Current Voyagwe Report from DB
app.get('/api/journeyReports', (req, res)=>{
    // call to database and fetch voyage report
    dbOperation.getAllReports(res);
});

//GET the specific Report from DB
app.get('/api/journeyReports/:id', (req, res)=>{
    let reportId= req.params.id;
    dbOperation.getParticularReport(res, reportId);
});

//POST the commander record to DB
app.post('/api/journeyReports', (req, res)=>{
    // Fetching only the report obj from request body
    let report= [];
    let requestBody = req.body;
    let validationResult= joi.validate(requestBody, submittedJourneyReportSchema)
    if(validationResult.error)
        return res.status(400).send("Error: "+validationResult.error.details[0].message);
    else{
        report= requestBody.report;
        analyzeReport.getAllStatementsFromReport(report, res);
    }
});

app.listen(port, ()=>console.log(`Qatar Airways PoC has been started at http://localhost:${port}`));