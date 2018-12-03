"use strict";
const rp= require('request-promise');
const dbOperation= require('./dbOperations');
const luisService = require('./services/luis');
let responseObject=null;                     // Variable to hold the response object
let noOfStatementsInReport;                 // variable to hold no of statements of report
let entitiesAndValues={};                  // Object to hold entity property and value
let propertyAndCorrespondingValue=[];     // Array to hold all entities of a single statement
let analyzedReport={};                   // Object to hold analyzed report of a single statement
let completeAnalyzedReportSummary=[];   // Array to hold complete analyzed report
const defaultValueForInentEntity='NA'; // Default value of intent and entities

let flightNumber='';                  // Default value of Flight Number
// exported function
module.exports={
    getAllStatementsFromReport: function(report, res){
        responseObject= res;
        let allStatements= report.map(item=> item.statement);
        noOfStatementsInReport= allStatements.length;
        console.log("No of Statements in Report: "+noOfStatementsInReport);
        getAnalysisReport(allStatements);
    }
}

//Fire statements to LUIS and bitext one by one
async function getAnalysisReport(allStatements){
    for(let i in allStatements){
        try{
            await getIntentEntitiesAndSentiment(allStatements[i]) 
        }catch(err){
            console.log("Error in Analysis Process: "+err);
        }
    }
}
//Get intent, entities and sentiment of each statement from LUIS and bitext
async function getIntentEntitiesAndSentiment(statement){
    let optionsToFireServiceToLUIS= luisService(statement);
    try{
        let intentEntityResponse=JSON.parse(await rp(optionsToFireServiceToLUIS));  
        let sentimentValue= intentEntityResponse.sentimentAnalysis.score.toFixed(2);    //get sentiment score upto 2 decimal point
        getIntentEntityAndSentiment(intentEntityResponse, sentimentValue);
    }catch(err){
        console.log("Error Occured: "+err);
    }
}
//Identify intent, Entities and Sentiment and store them in an array as object
function getIntentEntityAndSentiment(intentEntity, sentimentValue){
    analyzedReport.statement= intentEntity.query;   //Get the statement
    analyzedReport.intent= getIntentOfStatement(intentEntity.topScoringIntent)    //get the intent of statement
    analyzedReport.sentimentScore= sentimentValue;  //get the sentiment value
    analyzedReport.sentiment= getSentimentOfStatement(sentimentValue);
    analyzedReport.entities=getAllEntitiesAndCorrespondingValues(intentEntity); //store all entity name and corresponding value in an array
    
    completeAnalyzedReportSummary.push((analyzedReport)); //Push intent, entity and sentiments in a global array
    propertyAndCorrespondingValue=[];   //Clear the entity array
    analyzedReport={};  //clear the report object

    if(completeAnalyzedReportSummary.length===noOfStatementsInReport){
        getTheFlightNumberFromAnalyzedReport(completeAnalyzedReportSummary);
        completeAnalyzedReportSummary=[];
    }
}
//Get Intent of Statement 
function getIntentOfStatement(highestProbablityIntent){
    let intentScore=highestProbablityIntent.score.toFixed(1);
    const permissibleThreshold=0.4;
    if(intentScore >=permissibleThreshold)
        return highestProbablityIntent.intent;
    else
        return defaultValueForInentEntity;
}
//Get sentiment value based on sentiment score
function getSentimentOfStatement(sentimentValue){
    let sentimentlabel= (sentimentValue>=0.25)?((sentimentValue>=0.55)?"Positive":"Neutral"):"Negetive";
    return sentimentlabel;
}
//Get all entity name and their values
function getAllEntitiesAndCorrespondingValues(intentEntity){
    let entityArray=intentEntity.entities;
    let noOfEntities= entityArray.length;
    if(noOfEntities===0){
        entitiesAndValues.property= defaultValueForInentEntity;   //set the entity name to None
        entitiesAndValues.value= defaultValueForInentEntity;     //set the entity value to None
        propertyAndCorrespondingValue.push(entitiesAndValues);  //store them in an array
        entitiesAndValues={};                                   //clear the entity object
    }else{
        entityArray.forEach((item)=>{
            entitiesAndValues.property= item.type;     //get the entity name
            entitiesAndValues.value= item.entity;      //get entity value
            propertyAndCorrespondingValue.push(entitiesAndValues);  //store them in an array
            entitiesAndValues={};                                   //clear the entity object
        })
    }
    return propertyAndCorrespondingValue;
}
// Collect the flight no from report
function getTheFlightNumberFromAnalyzedReport(ReportSummary){
    let firstStatementReport= ReportSummary[0];
    let entitiesOfFirstReport= firstStatementReport.entities;

    for(let entity of entitiesOfFirstReport){
        if(entity.property==='flightNo'){
            flightNumber=entity.value;
            break;
        }
    }
    dbOperation.addDateAndFlightNumber(flightNumber, ReportSummary, responseObject);
    flightNumber='';
}

