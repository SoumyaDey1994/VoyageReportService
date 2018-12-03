const cors = require('cors');
const bodyParser = require('body-parser');

module.exports = function(app){
    //Parse request and response object as JSON
    app.use(bodyParser.json());
    // Enable CORS
    app.use(cors());
}