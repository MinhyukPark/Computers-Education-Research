# CS125-Node-Mongo
Let's Change Education in CS! :heart:
## Introduction
#### What is this project about and why is it important?
The field of education in Computer Science is severely lagging behind other disciplines such as math, literature, or history. Computer Science is distinguished by the way its concepts evolve. Notions of absolutes or static set-in-stone ideas do not exist in the world of Computer Science. This unique alacrity of motion leads to textbooks, course material, and pre-defined ways of teaching becoming obsolete faster than any other disciplines. In a traditional math classroom, iteration leads to success. A course becomes more successful by repeating what worked best in previous years. In a Computer Science classroom, iteration is at most a useful Computer Science concept and at worst a principle one should avoid. Repeating the same lecture with the same material leads to boredom and degeneration. What Computer Science classrooms needs today is a new way of teaching. A new way of teaching that augments education with Computer Science. A cycilcial model in which traditional education is bolstered using tools such as continuous integration and data analytics of Computer science while Computer Science is enriched using years and years of historical research data on how effectively humans learn.

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

Currently I am exposing all the common functions and constants I need  through common.js. To see how to use the common module, refer to the way [last\_active.js](../node_scripts/last_active.js) interacts with [common.js](../node_scripts/common.js) and [constants.js](../node_scripts/constants.js).


## Files
attendance.py
- reads an input file of alternating rows of number data and plots them on a 2d plane

attendance.js
- prints numbers to stdout in alternating rows of whatever the user decided to query such as parsing quizzes 9 through 12 of only beginners in the class.

drop.js
- performs k means analysis of students to determine the likelihood a student will drop the course

ppm.js
- calculates the amount of points a student earned in a given amount of time on a specified assignment, split up by intervals of minutes, five minutes, or other values.

ppm\_local.js
- heavily optimized version of ppm.js

last\_active.js
- determines the last active day of any given student by measuring numerous metrics

ppm.py
- parser used for ppm output files resembling attendance.py structure

\[export/import\]\_\[collection\].sh
- exports/imports the specified collection from remote to local
