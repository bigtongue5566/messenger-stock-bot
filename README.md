# messenger-stock-bot

使用[facebook-chat-api](https://github.com/Schmavery/facebook-chat-api)建立

使用個人帳號因此chatbot可以加入群組

## 使用方法

### forever

`forever start app.js`

### pm2

`pm2 start app.js`

### docker

- build

        docker build -t messenger-stock-bot .
	
- create volume

        docker volume create --name stock-bot
	
- run image

    沒開雙因子認證

        docker run -d --restart=always --cap-add=SYS_ADMIN --env-file env.list -v stock-bot:/home/pptruser/app/data --name bot messenger-stock-bot

    有開雙因子認證

        docker run -it --restart=always --cap-add=SYS_ADMIN --env-file env.list -v stock-bot:/home/pptruser/app/data --name bot messenger-stock-bot
