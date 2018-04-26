const express= require("express");
const mongoose= require('mongoose');
mongoose.Promise= require("bluebird");  // To handle the mongoose promise deprecation
const joi= require('joi');

//connect to MongoDb database on MLAB
mongoose.connect(`mongodb://admin:${encodeURIComponent('super@admin')}@ds014578.mlab.com:14578/voyage_report`)
        .then(()=> console.log("Scccessfully Connected to MongoDB Server of MLAB..."))
        .catch((error)=> console.log("Cannot connect to MongoDB Server of MLAB...", error));

//Create Instance of Express app
const app= express();
//Parse request and response object as JSON
app.use(express.json());

const port= process.env.PORT || 3000;

//statement object schema 
const statementSchema=joi.object().keys({
    statementNo: joi.number().required(),
    statement: joi.string().required()
})

//schema to validate user submitted report
const submittedJourneyReportSchema={
    report: joi.array().items(statementSchema).min(1).required()
}
//Schema to store journey report to MongoDB Collection
const reportSchema={
    reportType: String,
    report: Array
}
const Report= mongoose.model('Report', reportSchema);
const REPORT_ID='5ae07c084a2c99340418b258';

//Get request to resource http://localhost:3000
app.get('/', (req, res)=>{
    res.sendFile('public/index.html', {root: __dirname});
});

//GET the Current Voyagwe Report from DB
app.get('/api/journeyReports', (req, res)=>{
    // call to database and fetch voyage report
   getReport(res);
});

//POST the commander record to DB
app.post('/api/journeyReports', (req, res)=>{
    // Fetching only the report obj from request body
    let requestBody = req.body;
    let validationResult= joi.validate(requestBody, submittedJourneyReportSchema)
    if(validationResult.error)
        return res.status(400).send("Error: "+validationResult.error.details[0].message);
    
    let report= requestBody.report;
    updateTheReport(report, res);
});

//Fetch Report from MongoDB
async function getReport(res){
    // let report= await Report.findById(reportId);
    let report= await Report.findById(REPORT_ID);
    if(!report)
        return res.status(404).send(`The Requested Report not available`);

    console.log(`Fetched Report: ${report}`)
    res.status(200).send(report);
}

//query and course and then update the properties
async function updateTheReport(reqBody, res){
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