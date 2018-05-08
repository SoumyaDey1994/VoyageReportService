const request= require('request');
const rp= require('request-promise');
const dbOperation= require('./dbOperations');

var responseObject;                          // Variable to hold the response object
var noOfStatementsInReport;                 // variable to hold no of statements of report
var entitiesAndValues={};                  // Object to hold entity property and value
var propertyAndCorrespondingValue=[];     // Array to hold all entities of a single statement
var analyzedReport={};                   // Object to hold analyzed report of a single statement
var completeAnalyzedReportSummary=[];   // Array to hold complete analyzed report
const defaultValueForInentEntity='NA'; // Default value of intent and entities

var flightNumber='';                  // Default value of Flight Number
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
            console.log(`Analyzing Statement ${i}`);
            await getIntentEntitiesAndSentiment(allStatements[i]);
        }catch(err){
            console.log("Error in Analysis Process: "+err);
        }
    }
}
//option to fire request to LUIS and identify Intent and Entities
function setOptionsToFireServiceToLUIS(statement){
    //MSDN Subscription of Sourav Debnath- 24652
    var options = { 
                method: 'GET',
                url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/0c35057e-e9e4-4361-ba3e-0a7045b35911',
                qs: 
                    { 'subscription-key': '106877aa8c7945c484f3f577ffdb6564',
                        timezoneOffset: '0',
                        q: statement 
                    },
                headers: 
                    { 
                        'Cache-Control': 'no-cache',
                        'content-type': 'application/json'  
                    } 
        };
    return options;
}

//Get intent, entities and sentiment of each statement from LUIS and bitext
async function getIntentEntitiesAndSentiment(statement){
    let optionsToFireServiceToLUIS= setOptionsToFireServiceToLUIS(statement);
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
        getTheFlightNumberFromAnalyzedReport(completeAnalyzedReportSummary)
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
    let sentimentlabel= (sentimentValue>=0.26)?((sentimentValue>=0.55)?"Positive":"Neutral"):"Negetive";
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

function getTheFlightNumberFromAnalyzedReport(completeAnalyzedReportSummary){
    let firstStatementReport= completeAnalyzedReportSummary[0];
    let entitiesOfFirstReport= firstStatementReport.entities;
    let noOfEntities=entitiesOfFirstReport.length;
    console.log("No of Entities in Statement 1: "+noOfEntities);

    for(let entity of entitiesOfFirstReport){
        if(entity.property==='flightNo'){
            flightNumber=entity.value;
            console.log("Flight No: "+flightNumber);
            break;
        }
    }
    dbOperation.addDateAndFlightNumber(flightNumber, completeAnalyzedReportSummary, responseObject);
}