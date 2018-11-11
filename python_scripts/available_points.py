import sys
import matplotlib.pyplot as plt

c = []
s = []
cur_student = ""
with open(sys.argv[1], 'r') as f:
    line = f.readline()
    is_c = True
    line_no = 1
    while line:
        if('@' in line):
            is_c = False
            cur_student = "sample student"
        elif(is_c):
            c.append(float(line))
        else:
            s.append(float(line))
        line = f.readline()
        print(line_no)
        line_no += 1 

     
    
plt.plot(c)    
plt.plot(s)    
plt.legend(["class", cur_student], loc="upper left")
plt.show()
