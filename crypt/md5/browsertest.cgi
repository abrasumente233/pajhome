#!/usr/bin/python
# Script to receive test results from the browser, and store in the database
import cgi, MySQLdb

form = cgi.FieldStorage()
print os.environ['HTTP_USER_AGENT'], bool(int(form['md5'])), bool(int(form['sha1']))

db = MySQLdb.connect('localhost', 'paj', open('passwd').read())
db.selectdb('paj')
#db.query("insert into hash_test (user_agent, md5, sha1) values (?, ?, ?)")
db.commit()
