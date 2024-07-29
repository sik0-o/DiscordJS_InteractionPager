const {Pager} = require('./src/pager.js')

// Paging класс, чтобы удобно создавать нужные конфигурации Pager
class Paging {
    static that(arr, like, pageSize = 10) {
        if(like !== 'function') {
            throw new Error('`like` must be a `function(pager, message) replyObject`')
        }
        // разбиваем список на страницы
        if(typeof arr === 'object' && arr?.constructor?.name === 'Array') {
            const pages = []
            for(let i = 0; i < arr.length; i += pageSize) {
                const page = arr.slice(i, i + pageSize)
                pages.push(page)
            }

            // создаем пэйджер и привязываем к нему данные страниц
            const p = new Pager(1, pages.length)
            p.linkData(pages)
            p.SetPageLayoutBuilder(like)

            return p
        } 

        throw new Error('`arr` must to be an array bro')
    }
}

module.exports = {
    Paging: Paging,
}