import codecs
import json
from collections import defaultdict

f = codecs.open("data/dict.txt.big", "r", "utf-8")
w = codecs.open('data/dictionary.js', 'w', 'utf8')

print "writing dictionary..."
w.write("var dictionary = [\n");

for i, line in enumerate(f.readlines()):
	l = line.split(' ')
	w.write("""[\"%s\",%d,\"%s\"],""" % (l[0], int(l[1]), l[2].strip()))

w.write("""];""")

f.close()
w.close()

print "done."