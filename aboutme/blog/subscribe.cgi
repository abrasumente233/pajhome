#!/usr/bin/python
# Manage blog subscriptions
import cgi, hmac, os, MySQLdb

msg_sub = '''You are already subscribed to the blog; you do not need to do anything
to keep your subscription. If you would like to unsubscribe, click
this link:'''
msg_nosub = '''To subscribe to the blog, click this link:'''

def send_email(email_text):
    sendmail = os.popen('/usr/sbin/sendmail -t', 'w')
    sendmail.write(email_text)
    sendmail.close()

form = cgi.FieldStorage()
email = form['email'].value.strip()
action = form['action'].value

secret = open('/other/home/paj/secret').read().strip()
token = hmac.new(secret, email).hex_digest()

passwd = open('/other/home/paj/passwd').read().strip()
db = MySQLdb.connect('localhost', 'paj', passwd, 'paj')
res = db.query('select count(*) from subscribers where email = %s', email)
subscribed = bool(res.fetchone()[0])

fmt = '%a, %d %b %Y %H:%M:%S +0000'
date = time.strftime(fmt, time.gmtime(time.time()))

if not re.match('^[\w\-\.]+\@[\w\-\.]+$', email):
    msg = 'Invalid email address'

elif action == 'send':
    res = db.query('select count(*) from blocked_email where email = %s', email)
    if not res.fetchone()[0]:
        msg = subscribed and msg_sub or msg_nosub
        action = subscribed and 'unsub' or 'sub'
        send_email(open('subscribe.email').read() % locals())
    msg = 'An email has been sent to this address, with further instructions.'

elif action in ('sub', 'unsub'):
    if form['auth'].value != token:
        msg = 'Invalid authentication token. Please request subscription again, to generate a new email with a valid authentication token.'
    else:
        if action == 'sub':
            if not subscribed:
                db.cursor().execute('insert into subscribers (email) values (%s)', email)
            send_email(open('subscribe2.email').read() % locals())
            msg = 'You are now subscribed'
        else:
            db.cursor().execute('delete from subscribers where email = %s', email)
            msg = 'You are now unsubscribed'

else:
    msg = 'Invalid action. Please do not edit the URL.'

email = cgi.escape(email)
print open('subscribe.html').read() % locals()
