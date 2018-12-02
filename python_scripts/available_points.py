import sys
import matplotlib.pyplot as plt
from sklearn import linear_model
from datetime import datetime
from dateutil.parser import parse
import numpy as np
import matplotlib.dates as mdates
import matplotlib.cbook as cbook

months = mdates.MonthLocator()
days = mdates.DayLocator()
monthsFmt = mdates.DateFormatter('%m')
daysFmt = mdates.DateFormatter('%m-%d')

t = []
c = []
s = []
cur_student = ""
with open(sys.argv[1], 'r') as f:
    line = f.readline()
    is_t = False
    is_c = False
    is_s = False
    line_no = 1
    while line:
        if("timestamps" in line):
            is_t = True
            is_c = False
            is_s = False 
            line = f.readline()
            continue
        if("class" in line):
            is_t = False
            is_c = True
            is_s = False 
            line = f.readline()
            continue
        if('@' in line):
            is_t = False
            is_c = False
            is_s = True 
            cur_student = "sample student"
            line = f.readline()
            continue
        if(is_t):
            date_line = parse(line)
            t.append(date_line)
        elif(is_c):
            c.append(float(line))
        elif(is_s):
            s.append(float(line))
        line = f.readline()
        print(line_no)
        line_no += 1 
 

fig, ax = plt.subplots()
ax.plot(t, c)
ax.plot(t, s)

# format the ticks
ax.xaxis.set_major_locator(months)
ax.xaxis.set_major_formatter(monthsFmt)
ax.xaxis.set_minor_locator(plt.MaxNLocator(10))
# ax.xaxis.set_minor_locator(days)
ax.xaxis.set_minor_formatter(daysFmt)

ax.format_xdata = mdates.DateFormatter('%Y-%m-%d')
ax.grid(True)

ax.legend(["class", cur_student], loc="upper left")
plt.show()

