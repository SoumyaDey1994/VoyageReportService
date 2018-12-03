const config = require('config');
//option to fire request to LUIS and identify Intent and Entities
module.exports = function(statement){
    //MSDN Subscription of Sourav Debnath- 24652
    const options = { 
                method: 'GET',
                url: config.get('luisAPI'),
                qs: { 
                        'subscription-key': process.env.LUIS_SUBSCRIPTION_KEY,
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