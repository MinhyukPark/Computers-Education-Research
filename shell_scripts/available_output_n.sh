#/bin/sh

cd ../node_scripts
for i in {0..10}
do
    node available_points.js > ../output/active_available_time_$i.out;
    python ../python_scripts/available_points.py ../output/active_available_time_$i.out &
done
