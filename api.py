import os
from flask import Flask, request, jsonify

import mafan

app = Flask(__name__)

@app.route('/simplify', methods=['POST', 'GET'])
def simplify():
    text = request.args.get('text')
    d = {'text': mafan.simplify(text)}
    return jsonify(**d)

@app.route('/tradify', methods=['POST', 'GET'])
def tradify():
    text = request.args.get('text')
    d = {'text': mafan.tradify(text)}
    return jsonify(**d)

if __name__ == '__main__':
    app.run(debug=True)