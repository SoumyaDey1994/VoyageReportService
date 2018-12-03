const mongoose= require('mongoose');
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
            message: 'A report should have atleast one record'
        }
    }
})
//Model class of Report
const reportModel= mongoose.model('Report', reportSchema);

module.exports = reportModel;