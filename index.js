const {
    Pager,
    // Pager Constants
    GO_NEXT_PAGE,
    GO_PREV_PAGE,
    GO_LAST_PAGE,
    CID_LAST_PAGE,
    CID_NEXT_PAGE,
    CID_PREV_PAGE,
    CID_CURRENT_PAGE,
} = require('./src/pager')
const {Process} = require('./src/process')

// Paging класс, чтобы удобно создавать нужные конфигурации Pager
class Paging {
    // for создает для interaction Process и Pager в нем использующий arr в качестве содержания 
    // и замыкание like в качестве шаблонизатора страниц.
    // По умолчанию список arr разбивается на страницы размером в 10 элементов, но это можно поменять передав другой pageSize
    static for(interaction, arr, like, pageSize = 10) {
        // like должно быть замыканием, иначе не получится отрисовать страницу pager
        if(typeof like !== 'function') {
            throw new Error('`like` must be a `function(pager, message) replyObject`')
        }

        // разбиваем список на страницы
        if(typeof arr === 'object' && arr.constructor.name === Array.prototype.constructor.name) {
            // Пробуем получить процесс связанный с взаимодействием interaction
            const proc = interaction ? Process.InitByInteraction(interaction) : null

            const pages = []
            for(let i = 0; i < arr.length; i += pageSize) {
                const page = arr.slice(i, i + pageSize)
                pages.push(page)
            }

            // создаем пэйджер и привязываем к нему данные страниц
            const p = new Pager(1, pages.length)
            p.linkData(pages)
            p.SetPageLayoutBuilder(like)
            
            // если есть процесс
            if(proc) {
                // Добавляем пэйджер в контекст процесса TODO: сейчас может храниться, только 1 пейджер (последний) в контексте процесса
                proc.register('pager', p)
            }
            // так же это можно сделать самостоятельно позже через proc.registrer('pager', PAGER)

            return p
        } 

        throw new Error('`arr` must to be an array bro')
    }
    
    // that так же как for() создает для interaction Pager, но не прикрепляет его к процессу.
    static that(arr, like, pageSize = 10) {
        return this.for(null, arr, like, pageSize)
    }
}

// pagerCallback применяется на кнопки и получает взаимодействие кнопки i
async function pagerCallback(i, dir = null) {
    // Извлекаем пэйджер из контекста процесса привязанного к взаимодействию (interaction)
    console.log('[DEBUG] Access process by interaction')
    const proc = Process.GetByInteraction(i)
    console.log('[DEBUG] Process:', proc, 'access pager')
    const pager = proc.access('pager')
    console.log('[DEBUG] Pager:', pager)
    const interactionCustomID = i?.customId ?? null
    if(dir === null) {
        switch(interactionCustomID) {
            case CID_LAST_PAGE: dir = GO_LAST_PAGE; break
            case CID_NEXT_PAGE: dir = GO_NEXT_PAGE; break
            case CID_PREV_PAGE: dir = GO_PREV_PAGE; break
        }
    }
    if(dir === null) {
        throw new Error('pagerCallback error. Can`t detect pager direction from interaction.customID: ' + interactionCustomID)
    }

    // Определяем команду кнопки
    if(dir === GO_NEXT_PAGE) {
        pager.nextPage()
    } else if(dir === GO_PREV_PAGE) {
        pager.prevPage()
    } else {
        pager.lastPage()
    }
    
    try{
        if(i.message.ephemeral || ((i.message.flags & 64) != 0)) {
            console.log('Ephemeral message found')
            console.log(i.message)
            await i.editReply(pager.pageLayout(i?.message))
        } else {
            await i.message.edit(pager.pageLayout(i?.message))
        }
    } catch(error) {
        console.error('[DEBUG] {pagerCallback MessageEdit} Error:', error)
        throw error
    }

    try {
        await i.deferUpdate()
    } catch(error) {
        console.error('[DEBUG] {pagerCallback DeferUpdate} Error:', error)
    }
}


module.exports = {
    Paging: Paging,
    Process: Process,
    pagerCallback: pagerCallback,
    // Pager Constants
    GO_NEXT_PAGE: GO_NEXT_PAGE,
    GO_PREV_PAGE: GO_PREV_PAGE,
    GO_LAST_PAGE: GO_LAST_PAGE,
    CID_LAST_PAGE: CID_LAST_PAGE,
    CID_NEXT_PAGE: CID_NEXT_PAGE,
    CID_PREV_PAGE: CID_PREV_PAGE,
    CID_CURRENT_PAGE: CID_CURRENT_PAGE,
}