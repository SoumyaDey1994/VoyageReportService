const express= require("express");
const helmet= require("helmet");
const bodyParser= require('body-parser')
const compression= require("compression");
const mongoose= require('mongoose');

// To handle the mongoose promise deprecation
mongoose.Promise= require("bluebird");

mongoose.connect(`mongodb://admin:${encodeURIComponent('super@admin')}@ds014578.mlab.com:14578/voyage_report`)
        .then(()=> console.log("Scccessfully Connected to MongoDB Server of MLAB..."))
        .catch((error)=> console.log("Cannot connect to MongoDB Server of MLAB...", error));

const app= express();
// app.use(bodyParser, {urlEncoded: true});
app.use(express.json());

const port= process.env.PORT || 3000;

const reportSchema={
    reportType: String,
    report: Array
}
const Report= mongoose.model('Report', reportSchema);
const REPORT_ID='5ae07c084a2c99340418b258';

//Get request to resource http://localhost:3000
app.get('/', (req, res)=>{
    res.send("Welcome to our API");
});

//GET the Current Voyagwe Report from DB
app.get('/api/journeyReports', (req, res)=>{
    // call to database and fetch voyage report
   getReport(res);
});

//POST the commander record to DB
app.post('/api/journeyReports', (req, res)=>{
    // Fetching only the report obj from request body
    let bodyObj = req.body.report;
    queryAndUpdateCourse(bodyObj, res);
});

//Fetch Report from MongoDB
async function getReport(res, reportId){
    // let report= await Report.findById(reportId);
    let report= await Report.find({});
    if(!report)
        return null;
    console.log(`Fetched Report: ${report}`)
    res.status(200).send(report);
}

//query and course and then update the properties
async function queryAndUpdateCourse(reqBody, res){
    const updatedRecord = await Report.findByIdAndUpdate(
                            {_id:REPORT_ID},
                            {
                                $set: {
                                    report: reqBody // Report updated here
                                },
                            
                            }, {
                                new: true
                            });
    res.status(200).send(updatedRecord);
}

app.listen(port, ()=>console.log(`Server running on http://localhost:${port}`))

//Create a Report
// async function createReport(res, reportObj){
//     let reportObject= new Report({
//         reportType: "Voyage Report",
//         report: reportObj
//     })  
//   let resultObj= await reportObject.save();
//   console.log(`Created Report: ${resultObj}`)
//     res.status(200).send(resultObj);
// }