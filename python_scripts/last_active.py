import sys
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np
import matplotlib.dates as mdates

d = []

with open(sys.argv[1], 'r') as f:
    line = f.readline()
    is_d = False 
    line_no = 1
    while line:
        if(is_d):
            d.append(int(line) / 1000)
        is_d = not is_d
        line = f.readline()
        print(line_no)
        line_no += 1 

print d     
min_time = min(d) 
max_time = max(d)

min_day = int((min_time / (60 * 60 * 24) * 60 * 60 * 24))    
max_day = int((max_time / (60 * 60 * 24) * 60 * 60 * 24))    

# print datetime.fromtimestamp(min_time)
# print datetime.fromtimestamp(max_time)
# print datetime.fromtimestamp(min_day)
# print datetime.fromtimestamp(max_day)
bins = len(np.arange(min_day, max_day, 60 * 60 * 24))
# for bin in bins:
#     print datetime.fromtimestamp(bin)
fig, ax = plt.subplots(1, 1)
ax.hist(mdates.epoch2num(d), bins = bins)
# ax.axis([min_day, max_day, 0, 10])
ax.xaxis.set_major_locator(mdates.AutoDateLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter('%m.%d'))
plt.show()
