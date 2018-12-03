const express= require("express");
const router = express.Router();
//Import modules
const analyzeReport= require('../reportAnalysis');
const dbOperation= require('../dbOperations');
const validate = require('../validation/validateRequestBody');
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
    let validationResult= validate(requestBody);
    if(validationResult.error)
        return res.status(400).send({"error" : validationResult.error.details[0].message});
    else{
        report= requestBody.report;
        analyzeReport.getAllStatementsFromReport(report, res);
    }
});


module.exports = router;