import codecs
import mafan

from pymongo import MongoClient

def load_cedict():
    f = codecs.open('data/cedict_ts.u8', 'r', 'utf8')

    c = 0

    new_words = []
    for i, line in enumerate(f.readlines()):
        if line.startswith('#'):
            continue
        trad, simp = line.split(' ')[:2]
        pinyin = line[line.find('[')+1:line.find(']')]
        eng = line[line.find('/') + 1:line.rfind('/')]

        word = {'simplified': simp,
                'traditional': trad, 
                'english': eng, 
                'pinyin': mafan.pinyin.decode(''.join(pinyin.split(' '))),
                'pinyin_numbered': pinyin}
        new_words.append(word)

    client = MongoClient('localhost', 27017)
    db = client['cedict']
    words = db['entries']
    words.insert(new_words)

    f.close()

if __name__ == '__main__':
    load_cedict()