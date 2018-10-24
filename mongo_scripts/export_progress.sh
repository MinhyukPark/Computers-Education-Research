# /usr/bin/zsh

source ../.env
# mongo $DB_URI
mongoexport --uri $DB_URI --collection progress --out progress.json
# mongoexport --username USER --password PASS --host HOST --db DB --collection COLLECTION --out intellij.json
