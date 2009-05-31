import glob, Image, os
from jpeg import jpeg

for p in glob.glob('*.jpg'):
    img = Image.open(p)
    w,h = img.size
    if w == 160 or h == 160:
        continue
    new_w = w > h and 160 or 120
    newsize = (new_w, h * new_w / w)
    img = img.resize(newsize, Image.ANTIALIAS)
    comment = jpeg.getComments(p)
    img.save(p)
    jpeg.setComments(comment, p)
