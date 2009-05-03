import glob, Image, os

for p in glob.glob('c:/paj/my pictures/se asia/chi phat/cropped/*.jpg'):
    img = Image.open(p)
    w,h = img.size
    img = img.resize((160, 160*h/w), Image.ANTIALIAS)
    img.save(os.path.basename(p))
    img = img.resize((100, 100*h/w), Image.ANTIALIAS)
    img.save(os.path.basename(p)[:-4] + '_mini.jpg')
