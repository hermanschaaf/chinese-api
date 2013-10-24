(function(){

    var textNodes = [];
    var splitNodes = []

    function nativeTreeWalker(el) {
        var walker = document.createTreeWalker(
            el, 
            NodeFilter.SHOW_TEXT, 
            null, 
            false
        );

        var node;
        var textNodes = [];

        while(node = walker.nextNode()) {
            // only push nodes containing Chinese
            if (node.nodeValue.match(/[\u3400-\u9FBF]/)) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    $(function(){

        function addTooltips($searchElement){
          var tooltip = $searchElement.find('.zh-word').qtip({
              content: {
                text: 'hi',
                title: true,
                button: true
              },
              show: {
                  event: 'click',
                  solo: true,
                  modal: false
              },
              hide: {
                  event: 'unfocus'
              },
              position: {
                  my: 'top center',  // Position my top left...
                  at: 'bottom center', // at the bottom right of...
              },
              style: {
                  tip: true,
                  classes: 'qtip-light qtip-shadow'
              },
              events: {
                 show: function(event, api) {
                    var $el = $(event.target);
                    var $targetEl = $(event.originalEvent.target);
                    api.set('content.title', $targetEl.text());
                    $.ajax({
                      context: {
                        'api': api,
                        'targetEl': $targetEl 
                      },
                      url: 'http://localhost:5000/define',
                      type: 'POST',
                      dataType: 'json',
                      data: {
                          'word': $targetEl.text()
                      },
                      success: function(response, status) {
                        var api = this.api,
                            $targetEl = this.targetEl;
                        if (response.entries.length > 0){
                          var list = [],
                              entry = response.entries[0],
                              englishDefs = entry.english.split('/');
                          for (var i = 0; i < englishDefs.length; i++) {
                            list.push('<li>' + englishDefs[i] + '</li>');
                          }
                          var html = '<ul class="english">' + list.join('') + '</ul>';
                          api.set('content.text', html);
                          api.set('content.title', $targetEl.text() + ' <span class="pinyin">'+ entry.pinyin +'</span>');
                        }
                      }
                    });
                 },
                 hide: function(event, api) {
                 }
              }
          });
        }

        function wrapper(nodes){
            return function(data, textStatus){
                if (!data.text) {
                    return;
                }
                for (var i = 0; i < nodes.length; i++){
                    var $node = $(nodes[i]),
                        $parent = $node.parent();
                    var ns = $parent.data('nodes');
                    if (!ns) {
                        ns = [];
                    }
                    ns.push(i);
                    splitNodes.push(data.text[i]);

                    $parent.data('nodes', ns);
                    $parent.one('mouseover', function(){
                        // find all text node children
                        var $textNodes = $(this).contents();
                        var u = 0;
                        var $p = $(this);
                        $textNodes.each(function(){
                            if (this.nodeType == 3) {
                                var $node = $(this);
                                var index = $p.data('nodes')[u];
                                var newHtml = [];
                                for (var y = 0; y < splitNodes[index].length; y++) {
                                    newHtml.push('<span class="zh-word">' + splitNodes[index][y] + '</span>');
                                }
                                $node.replaceWith(newHtml.join(''));
                                u += 1;
                            }
                        });
                        addTooltips($p);
                    })
                }
            }
        }

        function highlightWords(nodes) {
            var nodeValues = [];
            for (var i = 0; i < nodes.length; i++) {
                nodeValues.push(nodes[i].nodeValue);
            }
            $.ajax({
              url: 'http://localhost:5000/split',
              type: 'POST',
              dataType: 'json',
              data: {
                  'text': nodeValues
              },
              success: wrapper(nodes)
            });
        }

        function transformCharacters(nodes) {
            for (var i = 0; i < nodes.length; i++){
                var node = nodes[i];
                node.nodeValue = $.toTraditional(node.nodeValue);
            }
        }

        // whether or not to tradify / simplify characters
        var transform_characters = localStorage["transform_characters"];
        textNodes = nativeTreeWalker(document.body);

        console.log(textNodes);

        if (transform_characters == "tradify") {
            transformCharacters(textNodes);
        }

        // make every word open an inline-lookup:
        highlightWords(textNodes);
    });
})();