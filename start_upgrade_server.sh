#!/usr/bin/env bash

kill $(ps aux | grep 'node apkupdater.js' | awk '{print $2}')

npm install

nohup node apkupdater.js &
