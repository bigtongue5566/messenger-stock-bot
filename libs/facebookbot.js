const fs = require('fs');
const log = require('npmlog');
const login = require('facebook-chat-api');
const readline = require('readline');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const loginOptions = {
    forceLogin: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
}
class FacebookBot {
    constructor(filePath){
        this.filePath = filePath
    }
    async exit() {
        log.info("exit", new Date().toUTCString());
        process.exit();
    }
    async getFriendsList() {
        return new Promise((resolve, reject) => {
            this.api.getFriendsList((err, data) => {
                if (err) return console.error(err);
                resolve(data)
            });
        })
    }
    async getThreadInfo(threadID) {
        return new Promise((resolve, reject) => {
            this.api.getThreadInfo(threadID, (err, info) => {
                if (err) return console.error(err);
                resolve(info);
            });
        })
    }
    async markAsRead(threadID) {
        return new Promise((resolve, reject) => {
            this.api.markAsRead(threadID, (err) => {
                if (err && err.error === 1357004) this.exit();
                if (err) console.error(err);
                resolve();
            });
        });
    }


    async getTwoFactorCode() {
        return new Promise((resolve, reject) => {
            console.log('Enter code > ');
            rl.on('line', (line) => {
                rl.close();
                resolve(line);
            })
        })
    }

    async loginByPassword(credentials) {
        return new Promise((resolve, reject) => {
            login(credentials, loginOptions, (err, api) => {
                if (err) {
                    switch (err.error) {
                        case 'login-approval':
                            this.getTwoFactorCode().then(code => {
                                return err.continue(code)
                            }).then(() => {
                                resolve(api);
                            });
                            break;
                        default:
                            console.error(err);
                            reject(err);
                    }
                    return
                }
                resolve(api)
            });
        })
    }
    async loginByCredentials(credentials) {
        return new Promise((resolve, reject) => {
            login(credentials, loginOptions, async (err, api) => {
                if (err) {
                    switch (err.error) {
                        case 'login-approval':
                            let twoFactorCode = await this.getTwoFactorCode();
                            err.continue(twoFactorCode);
                            break;
                        default:
                            console.error(err);
                            reject(err);
                    }
                }
                this.api = api;
                resolve(api);
            });
        })
    }
    async addUnsendMessage(message){
        let unsendMessages = [];
        try {
            unsendMessages = await loadJsonFile(this.filePath.unsendMessages);
        } catch (error) {
        }
        unsendMessages.push(message);
        await writeJsonFile(this.filePath.unsendMessages, unsendMessages);
    }
    async sendUnsendMessages(){   
        try {
            let unsendMessages = await loadJsonFile(this.filePath.unsendMessages);
            log.info('init', 'Send unsend messages');
            while(unsendMessages.length>0){
                let unsendMessage = unsendMessages.shift();
                await this.sendMessage(unsendMessage.threadID,unsendMessage.text);
                await writeJsonFile(this.filePath.unsendMessages, unsendMessages);
            }
        } catch (error) {
        }
        return 
    }
    async sendMessage(threadID, text) {
        return new Promise((resolve, reject) => {
            this.api.sendMessage(text, threadID,async (err, messageInfo) => {
                if (err && err.error === 1357004) {
                    await this.addUnsendMessage({text:text,threadID:threadID})
                    await this.exit();
                };
                if (err) return console.error(err);
                resolve(messageInfo);
            })
        });
    }
    async sendAttachment(threadID, attachment, text = '') {
        let msg = {
            body: text,
            attachment: fs.createReadStream(attachment.filePath)
        }
        await this.sendMessage(threadID, msg);
        await attachment.remove();
        return
    }
    setListener(api) {
        api.setOptions({
            listenEvents: true
        });
        return api.listen
    }
}

module.exports = FacebookBot;