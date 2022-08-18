"use strict";

const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

// use your Cognitive Services for Language key and endpoint
const key = "YOUR_API_KEY";
const endpoint = "https://YOUR_SERVICE_NAME.cognitiveservices.azure.com/";
const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // expexted json from sender
    // [{ "id": "01", "text": "text to be analyzed" }]

    const requestSentences = req.body;

    // ----------------------------------------------------------------------
    // 1st Request to Cognitive Services for Language: Langugage Detection
    // ----------------------------------------------------------------------

    const detectRequest = [];
    requestSentences.forEach(sentence => detectRequest.push(sentence.text));
    const detectResult = await textAnalyticsClient.detectLanguage(detectRequest);

    // ----------------------------------------------------------------------
    // 2nd Request to Cognitive Services for Language: Sentiment
    // ----------------------------------------------------------------------

    const sentimentRequest = [];

    // expected json to send to Cognitive Services
    // const sentimentRequest = [
    //     {
    //         id: "01",
    //         text: "text to be analyzed",
    //         language: "ja"
    //     }
    // ];

    // requestSentences.forEach(item => { sentimentRequest.push( { id: item.id, text: item.text, language: "ja"} )});
    requestSentences.forEach((sentence, index) => { sentimentRequest.push( { id: sentence.id, text: sentence.text, language: detectResult[index].primaryLanguage.iso6391Name } )});

    const sentimentResult = await textAnalyticsClient.analyzeSentiment(sentimentRequest);

    const responseBody = [];
    sentimentResult.forEach(result => responseBody.push(
    { 
        "id": result.id, 
        "text": requestSentences.find(item => item.id === result.id).text,
        "overall_sentiment": result.sentiment, 
        "sentiment_scores": {
            "positive": result.confidenceScores.positive.toFixed(2), 
            "neutral": result.confidenceScores.neutral.toFixed(2), 
            "negative": result.confidenceScores.negative.toFixed(2) 
        }
    }
    ));

    context.res = {
        status: 200, /* Defaults to 200 */
        body: responseBody
    };
}