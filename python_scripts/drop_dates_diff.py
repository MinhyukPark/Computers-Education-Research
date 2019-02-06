import sys
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

a = []
e = []
d = []

with open(sys.argv[1], 'r') as f:
    line = f.readline()
    line_no = 1
    while line:
        cur = line.split("    ")
        e.append(mdates.date2num(datetime.fromisoformat(cur[0].strip())))
        a.append(mdates.date2num(datetime.fromisoformat(cur[1].strip())))
        
        line = f.readline()
        print(line_no)
        line_no += 1 
d = [(x - y) for x,y in zip(a, e)]
for c in d:
    print(c)
fig,ax = plt.subplots(1, 1)
bins = int(len(d) / 4)
ax.hist(d, alpha = 0.5, label = "roster", bins = bins)

#ax.xaxis.set_major_locator(mdates.AutoDateLocator())
#ax.xaxis.set_major_formatter(mdates.DateFormatter("%m.%d"))

ax.legend(loc = 'upper right')
plt.show()
