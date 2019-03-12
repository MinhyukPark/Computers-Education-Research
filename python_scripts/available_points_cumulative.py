import sys
import plotly as py
from plotly.graph_objs import *
import plotly.graph_objs as go
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


NROW = 148 + 1 + 1
spec = []
for i in range(NROW):
    spec.append([{}])

#plotly_fig = py.tools.make_subplots(rows=NROW, cols=1, specs=spec, shared_xaxes=True, shared_yaxes=True, vertical_spacing=0.001)

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
    line = f.readline().strip()
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
            c.append(line)
        elif(is_s):
            s.append(line)
        elif(is_change):
            change.append(line.strip())
        line = f.readline()
        line_no += 1 



## print separate components here
color_dict = {'MPs': '#ffa659',
              'lectures': '#f2ccff',
              'extra': '#969696',
              'homework': '#fcc5b8',
              'quizzes': '#fff963',
              'labs': '#8eff90',
              'exams': '#28acff',
               'class': '#1c0623',
               'post_drop': 'rgb(255,0,0)'}

#plotly_fig.append_trace(class_data, 1, 1)

class_trace = go.Bar(x=c[::2], y=c[1::2], name="class")
student_trace = go.Bar(x=s[::2], y=s[1::2], name="student")


layout = go.Layout(barmode='stack', title="available points")
fig = Figure(data = [class_trace, student_trace], layout = layout)
py.offline.plot(fig)

