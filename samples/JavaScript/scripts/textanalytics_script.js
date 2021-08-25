$(function () {

    var outputDiv = $("#OutputDiv");
    var resultUrlDiv = $("#ResultUrlDiv");

    // Text Analytics の Subscription Key と URL をセット
    // Azure Portal 画面に表示される URL および Key をコピーしてください
    var subscriptionKey = "YOUR_API_KEY";
    var endpoint = "https://YOUR_SERVICE_URL.cognitiveservices.azure.com/";

    // Text Analytics 呼び出し URL をセット
    var webSvcUrl = endpoint + "text/analytics/v3.2-preview.1/analyze";

    //文章の Post    
    var postData = function () {

        //全角数字→半角に変換
        // var textData = document.getElementById('TextData').value;
        var textData = document.getElementById('TextData').value.toString()
        .replace(/[０-９．]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });;

        var language = document.getElementById('Language').value;
        var sentenceCount = document.getElementById('SentenceCount').value;

        var analysisData = {
            'displayName': 'tasks_20210811',
            'analysisInput': {
                'documents': [
                    {
                        'id': '001',
                        'text': textData,
                        'language': language
                        }
                ]
            },
            'tasks': {
                'extractiveSummarizationTasks': [
                    {
                        'parameters': {
                            'model-version': 'latest',
                            'loggingOptOut': false,
                            'stringIndexType': 'TextElement_v8',
                            'sentenceCount': sentenceCount,
                            'sortBy': 'Offset'
                        }
                    }
                ]
            }
        };
    
        // Text Analytics にデータを Post
        fetch( webSvcUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysisData)

        }).then((res)=>{

            outputDiv.text("On process: posting data...");

            if (!res.ok) {
                outputDiv.text("ERROR!: failed to send text data.");
            }
            return(res.headers.get('operation-location'));

        }).then((resultUrl)=>{
                // 結果取得URL を取得
                resultUrlDiv.text(resultUrl);
                outputDiv.text("データを送信しました。結果を取得するには [Result] をクリックしてください");
        });
    };

    // 結果の取得
    var getResult = function () {

        outputDiv.text("On process: checking analysis task status...");

        var resultUrl = document.getElementById('ResultUrlDiv').textContent;
        fetch( resultUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
        }).then((res)=>{

            if (!res.ok) {
                outputDiv.text("ERROR!: failed to access to result.");
            }
            return(res.json() );

        }).then((json)=>{

            // 分析結果が取得できた場合
            if (json.status == "succeeded")
            {
                var outputText = "<h3>" + "結果:" + "</h3>";
                json.tasks.extractiveSummarizationTasks[0].results.documents[0].sentences.forEach(sentence => {
                    outputText += sentence.text
                });
                outputDiv.html(outputText);                
            }
            else
            {
                outputDiv.text("分析中です。しばらくしてから再度 [結果の取得] をクリックしてください");
            }
        });

    };

    // データの送信
    $("#PostData").on('click', function(e){
        postData();
    });

    // 結果取得＆表示
    $("#GetResult").on('click', function(e){
        getResult();
    });

});