const mongoose= require('mongoose');
const config = require('config');
//connect to MongoDb database on MLAB
module.exports = function(){
    mongoose.connect(config.get('dbConnection'))
            .then(()=> console.log("Scccessfully Connected to MongoDB Server of mLAB..."))
            .catch((error)=> console.log("Cannot connect to MongoDB Server of mLAB...", error));
}
