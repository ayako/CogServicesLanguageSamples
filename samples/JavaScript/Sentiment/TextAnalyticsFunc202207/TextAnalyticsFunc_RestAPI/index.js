"use strict";

// const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const util = require ('util');
const request  = require ('request');
const requestPromise = util.promisify(request);

// use your Cognitive Services for Language key and endpoint
const key = "YOUR_API_KEY";
const endpoint = "https://YOUR_SERVICE_NAME.cognitiveservices.azure.com/";
// const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // expexted json from sender
    // [{ "id": "01", "text": "text to be analyzed" }]

    const requestSentences = req.body;

    // ----------------------------------------------------------------------
    // 1st Request to Cognitive Services for Language: Langugage Detection
    // ----------------------------------------------------------------------

    // const detectRequest = [];
    // requestSentences.forEach(sentence => detectRequest.push(sentence.text));
    const detectRequestBody = [];
    requestSentences.forEach(value => detectRequestBody.push({ id: value.id, text: value.text }));

    // const detectResult = await textAnalyticsClient.detectLanguage(detectRequest);
    const detectResult = [];
    try
    {
        var response = await requestPromise(
            {                
                method: 'POST',
                url: endpoint + "language/:analyze-text?api-version=2022-05-01",
                mode: 'cors',
                headers: {
                    'Ocp-Apim-Subscription-Key': key,
                    'Content-Type': 'application/json'
                },
                body: 
                JSON.stringify(
                {
                    "kind": "LanguageDetection",
                    "parameters": {
                        "modelVersion": "latest"
                    },
                    "analysisInput":{
                        "documents": detectRequestBody
                    }
                })
            }
        );
        JSON.parse(response.body).results.documents.forEach(value => detectResult.push(
            { 
                "id": value.id, 
                "language": value.detectedLanguage.iso6391Name
            }
        ));
    }
    catch (error){}

    // ----------------------------------------------------------------------
    // 2nd Request to Cognitive Services for Language: Sentiment
    // ----------------------------------------------------------------------    

    // const sentimentRequest = [];
    const sentimentRequestBody = [];
    const sentimentResult = [];
    try 
    {
        // expected json to send to Text Analytics
        // const sentimentRequest = [
        //     {
        //         id: requestBody.id,
        //         text: requestBody.text,
        //         language: "ja"
        //     }
        // ];
        //requestSentences.forEach((sentence, index) => { sentimentRequest.push( { id: sentence.id, text: sentence.text, language: detectResult[index].primaryLanguage.iso6391Name } )});
        requestSentences.forEach(value => { sentimentRequestBody.push(
            { 
                id: value.id, 
                text: value.text, 
                language: detectResult.find(x => x.id == value.id).language
            } 
        )});

        // sentimentResult = await textAnalyticsClient.analyzeSentiment(sentimentRequest);
        var response = await requestPromise(
            {                
                method: 'POST',
                url: endpoint + "language/:analyze-text?api-version=2022-05-01",
                mode: 'cors',
                headers: {
                    'Ocp-Apim-Subscription-Key': key,
                    'Content-Type': 'application/json'
                },
                body: 
                JSON.stringify(
                {
                    "kind": "SentimentAnalysis",
                    "parameters": {
                        "modelVersion": "latest",
                        "opinionMining": "True"
                    },
                    "analysisInput":{
                        "documents": sentimentRequestBody
                    }
                })
            }
        );

        JSON.parse(response.body).results.documents.forEach(value => sentimentResult.push(
            { 
                "id": value.id, 
                "sentiment": value.sentiment, 
                "scores": {
                    "positive": value.confidenceScores.positive.toFixed(2), 
                    "neutral": value.confidenceScores.neutral.toFixed(2), 
                    "negative": value.confidenceScores.negative.toFixed(2) 
                }
            }
        ));    

    } catch (error) {}

    const responseBody = [];
    if (detectResult.length > 0 && sentimentResult.length > 0)
    {
        requestSentences.forEach(value => responseBody.push(
            {
                "id": value.id,
                "text": value.text,
                "language": detectResult.find(x=> x.id == value.id).language,
                "overall_sentiment": sentimentResult.find(x => x.id == value.id).setiment,
                "sentiment_scores": sentimentResult.find(x => x.id == value.id).scores
            }
        ));
        context.res = {
            status: 200,
            body: responseBody
        };     
    }
    else
    {
        context.res = {
            status: 400,
            body: 'Had issue to make POST to Cognitive Services.'
        };     
    }


}