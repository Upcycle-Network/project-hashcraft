docker compose down
git pull https://github.com/Upcycle-Network/project-hashcraft.git main
docker rmi hashcraft -f
docker build -t hashcraft .
docker compose up -d