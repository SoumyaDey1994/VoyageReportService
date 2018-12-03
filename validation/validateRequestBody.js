const joi= require('joi');

//statement object schema 
const statementSchema=joi.object().keys({
    statementNo: joi.number().required(),
    statement: joi.string().required()
})

//schema to validate user submitted report
const submittedJourneyReportSchema={
    report: joi.array().items(statementSchema).min(1).required()
}

module.exports = function(requestBody){
    const result = joi.validate(requestBody, submittedJourneyReportSchema);
    return result;
}