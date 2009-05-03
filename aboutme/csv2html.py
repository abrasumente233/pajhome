import csv, sys

for row in csv.reader(open(sys.argv[1])):
    print '<tr>%s</tr>' % ''.join(['<td>%s</td>' % c for c in row])
    
    