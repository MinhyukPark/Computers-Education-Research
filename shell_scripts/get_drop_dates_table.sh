#/bin/sh

cd ../node_scripts
rm ../output/email_drop_dates_table.out
for i in {0..230}
do
    echo $i
    node available_points.js $i > ../output/temp.out
    python ../python_scripts/available_points.py ../output/temp.out >> ../output/email_drop_dates_table.out
done
rm ../output/temp.out
