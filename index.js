const {
    Pager,
    GO_NEXT_PAGE,
    GO_PREV_PAGE,
    GO_LAST_PAGE,
} = require('./src/pager')
const {Process} = require('./src/process')

// Paging класс, чтобы удобно создавать нужные конфигурации Pager
class Paging {
    static that(arr, like, pageSize = 10) {

        if(typeof like !== 'function') {
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

// pagerCallback применяется на кнопки и получает взаимодействие кнопки i
async function pagerCallback(i, dir = GO_NEXT_PAGE) {
    // Извлекаем пэйджер из контекста процесса привязанного к взаимодействию (interaction)
    const proc = Process.GetByInteraction(i)
    const pager = proc.access('pager')
    // Определяем команду кнопки
    if(dir === GO_NEXT_PAGE) {
        pager.nextPage()
    } else if(dir === GO_PREV_PAGE) {
        pager.prevPage()
    } else {
        pager.lastPage()
    }
    
    await i.message.edit(pager.pageLayout(i?.message))
    await i.deferUpdate()
}


module.exports = {
    Paging: Paging,
    Process: Process,
    pagerCallback: pagerCallback,
    GO_NEXT_PAGE: GO_NEXT_PAGE,
    GO_PREV_PAGE: GO_PREV_PAGE,
    GO_LAST_PAGE: GO_LAST_PAGE,
}