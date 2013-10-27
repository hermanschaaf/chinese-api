# -*- coding: utf-8 -*-
import os
from datetime import timedelta
from functools import wraps, update_wrapper
from flask import Flask, make_response, request, render_template, jsonify, current_app

import pymongo
import mafan

client = pymongo.MongoClient('localhost', 27017)
db = client['cedict']
words_collection = db['entries']

app = Flask(__name__)

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp
            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

def jsonp(func):
    """Wraps JSONified output for JSONP requests."""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        callback = request.args.get('callback', False)
        if callback:
            data = str(func(*args, **kwargs).data)
            content = str(callback) + '(' + data + ')'
            mimetype = 'application/javascript'
            return current_app.response_class(content, mimetype=mimetype)
        else:
            return func(*args, **kwargs)
    return decorated_function

# ========================================================
# User-related functions
# ========================================================

def simplify():
    text = request.args.get('text')
    d = {'text': mafan.simplify(text)}
    return jsonify(**d)


# ========================================================
# Text to Simplified (POST, GET and JSONP)
# ========================================================

@app.route('/simplify', methods=['POST', 'GET'])
@crossdomain('*')
@jsonp
def simplify():
    text = request.args.get('text')
    d = {'text': mafan.simplify(text)}
    return jsonify(**d)


# ========================================================
# Text to Traditional (POST, GET and JSONP)
# ========================================================

@app.route('/tradify', methods=['POST', 'GET'])
@crossdomain('*')
@jsonp
def tradify():
    text = request.args.get('text')
    d = {'text': mafan.tradify(text)}
    return jsonify(**d)

# ========================================================
# Split text (POST, GET and JSONP)
# ========================================================

def _split_text(text):
    if not text:
        return {'text': None}
    # if text is a string, handle as such
    if isinstance(text, basestring):
        d = {'text': mafan.split_text(text)}
    # elif text is a list, handle as such
    else:
        d = {'text': [mafan.split_text(t) for t in text]}
    return d

@app.route('/split', methods=['POST', 'GET'])
def split_text():
    text = request.form.getlist('text[]') or request.args.getlist('text[]')
    if len(text) == 1:
        text = text[0]
    elif not text:
        text = request.args.get('text')
    return jsonify(**_split_text(text))

@app.route('/jsonp/split', methods=['GET'])
@crossdomain('*')
@jsonp
def split_text_jsonp():
    text = request.args.getlist('text[]')
    if len(text) == 1:
        text = text[0]
    elif not text:
        text = request.args.get('text')
    return jsonify(**_split_text(text))

# ========================================================
# Word definitions
# ========================================================

def _define(chinese):
    d = words_collection.find({'$or': [{'simplified': chinese},{'traditional': chinese}]}, 
        {'simplified': 1, 'traditional': 1, 'english': 1, 'pinyin': 1, '_id': 0})
    ar = [e for e in d]
    for a in ar:
        a['english'] = a['english'].split('/')
    return ar

@app.route('/define', methods=['GET', 'POST'])
def define_word():
    word = request.form.get('word') or request.args.get('word')
    d = {
        'entries': [_define(chinese=word)],
        'components': [_define(chinese=c) for c in word]
    }
    return jsonify(**d)


# ========================================================
# App Index and helper pages
# ========================================================

@app.route('/')
def test_bookmarklet():
    return render_template('chinese-bookmarklet.html')


if __name__ == '__main__':
    app.run(debug=True)