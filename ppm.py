import sys 
import matplotlib.pyplot as plt 

t = []
r = []

with open(sys.argv[1], 'r') as f:
    line = f.readline()
    is_t = True
    line_no = 1 
    while line:
        if(is_t):
            t.append(line)
        else:
            r.append(float(line))
        is_t = not is_t
        line = f.readline()
        line_no += 1 

    
plt.scatter(t, r)    
plt.show()
