const express= require("express");
const helmet= require("helmet");
const compression= require("compression");
const app= express();

app.use(express.json());
// app.use(express.helmet());
// app.use(express.compression())

const port= process.env.PORT| 3000;

//Get request to resource http://localhost:3000
app.get('/', (req, res)=>{
    res.send("Welcome to our API")
});

//GET the Current Voyagwe Report from DB
app.get('/api/journeyReports', (req, res)=>{
    // call to database and fetch voyage report
    let report= {};
    res.status(200).send(report);
});

//POST the commander record to DB
app.post('/api/journeyReports', (req, res)=>{
    let curretReport= req.body;
    //Update the DB record with current report
        let acknowledgement={
            "ReportId": 1,
            "SuccessMeggae": "Successfully entered the report",
            "Report": curretReport
        }
    console.log("Report Accepted")
    //Send the acknowledgement message to user
    return res.status(200).send(acknowledgement);

})

app.listen(port, ()=>console.log(`Server running on http://localhost:${port}`))