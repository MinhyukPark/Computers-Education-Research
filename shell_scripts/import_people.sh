# /usr/bin/zsh

source ../node_scripts/.env
# mongo $DB_URI
mongoimport --uri $LOCAL_URI --file people.json
# mongoexport --username USER --password PASS --host HOST --db DB --collection COLLECTION --out intellij.json
