//option to fire request to LUIS and identify Intent and Entities
module.exports = function(statement){
    //MSDN Subscription of Sourav Debnath- 24652
    const options = { 
                method: 'GET',
                url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/0c35057e-e9e4-4361-ba3e-0a7045b35911',
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