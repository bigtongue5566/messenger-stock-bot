const fs = require('fs');
class Attachment {
    constructor(filePath) {
        this.filePath = filePath;
    }
    async remove() {
        return new Promise((resolve, reject) => {
            fs.unlink(this.filePath, (err) => {
                resolve()
            })
        })
       
    }
}
module.exports = Attachment;