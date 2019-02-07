# CS125-Node-Mongo
Let's Change Education in CS! :heart:
## Introduction
#### What is this project?
Coming soon

#### Great! How can I help?
Email me at minhyuk2@illinois.edu and I would love to talk more about ways for you to get involved! 
## Dependencies

##### Module Constants Dependencies
[dotenv](https://github.com/motdotla/dotenv) - used for storing sensitive data as node environment variables

##### Module Common Dependencies
[constants](../node_scripts/constants.js) - common constants

[mongodb](https://github.com/mongodb/node-mongodb-native) - used for connecting to MongoDB

[lodash](https://github.com/lodash/lodash) - used for useful utility functions such as map or reduce

[chai](https://github.com/chaijs/chai) - used for simple assert statements

[moment](https://github.com/moment/moment) - used for formatting UNIX dates

[data-store](https://github.com/jonschlinkert/data-store) - used for caching pre-processed data on disk

##### Project-Wide Dependencies
[dotenv](https://github.com/motdotla/dotenv) - used for storing sensitive data as node environment variables

[node-correlation](https://github.com/drodrigues/node-correlation) - used for getting the correlation of two lists

[mongodb](https://github.com/mongodb/node-mongodb-native) - used for connecting to MongoDB

[spearman-rho](https://github.com/ericrange/spearman-rho) - used for getting the spearman-rho correlation of two lists

[simple-statistics](https://github.com/simple-statistics/simple-statistics) - used for basic statiscal tests such as two sample t test

[ml-knn](https://github.com/mljs/knn) - used for k means clustering

[data-store](https://github.com/jonschlinkert/data-store) - used for caching pre-processed data on disk

[moment](https://github.com/moment/moment) - used for formatting UNIX dates

[chai](https://github.com/chaijs/chai) - used for simple assert statements

[lodash](https://github.com/lodash/lodash) - used for useful utility functions such as map or reduce
## Style Guide
A lot has changed since I first started this project.

Currently I am exposing all the common functions and constants I need  through common.js. To see how to use the common module, there's a skeleton file [skeleton.js](../node_scripts/skeletor.js).


## Files
\[insert\_word\].py
- reads an input file and visualizes them
- the python files are not very polished and they are nothing more than quick scripts to make calls to matplotib.

attendance.js
- Finding any kind of significance between class attendance and other class metric

available\_points.js
- Available points for each student vs class total

common.js
- Common function

constants.js
- Common constants - to be called through the common module

drop.js
- Performs k means analysis of students to determine the likelihood a student will drop the course

example.js
- example javascript file

last\_active.js
- Outputting the last day on which a student was active

ppm.js
- Calculates the amount of points a student earned in a given amount of time on a specified assignment, split up by intervals of minutes, five minutes, or other values.

ppm\_local.js
- heavily optimized version of ppm.js

last\_active.js
- determines the last active day of any given student by measuring numerous metrics

ppm.py
- parser used for ppm output files resembling attendance.py structure

skeleton.js
- Skeleton file for basic javascript

under.js
- Get bottom N% of students in MP performance

\[export/import\]\_\[collection\].sh
- exports/imports the specified collection from remote to local
