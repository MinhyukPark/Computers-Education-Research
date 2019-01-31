import sys
import matplotlib.pyplot as plt
from sklearn import linear_model
from datetime import datetime
from dateutil.parser import parse
import numpy as np
import matplotlib.dates as mdates
import matplotlib.cbook as cbook
from sklearn import datasets
from sklearn.metrics import mean_squared_error, r2_score
import calendar

from numpy import dot
from numpy.linalg import solve
from numpy.polynomial.polynomial import Polynomial as P, polyvander as V
from scipy.linalg import qr 


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
        line_no += 1 

fig, ax = plt.subplots()
ax.plot(t, c)
ax.plot(t[:len(s)], s)

# format the ticks
ax.xaxis.set_major_locator(months)
ax.xaxis.set_major_formatter(monthsFmt)
ax.xaxis.set_minor_locator(plt.MaxNLocator(10))
# ax.xaxis.set_minor_locator(days)
ax.xaxis.set_minor_formatter(daysFmt)

ax.format_xdata = mdates.DateFormatter('%Y-%m-%d')
ax.grid(True)

ax.legend(["class", cur_student], loc="upper left")

# regression stuff
def getBestRegressionScore(cur_num_line, t, s):
    if(cur_num_line == 1):
        return getBestRegressionScore_1(t, s)
    elif(cur_num_line == 2):
        return getBestRegressionScore_2(t, s)

def getBestRegressionScore_1(t, s):
    regr = linear_model.LinearRegression()
    regr.fit(t, s)
    regr_y = regr.predict(t)
    return [r2_score(s, regr_y), -1]

def getBestRegressionScore_2(t, s):
    best_score = 0
    best_split = -1
    best_shifter = 0
    for cur_split_index in range(10, len(t) - 10):

        regr = linear_model.LinearRegression(fit_intercept = True)
        regr.fit(t[:cur_split_index], s[:cur_split_index])
        regr_y = regr.predict(t[:cur_split_index])
        left_score = r2_score(s[:cur_split_index], regr_y)

         
        shifter = regr_y[len(regr_y) - 1]
        regr = linear_model.LinearRegression(fit_intercept = False)
        regr.fit(t[cur_split_index:], s[cur_split_index:] - shifter)
        regr_y = regr.predict(t[cur_split_index:])
        right_score = r2_score(s[cur_split_index:], regr_y + shifter)
     
        cur_score = (left_score + right_score) / 2
        # print(cur_score)
        if(cur_score > best_score):
            best_score = cur_score
            best_split = cur_split_index
            best_shifter = shifter
    return [best_score, best_split]

cur_score = 0
cur_split_index = 0
cur_num_line = 1
nor_t = np.array([calendar.timegm(x.timetuple()) for x in t]).reshape(-1, 1)
nor_t = nor_t[:len(s)]

while(cur_score < 0.9):
    result = getBestRegressionScore(cur_num_line, nor_t, s)
    if(result == None):
        break
    cur_score = result[0]
    cur_split_index = result[1]
    cur_num_line += 1 



if(cur_split_index == -1):
    regr = linear_model.LinearRegression()
    regr.fit(nor_t, s)
    regr_y = regr.predict(nor_t)
    ax.plot(t[:len(s)], regr_y, color='red', linewidth=2)
else:
    regr = linear_model.LinearRegression(fit_intercept = True)
    regr.fit(nor_t[:cur_split_index], s[:cur_split_index])
    print (regr.intercept_)
    regr_left_y = regr.predict(nor_t[:cur_split_index])

 
    shifter = regr_left_y[len(regr_left_y) - 1]
    print(regr_left_y)
    regr = linear_model.LinearRegression(fit_intercept = False)
    regr.fit(nor_t[cur_split_index:], s[cur_split_index:] - shifter)
    print (regr.intercept_)
    regr_right_y = regr.predict(nor_t[cur_split_index:]) + shifter
    print (regr_right_y)

    ax.plot(t[:cur_split_index], regr_left_y, color='blue', linewidth=2)
    ax.plot(t[cur_split_index:len(s)], regr_right_y, color='red', linewidth=2)

plt.show()




