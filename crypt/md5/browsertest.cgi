#!/usr/bin/python
# Script to receive test results from the browser, and store in the database
import cgi, MySQLdb, os
form = cgi.FieldStorage()
passwd = open('/other/home/paj/passwd').read().strip()
db = MySQLdb.connect('localhost', 'paj', passwd, 'paj')
cur = db.cursor()
cur.execute("insert into hash_test (user_agent, md5, sha1) values (%s, %s, %s)",
        (os.environ['HTTP_USER_AGENT'], bool(int(form['md5'].value)), bool(int(form['sha1'].value))))
db.commit()
print "Content-type: text/plain\n\nSubmission received"
