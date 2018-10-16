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
            t.append(float(line))
        else:
            r.append(float(line))
        is_t = not is_t
        line = f.readline()
        print(line_no)
        line_no += 1 

    
    
plt.plot(t, r)    
plt.show()
