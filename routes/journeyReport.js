const express= require("express");
const router = express.Router();
const joi= require('joi');
const analyzeReport= require('../reportAnalysis');
const dbOperation= require('../dbOperations');

//statement object schema 
const statementSchema=joi.object().keys({
    statementNo: joi.number().required(),
    statement: joi.string().required()
})

//schema to validate user submitted report
const submittedJourneyReportSchema={
    report: joi.array().items(statementSchema).min(1).required()
}

//GET the Current Voyagwe Report from DB
router.get('/', (req, res)=>{
    // call to database and fetch voyage report
    dbOperation.getAllReports(res);
});

//GET the specific Report from DB
router.get('/:id', (req, res)=>{
    let reportId= req.params.id;
    dbOperation.getParticularReport(res, reportId);
});

//POST the commander record to DB
router.post('/', (req, res)=>{
    // Fetching only the report obj from request body
    let report= [];
    let requestBody = req.body;
    let validationResult= joi.validate(requestBody, submittedJourneyReportSchema);
    if(validationResult.error)
        return res.status(400).send({"error" : validationResult.error.details[0].message});
    else{
        report= requestBody.report;
        analyzeReport.getAllStatementsFromReport(report, res);
    }
});


module.exports = router;