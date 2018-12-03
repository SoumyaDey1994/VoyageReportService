const homeRouter = require('../routes/home');
const journeyReportRouter = require('../routes/journeyReport');

module.exports = function(app){
    app.use('/', homeRouter);
    app.use('/api/journeyReports', journeyReportRouter);
}