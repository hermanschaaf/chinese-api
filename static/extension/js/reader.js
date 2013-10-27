(function(){

    var source   =  
        '<div class="entries">' +
        '   {{#each entries}}' +
        '   <div class="definitions">' +
        '      <div class="buttons">' +
        '          <a class="zh-btn zh-signin">+</a>' +
        '      </div>' + 
        '      {{#each this}}' +
        '      <div class="definition">' +
        '         <div class="chinese">{{ traditional }}</div>' + 
        '         <div class="pinyin">{{ pinyin }}</div>' + 
        '         <ul class="english">' +
        '            {{#each english}}' + 
        '            <li>{{ this }}</li>' +
        '            {{/each}}' +
        '         </ul>' +
        '      </div>' +
        '      {{/each}}' +
        '   </div>' +
        '   {{/each}}' +
        '</div>';
    var template = Handlebars.compile(source);

    var textNodes = [];
    var splitNodes = [];
    var apiUrl = 'http://localhost:5000';

    function auth_callback(user) {
      console.log(user);
    };

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


    function addTooltips($searchElement){
      var tooltip = $searchElement.find('.zh-word').qtip({
          content: {
            text: ' ',
            title: false,
            button: false
          },
          show: {
              event: 'mouseenter',
              delay: 300,
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
                $.ajax({
                  context: {
                    'api': api,
                    'tooltip': $el,
                    'targetEl': $targetEl 
                  },
                  url: apiUrl + '/define',
                  type: 'POST',
                  dataType: 'json',
                  data: {
                      'word': $targetEl.text()
                  },
                  success: function(response, status) {
                    var api = this.api,
                        $targetEl = this.targetEl;

                    if (response.entries && response.entries[0].length == 0){
                        var html = template({entries: response.components});
                        api.set('content.text', html);
                    } else {
                        var html = template({entries: response.entries});
                        api.set('content.text', html);
                    }
                    // add events to tooltip
                    this.tooltip.find('.zh-signin').on('click', function(e){
                        e.stopPropagation();
                        chrome.runtime.sendMessage({action: "authenticate"}, function(response) {
                            auth_callback(response);
                        });
                        return false;
                    })
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
                var ns = $parent.data('nodes'),
                    hasEventListener = true;
                if (!ns) {
                    ns = [];
                    hasEventListener = false;
                }
                ns.push(i);
                splitNodes.push(data.text[i]);

                $parent.data('nodes', ns);
                if (!hasEventListener) {
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
                                if (splitNodes[index]) {
                                    // splitNodes[index] is a hack; should never happen, but does sometimes
                                    for (var y = 0; y < splitNodes[index].length; y++) {
                                        var text = splitNodes[index][y];
                                        if (text.match(/[\u3400-\u9FBF]/)) {
                                            newHtml.push('<span class="zh-word">' + text + '</span>');
                                        } else {
                                            newHtml.push(text);
                                        }
                                    }
                                    $node.replaceWith(newHtml.join(''));
                                    u += 1;
                                }
                            }
                        });
                        addTooltips($p);
                    });
                }
            }
        }
    }

    function highlightWords(nodes) {
        var nodeValues = [];
        for (var i = 0; i < nodes.length; i++) {
            nodeValues.push(nodes[i].nodeValue);
        }
        $.ajax({
          url: apiUrl + '/split',
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

    if (transform_characters == "tradify") {
        transformCharacters(textNodes);
    }

    // make every word open an inline-lookup:
    highlightWords(textNodes);

})();