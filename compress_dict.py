import codecs
import json
from collections import defaultdict

f = codecs.open("data/dict.txt.big", "r", "utf-8")
w = codecs.open('data/dict.compressed.txt', 'w', 'utf8')

len_dict = defaultdict(set)

print "compressing dict..."

for i, line in enumerate(f.readlines()):
	l = line.split(' ')
	word = l[0]
	len_dict[len(word)].add(word)

print "writing dictionary..."

for length in len_dict:
	for word in len_dict[length]:
		w.write(word)
	w.write('|||') # separator

f.close()
w.close()

print "done."