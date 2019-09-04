# messenger-stock-bot

使用pm2或是forever

## forever

`forever start app.js`

## pm2

`pm2 start app.js`

## docker

- build

        docker build -t messenger-stock-bot .
	
- run image

        docker volume create --name stock-bot

    沒開雙因子認證

        docker run -d --restart=always --cap-add=SYS_ADMIN --env-file env.list -v stock-bot:/home/pptruser/app/data --name bot messenger-stock-bot

    有開雙因子認證

        docker run -it --restart=always --cap-add=SYS_ADMIN --env-file env.list -v stock-bot:/home/pptruser/app/data --name bot messenger-stock-bot
