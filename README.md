# messenger-stock-bot

facebook 個人帳號台股機器人 

- 文字與圖片模式
- 查詢個股即時報價
- 查詢大盤走勢
- 三大法人買賣金額


## 展示圖

![Imgur](https://imgur.com/crpdFGh.gif)

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
