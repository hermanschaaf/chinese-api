(function(){

    // the minimum version of jQuery we want
    var v = "1.5.0";

    // check prior inclusion and version
    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
        var done = false;
        var script = document.createElement("script");
        script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                done = true;
                initChineseBookmarklet();
            }
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        initChineseBookmarklet();
    }
    
    function initChineseBookmarklet() {
        (window.chineseBookmarklet = function() {
            var $text = $('h1, h2, h3, h4, h5, h6, p');
            $text.each(function(){

              function wrapper($element){
                  return function(data, textStatus){
                      $element.text(data.text);
                  }
              }

              $.ajax({
                  url: 'http://api.chineselevel.com/simplify',
                  type: 'POST',
                  dataType: 'JSONP',
                  data: {
                      'text': $(this).text()
                  },
                  success: wrapper($(this))
              });
            });
        })();
    }

})();