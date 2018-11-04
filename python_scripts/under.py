import sys
import matplotlib.pyplot as plt

e = []
c = []

with open(sys.argv[1], 'r') as f:
    line = f.readline()
    is_e = True
    line_no = 1
    while line:
        if(is_e):
            e.append(line.split('@')[0])
        else:
            c.append(float(line))
        is_e = not is_e
        line = f.readline()
        print(line_no)
        line_no += 1 

     
    
plt.scatter(e, c)    
plt.show()
