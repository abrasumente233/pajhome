#!/usr/bin/python
# Manage blog subscriptions
import cgi, hmac, os, MySQLdb, time, re

msg_sub = '''You are already subscribed to the blog; you do not need to do anything
to keep your subscription. If you would like to unsubscribe, click
this link:'''
msg_nosub = '''To subscribe to the blog, click this link:'''

def send_email(email_text):
    sendmail = os.popen('/usr/sbin/sendmail -t', 'w')
    sendmail.write(email_text)
    sendmail.close()

def tmpl_subst(text, vars):
    return re.sub('\$(\w+)', lambda m, v=vars: v[m.group(1)], text)

form = cgi.FieldStorage()
email = form.has_key('email') and form['email'].value.strip() or ''
action = form.has_key('action') and form['action'].value or ''
auth = form.has_key('auth') and form['auth'].value or ''

secret = open('/other/home/paj/secret').read().strip()
token = hmac.new(secret, email).hexdigest()

passwd = open('/other/home/paj/passwd').read().strip()
db = MySQLdb.connect('localhost', 'paj', passwd, 'paj')
cur = db.cursor()
cur.execute('select count(*) from subscribers where email = %s', email)
subscribed = bool(cur.fetchone()[0])

fmt = '%a, %d %b %Y %H:%M:%S +0000'
date = time.strftime(fmt, time.gmtime(time.time()))

if not re.match('^[\w\-\.]+\@[\w\-\.]+$', email):
    msg = 'Invalid email address'

elif action == 'send':
    cur.execute('select count(*) from blocked_email where email = %s', email)
    if not cur.fetchone()[0]:
        msg = subscribed and msg_sub or msg_nosub
        action = subscribed and 'unsub' or 'sub'
        send_email(tmpl_subst(open('subscribe.email').read(), locals()))
    msg = 'An email has been sent to this address, with further instructions. If you do not receive the email, please check your spam folder. It is send from the address paj@pajhome.org.uk'

elif action in ('sub', 'unsub'):
    if auth != token:
        msg = 'Invalid authentication token. Please request subscription again, to generate a new email with a valid authentication token.'
    else:
        if action == 'sub':
            if not subscribed:
                cur.execute('insert into subscribers (email) values (%s)', email)
            send_email(tmpl_subst(open('subscribe2.email').read(), locals()))
            msg = 'You are now subscribed'
        else:
            cur.execute('delete from subscribers where email = %s', email)
            msg = 'You are now unsubscribed'

else:
    msg = 'Invalid action. Please do not edit the URL.'

print "Content-type: text/html\n"
email = cgi.escape(email)
print tmpl_subst(open('subscribe.html').read(), locals())
