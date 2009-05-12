#!/usr/bin/python
# Script to produce the HTML summary of the test results
import MySQLdb, re
passwd = open('/other/home/paj/passwd').read().strip()
db = MySQLdb.connect('localhost', 'paj', passwd, 'paj')

re1 = re.compile('compatible; (\w+)[ /]([\d.b]+)')
re2 = re.compile('(\w+)/([\d.b]+)')
re3 = re.compile('(Chrome|Version)/([\d.b]+)')
skip_ua = ['Gecko', 'Debian']

agents = dict()

cur = db.cursor()
cur.execute("select user_agent from hash_test where md5=1 and sha1=1")
for x, in cur.fetchall():
    m = re1.search(x)
    if not m:
        m = list(re2.finditer(x))
        if m:
            m = m[-1]
    if not m:
        continue
    ua, ver = m.groups()
    if ua == 'Safari':
        m = re3.search(x)
        if not m:
            continue
        if m.group(1) == 'Chrome':
            ua = 'Chrome'
        ver = m.group(2)
    if ua not in skip_ua:
        agents.setdefault(ua, set()).add(ver)

print "<table>"
for a in sorted(agents):
    print "<tr><th>%s</th><td>%s</td></tr>" % (a, ', '.join(sorted(agents[a])))
print "</table>"
