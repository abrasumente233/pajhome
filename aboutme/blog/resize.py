import glob, Image, os
from jpeg import jpeg

for p in glob.glob('*.jpg'):
    img = Image.open(p)
    w,h = img.size
    if w == 160 or h == 160:
        continue
    newsize = w > h and (160, 120) or (120, 160)
    img = img.resize(newsize, Image.ANTIALIAS)
    comment = jpeg.getComments(p)
    img.save(p)
    jpeg.setComments(comment, p)
