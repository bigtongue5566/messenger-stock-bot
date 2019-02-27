# messenger-stock-bot

- build

        docker build -t messenger-stock-bot .

- save/load

	    docker save messenger-stock-bot > bot.tar

	    docker load < bot.tar
	
- run image

        docker volume create --name stock-bot

    沒開雙因子認證

        docker run -d --restart=always --cap-add=SYS_ADMIN --env-file env.list -v stock-bot:/home/pptruser/app/data --name bot messenger-stock-bot

    有開雙因子認證

        docker run -it --restart=always --cap-add=SYS_ADMIN --env-file env.list -v stock-bot:/home/pptruser/app/data --name bot messenger-stock-bot

- 強制刪除container

        docker rm -f bot

- 刪除所有container

        docker rm $(docker ps -aq)

- 刪除image

        docker rmi messenger-stock-bot

- 刪除所有images

        docker rmi -f $(docker images -aq)
