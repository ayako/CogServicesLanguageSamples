const util = require ('util');
const request  = require ('request');
const requestPromise = util.promisify(request);

const key = "YOUR_API_KEY";
const endpoint = "https://api.cognitive.microsofttranslator.com/";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // expexted json from sender
    // { "text": "text to be translated", "language": "ja" }    

    const originalText = req.body.text;
    const translateTo = req.body.language;    

    if(!originalText || !translateTo)
    {
        context.res = {
            status: 400,
            body: 'Set text and language parameters in body'
        };        
    }
    else
    {        
        let translateFrom;
        let translatedText;
        const requestBody = [ { 'Text': originalText } ];

        // ----------------------------------------------------------------------
        // 1st Request to Azure Translator Text: Langugage Detection
        // ----------------------------------------------------------------------

        var options = {                
            method: 'POST',
            url: endpoint + 'detect?api-version=3.0',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }

        let detectResult;
        try {
            var response = await requestPromise(options);
            detectResult = JSON.parse(response.body)[0];
            translateFrom = detectResult.language.toString();
        }
        catch (error){
            detectResult = null;
        }

        // ----------------------------------------------------------------------
        // 2nd Request to Azure Translator Text: Translate
        // ----------------------------------------------------------------------

        options = {                
            method: 'POST',
            url: endpoint + 'translate?api-version=3.0&to=' + translateTo
                + ((!translateFrom) ? '' : '&from=' + translateFrom),
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }

        let translateResult;
        try {
            var response = await requestPromise(options);
            translateResult = JSON.parse(response.body)[0];
            translatedText = translateResult.translations[0].text
        }
        catch (error){
            translateResult= null;
        }

        context.res = {
            status: 200, /* Defaults to 200 */
            body: 
                {
                    'translateFrom': (!detectResult) ? 'Translator error' : translateFrom,
                    'translateTo': translateTo,
                    'originalText': originalText,
                    'translatedText': (!translateResult) ? 'Translator error' : translatedText
                }
        };    
    }

}