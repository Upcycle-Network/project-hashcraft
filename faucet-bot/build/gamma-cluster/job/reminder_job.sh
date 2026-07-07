#!/data/data/com.termux/files/usr/bin/bash
#termux-job-scheduler --job-id 1 --script /data/data/com.termux/files/home/reminder_job.sh --period-ms 900000 --network any --peristed true 
for i in {1..5}; do
node --env-file=/data/data/com.termux/files/home/project-hashcraft/faucet-bot/.env /data/data/com.termux/files/home/project-hashcraft/faucet-bot/src/eventHandler.js reminder true
done