chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "split") {
        var response = [];
        for (var i = 0; i < request.data.length; i++) {
            response.push(jieba.cut(request.data[i]));
        }
        sendResponse({'text': response});
    }
    return false;
});