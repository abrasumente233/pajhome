#!/usr/bin/perl
#--
# Mock Driving Theory Test - marking script
# Written by Paul Johnston for Ray Williams' 2pass.co.uk site, 2002
# Distributed under the BSD license.
#--
use CGI ':standard';
use Fcntl ':flock';
use File::stat;
use POSIX 'strftime';
use Socket;

#--
# Load the config file
#--
open(CONFIG, 'theory.conf') or die "open theory.conf: $!";
while(<CONFIG>)
{
  s/[\r\n]+$//;
  /^([^#]\w+)\s+=\s+(.*)$/ and $cfg{$1} = $2;
}
close(CONFIG);

#--
# Sanity checks
#--
if(!exists($cfg{'qset_'.param('qset')}))
{
  die("Invalid question set '".param('qset')."'");
}
if(defined($ENV{'HTTP_REFERER'}) and
   $ENV{'HTTP_REFERER'} !~ /$cfg{'referer'}/i)
{
  die("Invalid referer '$ENV{HTTP_REFERER}'");
}

#--
# Go through each question, building the results summary
#--
@answers = split(//, $cfg{'qset_'.param('qset')});
$data->{'attempted'} = 0;
$data->{'mark'} = 0;

for $number (1 .. $cfg{'questions'})
{
  $qdata =
  {
    'number'  => $number,
    'correct' => $answers[$number - 1],
    'answer'  => param("Q$number")
  };

  if(defined(param("Q$number")) && length($qdata->{'answer'}) > 0)
  {
    $data->{'attempted'} ++;
    if($qdata->{'answer'} eq $qdata->{'correct'})
    {
      $data->{'answers'} .= do_template($cfg{'correct_msg'}, $qdata);
      $data->{'mark'} ++;
    }
    else
    {
      $data->{'answers'} .= do_template($cfg{'incorrect_msg'}, $qdata);
    }
  }
  else
  {
    $data->{'answers'} .= do_template($cfg{'unattempted_msg'}, $qdata);
  }
}

#--
# Did they pass?
#--
$data->{'result'} = $data->{mark} >= $cfg{'pass_mark'}
                  ? $cfg{'pass_msg'} : $cfg{'fail_msg'};

#--
# Produce output
#--
print "Content-type: text/html\n\n";
print do_template(load_file("template_".param('qset').".html"), $data);

#--
# Log the details of this request
#--
open(LOG, '>>theory.log') or die "open >>theory.log: $!";
flock(LOG, LOCK_EX) or die "flock LOG: $!";

$remote_host = $ENV{'REMOTE_HOST'};
if($remote_host =~ /\d+\.\d+\.\d+\.\d+/)
{
  $remote_host = (gethostbyaddr(inet_aton($remote_host), AF_INET))[0];
}

format LOG =
@<<<<  @<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  @<<<  @<<<   @<<<
strftime("%H:%M", localtime time), $remote_host, $data->{'mark'},
                                              $data->{'attempted'}, param('qset')
.
write(LOG);
if(length(param('comment')) or length(param('email')))
{
  print LOG param('email')." ".param('comment')."\n";
}

flock(LOG, LOCK_UN);
close(LOG);

#--
# If we're on the next day from timestamp on theory.marker, then mail out logs
#--
$marker = stat('theory.marker');
if(!ref($marker) or int(time / 86400) > int($marker->mtime / 86400))
{

  #--
  # If open fails, silently do nothing. The script will retry next time.
  #--
  open(MAIL, '|/usr/bin/sendmail -t') or exit;

  $edata =
  {
    'shortdate' => strftime('%a %d %b %Y', localtime(time - 86400)),
    'maildate'  => strftime('%a, %d  %b  %Y  %H:%M:%S %z', localtime time)
  };
  print MAIL do_template(load_file('theory.email.header'), $edata);

  #--
  # Write the log file to the email program; clear out old entries
  #--
  open(LOG, '+<theory.log') or die "open +<theory.log: $!";
  flock(LOG, LOCK_EX) or die "flock LOG: $!";

  print MAIL while(<LOG>);
  close(MAIL);

  truncate(LOG, 0) or die("truncate LOG: $!");
  flock(LOG, LOCK_UN);
  close(LOG);

  #--
  # Touch the marker file
  #--
  open(MARKER, '>theory.marker') or die("open >theory.marker: $!");
  close(MARKER);
}

#--
# Apply a substitution template to a string
# The string has $$key replaced with value for all hash entries.
#--
sub do_template
{
  my ($str, $tab) = @_;
  $str =~ s/\$\$(\w+)/$tab->{$1}/ge;
  return $str;
}

#--
# Load a file
#--
sub load_file
{
  open(FILE, $_[0]) or die "open $_[0]: $!";
  my $data = join('', <FILE>);
  close(FILE);
  return $data;
}
