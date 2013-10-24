import codecs
import json

f = codecs.open("dict.txt.big.txt", "r", "utf-8")

class Trie(object):
	def __init__(self, word="", full_word=False):
		self.word = word
		self.children = {}
		self.full_word = full_word

	def insert(self, word):
		if len(word) > 0:
			c = word[0]
			if c not in self.children:
				self.children[c] = Trie(c)
			self.children[c].insert(word[1:])
		else:
			self.full_word = True
			return

	def as_dict(self):
		d = {}
		for word, c in self.children.items():
			d[word] = c.as_dict()
		if self.full_word:
			d[''] = 1
		return d

root = Trie()

print "building trie..."

for i, line in enumerate(f.readlines()):
	w = line.split(' ')
	word = w[0]
	root.insert(word)

f.close()

print "writing dictionary..."

w = codecs.open('dict_trie.json', 'w', 'utf8')
w.write(json.dumps(root.as_dict()))

print "done."