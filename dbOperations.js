"use strict";
const mongoose= require('mongoose');
var responseMessage={};
//Schema to store journey report to MongoDB Collection
const reportSchema= new mongoose.Schema({
    reportType: {   //Specify the Type of Report
        type: String,
        required: true,
    },
    dateOfCreation: {   //Mention the date of creation of Report
        type: Date,
        required: true,
        default: Date.now()
    },
    flightNo: {         // Collect the Flight Number
        type: String,
        default: ''
    },
    report: {           // The Complete analyzed report object 
        type:Array,
        required: true,
        validate: {
            validator: function(reportArray){
                return reportArray && reportArray.length> 0
            },
            message: 'A report should have atleast one item'
        }
    }
})
//Model class of Report
const reportModel= mongoose.model('Report', reportSchema);
// exported function
module.exports={
    // add flight number explicitly to report object
    addDateAndFlightNumber: function(flightNumber, analyzedReport, responseObj){
        let reportObject= new reportModel({
            reportType: "Voyage Report",
            dateOfCreation: Date.now(),
            flightNo: flightNumber,
            report: analyzedReport
        })  
        //Save the report to DB
        saveReport(reportObject, responseObj);
    },
// Fetch all reports from DB
    getAllReports: async function(res){
        try{
            var reports= await reportModel.find()
                                    .sort({dateOfCreation: -1})
                                    .select({flightNo: 1, report: 1, dateOfCreation: 1})
        }catch(err){
            res.status(503).send({"error": err})
        }
        if(!reports)
            return res.status(404).send({"error":`No Reports Available`});
    
        console.log(`Fetched Report: ${reports}`)
        
        res.status(200).send(reports);
    },
// Fetch a particular report from DB
    getParticularReport: async function(res, reportId){
        try{
            var report= await reportModel.findById(reportId)
                                    .select({flightNo: 1, report: 1, dateOfCreation: 1})
        }catch(err){
            res.status(503).send({"error": err})
        }

        if(!report)
            return res.status(404).send({"error":`Report having id ${reportId} is not found`});

        // console.log(`Fetched Report: ${report}`)     
        let creationDate= new Date(report.dateOfCreation);
        console.log(`Created on ${creationDate}`);
        res.status(200).send(report);
    }
}
//Save the Report on DB
async function saveReport(reportObject, responseObj){
    //Save the report to DB
    try{
        var result= await reportObject.save();
    }catch(err){
        responseObj.status(503).send({"error":err});
    }

    console.log(`Created Report: ${result}`);
    if(result){
        responseMessage.reportId= result._id;
        responseMessage.reportType= result.reportType;
        responseMessage.dateOfCreation= result.dateOfCreation;
        responseMessage.message="Report Saved Successfully";

        responseObj.status(200).send(responseMessage);
        responseObj=null;
    }else{
        responseMessage.error="Sorry, There is an error occured while storing report";
        responseObj.status(400).send(responseMessage);
        responseObj=null;
    }
}