import os
from functools import wraps
from flask import Flask, request, jsonify, current_app

import mafan

app = Flask(__name__)

def jsonp(func):
    """Wraps JSONified output for JSONP requests."""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        print "DECORATED"
        callback = request.args.get('callback', False)
        if callback:
            data = str(func(*args, **kwargs).data)
            content = str(callback) + '(' + data + ')'
            mimetype = 'application/javascript'
            return current_app.response_class(content, mimetype=mimetype)
        else:
            return func(*args, **kwargs)
    return decorated_function

@app.route('/simplify', methods=['POST', 'GET'])
@jsonp
def simplify():
    text = request.args.get('text')
    d = {'text': mafan.simplify(text)}
    return jsonify(**d)

@app.route('/tradify', methods=['POST', 'GET'])
@jsonp
def tradify():
    text = request.args.get('text')
    d = {'text': mafan.tradify(text)}
    return jsonify(**d)

if __name__ == '__main__':
    app.run(debug=True)