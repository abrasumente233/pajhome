#--
# fbphoto version 0.2
# Match pictures on your local computer with pictures uploaded to Facebook.
# Copyright Paul Johnston 2009, distributed under the BSD license.
# More information: http://pajhome.org.uk/web/facebook/fbphoto.html
#--
import urllib2 as ul, re, glob, os, Image, time, operator, sys, threading
import optparse, shutil
from jpeg import jpeg

src = re.compile('<a href="(http://.*?)".*?><img src="(http://photos-.*?\.jpg)"')
thumbs_per_page = 20
samp_spot = (10,10)
threads = 5
match_cutoff = 4300
subdir = 'fbphoto'


class Thumb(object):
    @property
    def img(self):
        try:
            return self._img
        except AttributeError:
            self._img = Image.open(os.path.join(workdir, self.fname))
            return self._img

class FbThumb(Thumb):
    def __init__(self, fname, fburl, fbthumb):
        self.fname = fname
        self.fburl = fburl
        self.fbthumb= fbthumb

    def __str__(self):
        return self.fname + ' ' + self.fburl + ' ' + self.fbthumb

class LocThumb(Thumb):
    def __init__(self, fname, orig_name):
        self.fname = fname
        self.orig_name = orig_name


def fb_fetch(url):
    '''
    Fetch thumbnails from facebooks
    Start with a fb public album url
    Create a directory that contains all the thumbnails,
    and a file that maps thumbnail name to fb public photo url
    '''

    lpath = os.path.join(workdir, 'fblinks.txt')
    if os.path.exists(lpath):
        fb_thumbs = [FbThumb(*l.split()) for l in open(lpath)]
    else:
        img_num = 1
        page = 1
        fb_thumbs = []
        while True:
            if options.verbose:
                print "Fetching album index... [%d]" % page
            html = ul.urlopen(url + '&page=%d' % page).read()
            html = html.replace('&amp;', '&')
            page_cnt = 0
            lastpos = 0
            while True:
                m = src.search(html, lastpos)
                if not m:
                    break
                lastpos = m.end(0)
                page_cnt += 1
                fb_thumbs.append(FbThumb('f%d.jpg' % img_num, m.group(1), m.group(2)))
                img_num += 1
            if page_cnt < thumbs_per_page:
                break
            page += 1
        if not fb_thumbs:
            raise Exception('No images found - check album URL')
        fh = open(lpath, 'w')
        fh.write('\n'.join(str(ft) for ft in fb_thumbs))
        fh.close()

    fts = list(fb_thumbs)
    thrd = []
    for i in range(threads):
        t = ThumbFetcher()
        t.thumbs = fts
        thrd.append(t)
        t.start()
    for t in thrd:
        t.join()

    return fb_thumbs


class ThumbFetcher(threading.Thread):
    def run(self):
        while True:
            try:
                ft = self.thumbs.pop()
            except IndexError:
                return
            if not os.path.exists(os.path.join(workdir, ft.fname)):
                if options.verbose:
                    print "Fetching thumbnail... (%d to go)" % (len(self.thumbs) + 1)
                data = ul.urlopen(ft.fbthumb).read()
                fh = open(os.path.join(workdir, ft.fname), 'wb')
                fh.write(data)
                fh.close()


def resize(picdir, fb_thumbs):
    '''
    Resize all the local pictures, to the thumbnail size that best matches
    their aspect ratio.
    '''
    dimens = {}
    for t in fb_thumbs:
        w,h = t.img.size
        dimens[float(w)/h] = (w,h)
    loc_thumbs = []
    picfiles = glob.glob(picdir + '/*.jpg')
    for i,p in enumerate(picfiles):
        lt = LocThumb('l%d.jpg' % (i+1), os.path.basename(p))
        loc_thumbs.append(lt)
        if not os.path.exists(os.path.join(workdir, lt.fname)):
            if options.verbose:
                print "Resizing... [%d/%d]" % (i+1, len(picfiles))
            img = Image.open(p)
            w,h = img.size
            # find closest matching aspect ratio
            dims = sorted((((d-float(w)/h)**2, dimens[d]) for d in dimens), key=lambda x: x[0])
            img = img.resize(dims[0][1]) # Image.ANTIALIAS removed for speed
            img.save(os.path.join(workdir, lt.fname))
    return loc_thumbs


def match_thumb(fb_thumbs, loc_thumbs, picdir):
    '''
    Match local thumbnails to facebook thumbnails.
    The algorithm used here is quite rough and ready, but reasonably reliable
    and performant. Local thumbnails are indexed, based on a sample spot. As each
    facebook thumbnail is examined, the most likely matches are those with the
    closest colour on the sample spot. Image comparison is done by the average
    sum of squares difference, for each colour and pixel. Experience shows that
    a value below 4300 usually indicates a match.
    '''
    diff = lambda a,b: (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2
    def img_diff(x, y):
        xd = x.getdata()
        yd = y.getdata()
        if len(yd) > len(xd):
            yd = list(yd)[:len(xd)]
        if len(xd) > len(yd):
            xd = list(xd)[:len(yd)]
        return reduce(operator.add, map(diff, xd, yd)) / len(xd)
    samp_idx = {}
    for t in loc_thumbs:
        samp_idx.setdefault(t.img.getpixel(samp_spot), []).append(t)
    matches = []
    for i,fb_thumb in enumerate(fb_thumbs):
        if options.verbose:
            print "Matching... [%d/%d]" % (i+1, len(fb_thumbs))
        likely = [(diff(fb_thumb.img.getpixel(samp_spot), s), samp_idx[s]) for s in samp_idx]
        likely.sort(key = lambda x: x[0])
        match = None
        for x,y in likely:
            for loc_thumb in y:
                if img_diff(fb_thumb.img, loc_thumb.img) < match_cutoff:
                    match = loc_thumb
                    break
            if match:
                break
        if match:
            matches.append((fb_thumb, loc_thumb))
        else:
            print "Warning - no match for %s" % fb_thumb.fname
    matches.sort(key = lambda x: x[1].orig_name.lower())

    for ft,lt in matches:
        jpeg.setComments(ft.fburl, os.path.join(picdir, lt.orig_name))

    fh = open(os.path.join(workdir, 'check.html'), 'w')
    tmpl = '<img src="%s"/><img src="%s"/><br/>'
    cont = '\n'.join(tmpl % (ft.fname, lt.fname) for ft,lt in matches)
    fh.write('<html><body>%s</body></html>' % cont)
    fh.close()


parser = optparse.OptionParser(usage="usage: %prog [options] fb_url [path]")
parser.add_option("-d", "--debug", dest="debug", action='store_true',
        help='Debug mode - keeps the fbphoto subdirectory after the script has finished')
parser.add_option("-v", "--verbose", dest="verbose", action='store_true',
        help='Verbose output')
(options, args) = parser.parse_args()
url = args[0] if len(args) >= 1 else None
picdir = args[1] if len(args) >= 2 else '.'

workdir = os.path.join(picdir, subdir)
if not os.path.exists(workdir):
    os.mkdir(workdir)

start = time.time()
print "Fetching..."
fb_thumbs = fb_fetch(url)
fetch_time = time.time() - start
print "Resizing..."
loc_thumbs = resize(picdir, fb_thumbs)
resize_time = time.time() - start - fetch_time
print "Matching..."
match_thumb(fb_thumbs, loc_thumbs, picdir)
match_time = time.time() - start - fetch_time - resize_time

print "Timings: fetch %ds, resize %ds, match %ds" % (fetch_time, resize_time, match_time)

if not options.debug:
    shutil.rmtree(workdir)
