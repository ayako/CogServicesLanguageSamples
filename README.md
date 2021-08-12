# Microsoft Azure Cognitive Services | Applied AI Services を利用した 自然言語処理アプリ

"人工知能 API" [Microsoft Azure Cognitive Services](https://www.microsoft.com/cognitive-services/) や [Microsoft Azure Applied AI Services](https://azure.microsoft.com/ja-jp/product-categories/applied-ai-services/) を使うと、自然言語処理や分析を行うエンジンをノーコーディングで利用、作成できます。

- [Text Analytics](https://azure.microsoft.com/ja-jp/services/cognitive-services/text-analytics/) は、自然言語処理を行って、文章中のキーワードやエンティティの抽出、センチメント分析、文章要約を行うエンジンをすぐに Web API で利用できます。

# サンプルの利用方法

- Text Analytics : Summarize ([HTML/JavaScript](#htmljavascript))

## Text Analytics

Azure Portal から Text Analytics の エンドポイント(URL) と キー (Subscription Key) を取得しておきます。
**Key1** に表示されている文字列が キー (Subscription Key) になります。

### HTML/JavaScript

[textanalytics_script.js](samples/JavaScript/scripts/textanalytics_script.js)

```textanalytics_script.js
// Text Analytics の Subscription Key と URL をセット
// Azure Portal 画面に表示される URL および Key をコピーしてください
var subscriptionKey = "YOUR_API_KEY";
var endpoint = "https://YOUR_SERVICE_URL.cognitiveservices.azure.com/";
```

TextAnalyticsSummarize.html を開き、文章を入力して動作を確認できます。
