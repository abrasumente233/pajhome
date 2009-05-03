#!/usr/bin/python
#--
# Paj's guest book
# This python script provides an HTML interface to the MySQL back-end.
#
# CREATE TABLE guest_book
# (
#   id            INTEGER AUTO_INCREMENT PRIMARY KEY,
#   time          DATETIME, INDEX(time),
#   visible       BOOL DEFAULT 1,
#   has_long      BOOL DEFAULT 0,
#   ipaddress     VARCHAR(255),
#   name          VARCHAR(255),
#   email         VARCHAR(255),
#   url           VARCHAR(255),
#   asl           VARCHAR(255),
#   message       TEXT,
#   full          TEXT
# );
# GRANT SELECT, INSERT ON guest_book TO guest_book@localhost;
#--
import string, cgi, os, sys, paj

#--
# Configuration
#--
per_page       = 50
max_length     = 500
detail_fields  = ['full', 'name']
form_fields    = ['asl', 'email', 'message', 'name', 'url']
display_fields = ['asl', 'has_long', 'id', 'message', 'name', 'url']
mysql_password = open('/other/home/paj/website/guestbook.password').read().strip()

#--
# Initialisation
#--
html = paj.Template('/var/www/www.pajhome.org.uk/htdocs/site/guest.html')
db = paj.MySQL_connection('localhost', 'guest_book', mysql_password, 'paj')
form = cgi.FieldStorage()

#--
# Has data been posted?
#--
if form.has_key('sign'):

  #--
  # Build a hash of data ready to go into database
  #--
  data = paj.parse_fields(form, form_fields)
  data['ipaddress'] = os.environ['REMOTE_ADDR']
  if data['url'] != '' and string.lower(data['url'][0:7]) != 'http://':
    data['url'] = 'http://' + data['url']
  data['has_long'] = len(data['message']) > max_length
  if data['has_long']:
    data['full'] = data['message']
    data['message'] = data['message'][0:max_length]

  #--
  # Check form is completed and not a duplicate
  #--
  status = None
  if len(data['name']) and len(data['message']):
    query = "SELECT %s FROM guest_book ORDER BY id DESC LIMIT 1"
    last_entry = db.select(query, ['name', 'message'])[0]
    if data['message'] == last_entry['message'] \
       and data['name'] == last_entry['name']:
      status = 'Duplicate posting blocked'
  else:
    status = 'You must enter both a name and a message'

  #--
  # If no problems, go ahead and update
  #--
  if status == None:
    query = "INSERT INTO guest_book SET time=NOW(),%s"
    db.update(query, data)
    status = 'Thank-you for signing the guest book'

    #--
    # Send me a notification email (currently disabled)
    #--
    data['time'] = paj.rfc822_date()
    #paj.sendmail(paj.Template('guest.email').get_block('', data))


#--
# Is this a detail request?
#--
elif form.has_key('detail'):
  query = "SELECT %%s FROM guest_book WHERE id=%d AND visible=1"
  detail = db.select(query % int(form['detail'].value), detail_fields)
  print "Content-type: text/html\n\n"
  print html.get_block('detail', detail[0])

  #--
  # Drop out of program here; no need to load list of messages
  #--
  sys.exit(0)

#--
# This is just a view request
#--
else:
  status = 'Please sign the guest book'

#--
# Initialise page variables
#--
page_vars = \
{
  'status':   status,
  'messages': '',
  'pagebar':  ''
}
if form.has_key('page'):
  page = int(form['page'].value)
else:
  page = 1

#--
# Load the messages from the database
#--
query = "SELECT %s FROM guest_book WHERE visible=1 ORDER BY time DESC " \
      + "LIMIT %d, %d" % ((page - 1) * per_page, per_page)
messages = db.select(query, display_fields)

#--
# Go through each message, building the output html
#--
for message in messages:
  if message['has_long'] == '1':
    message['more_link'] = html.get_block('more_link', message)
  else:
    message['more_link'] = ''
  if message['url'] != '':
    entry = html.get_block('entry', message)
  else:
    entry = html.get_block('entry_nolink', message)
  page_vars['messages'] = page_vars['messages'] + entry

#--
# Create the page bar html
#--
query = "SELECT COUNT(*) FROM guest_book WHERE visible=1";
page_vars['count'] = db.select_one(query)
for i in range(1, ((page_vars['count'] - 1) / per_page) + 2):
  if i == page:
    page_vars['pagebar'] = page_vars['pagebar'] + '<b>%d</b> ' %  i
  else:
    page_vars['pagebar'] = page_vars['pagebar'] \
                         + '<a href="guest.py?page=%d">%d</a> ' % (i, i)

#--
# Display the final page
#--
print "Content-type: text/html\n\n"
print html.get_block('', page_vars)
