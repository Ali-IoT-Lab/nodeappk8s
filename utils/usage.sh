#!/bin/bash

cpuUsage=`top -b -n 1 |grep Cpu|awk NR==1|cut -d ',' -f 4|awk -F ' ' '{print $1}'|awk -F '%' '{print $1}'`
memTotal=`free | awk 'NR==2{print $2}'`
memFree=`free | awk 'NR==2{print $4}'`
rest=`free|grep 'buff/cache'`

if [[ -z "$rest" ]] ; then
memBuff=`free|awk 'NR==2{print $6}'`
memCach=`free | awk 'NR==2{print $7}'`
memUnused=`expr $memFree + $memBuff + $memCach`
memUsed=`expr $memTotal - $memUnused`
else
memBuffCach=`free | awk 'NR==2{print $6}'`
memUnused=`expr $memFree + $memBuffCach`
memUsed=`expr $memTotal - $memUnused`
fi

memUsage=`awk 'BEGIN{printf "%.2f\n",'$memUsed'/'$memTotal'}'`

echo "{\"cpuUsage\":\"$cpuUsage\",\"memUsage\":\"$memUsage\"}"