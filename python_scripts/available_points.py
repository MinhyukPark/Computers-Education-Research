import sys
import matplotlib.pyplot as plt
from sklearn import linear_model
from datetime import datetime
from dateutil.parser import parse
import numpy as np
import matplotlib.dates as mdates
import matplotlib.cbook as cbook
import matplotlib.patches as mpatches
from sklearn import datasets
from sklearn.metrics import mean_squared_error, r2_score
import calendar

from numpy import dot
from numpy.linalg import solve
from numpy.polynomial.polynomial import Polynomial as P, polyvander as V
from scipy.linalg import qr 
from scipy.stats import linregress


months = mdates.MonthLocator()
days = mdates.DayLocator()
monthsFmt = mdates.DateFormatter('%m')
daysFmt = mdates.DateFormatter('%m-%d')

t = []
c = []
s = []
change = []
cur_student = ""
with open(sys.argv[1], 'r') as f:
    line = f.readline()
    is_t = False
    is_c = False
    is_s = False
    is_change = False
    line_no = 1
    while line:
        if("timestamps" in line):
            is_t = True
            is_c = False
            is_s = False 
            is_change = False
            line = f.readline()
            continue
        if("class" in line):
            is_t = False
            is_c = True
            is_s = False 
            is_change = False
            line = f.readline()
            continue
        if('@' in line):
            is_t = False
            is_c = False
            is_s = True 
            is_change = False
            cur_student = "sample student"
            line = f.readline()
            continue
        if('change' in line):
            is_t = False
            is_c = False
            is_s = False 
            is_change = True
            line = f.readline()
            continue
        if(is_t):
            date_line = parse(line)
            t.append(date_line)
        elif(is_c):
            c.append(float(line))
        elif(is_s):
            s.append(float(line))
        elif(is_change):
            change.append(line.strip())
        line = f.readline()
        line_no += 1 

fig, ax = plt.subplots()

## print separate components here
color_dict = {'MPs': '#ffa659',
              'lectures': '#f2ccff',
              'extra': '#969696',
              'homework': '#fcc5b8',
              'quizzes': '#fff963',
              'labs': '#8eff90',
              'exams': '#28acff',
               'class': '#1c0623'}

ax.plot(t, c, color=color_dict['class'])
for i in range(len(s)):
    start = i
    end = -1
    start_label = change[start]
    for j in range(start, len(s)):
        if(start_label == '0'):
            if(change[j] != 0):
                start_label = change[j]
        elif(start_label == change[j]):
            pass
        else:
            end = j
            i = j
            j = len(s)
    if(start_label == '0' and i == (len(s) - 1) or end == -1):
        print("ah")
    else:
        print((start, end))
        ax.plot(t[start:end], s[start:end], color=color_dict[start_label])

lecture_patch = mpatches.Patch(color=color_dict['lectures'], label='lectures')
extra_patch = mpatches.Patch(color=color_dict['extra'], label='extra')
homework_patch = mpatches.Patch(color=color_dict['homework'], label='homework')
quizzes_patch = mpatches.Patch(color=color_dict['quizzes'], label='quizzes')
labs_patch = mpatches.Patch(color=color_dict['labs'], label='labs')
exams_patch = mpatches.Patch(color=color_dict['exams'], label='exams')
MPs_patch = mpatches.Patch(color=color_dict['MPs'], label='MPs')
class_patch = mpatches.Patch(color=color_dict['class'], label='class total available points')
ax.legend(loc="upper left", handles=[lecture_patch, extra_patch, homework_patch, quizzes_patch, labs_patch, exams_patch, MPs_patch, class_patch])
# format the ticks
ax.xaxis.set_major_locator(months)
ax.xaxis.set_major_formatter(monthsFmt)
ax.xaxis.set_minor_locator(plt.MaxNLocator(10))
# ax.xaxis.set_minor_locator(days)
ax.xaxis.set_minor_formatter(daysFmt)

ax.format_xdata = mdates.DateFormatter('%Y-%m-%d')
ax.grid(True)

# ax.legend(["class", cur_student], loc="upper left")

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

def getRegressionScore(cur_split_index, nor_t, s):
    print(nor_t[cur_split_index:])
    print(s[cur_split_index:])
    res = linregress(nor_t[cur_split_index:], s[cur_split_index:])
    return res
    '''
    return r2_score(flat_t[cur_split_index:], s[cur_split_index:]) 
    '''

def checkDeviation(s):
    baseline = s[len(s) - 1]
    for cur in s:
        if(abs(cur - baseline) > (baseline * 0.05)):
            return False
    return True 
        


cur_score = 0.0 
cur_split_index = len(s) - 1
nor_t = np.array([calendar.timegm(x.timetuple()) for x in t])
nor_t = nor_t[:len(s)]
result = True
while(result):
    result = checkDeviation(s[cur_split_index:])
    cur_split_index -= 1
    if(cur_split_index == -1):
        break

if(cur_split_index != -1):
    ax.plot(t[cur_split_index + 2:len(s)], s[cur_split_index + 2:], color='red', linewidth=2)
    print(t[cur_split_index + 2]),
    print("    "),
    print(t[len(s) - 1])
    print("    "),
    #print(cur_student)
        


'''


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
'''

plt.show()




