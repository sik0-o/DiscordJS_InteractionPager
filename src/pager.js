const { 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle 
} = require('discord.js')

const {
    GO_NEXT_PAGE,
    GO_PREV_PAGE,
    GO_LAST_PAGE,

    CID_LAST_PAGE,
    CID_NEXT_PAGE,
    CID_PREV_PAGE,
    CID_CURRENT_PAGE,
} = require('./pager/const')

/**
 * Pager собственно класс объекта пейджера. 
 */
class Pager {
    #currentPage
    #lastPage
    #data
    #pageLayoutBuilder

    #showPreviousButton = true

    #debug = false
    
    // Инициализируется начальной страницей и последней страницей
    constructor(currentPage, lastPage) {
        this.#currentPage = currentPage
        this.#lastPage = lastPage
    }
    
    // Сеттеры
    // -------

    #debugMsg(message, ...args) {
        if(this.#debug) {
            console.log(`[DEBUG] Pager`, message, ...args)
        }
    }

    // Устанавливает функцию сборки страницы
    SetPageLayoutBuilder(builderFN) {
        this.#pageLayoutBuilder = builderFN

        this.#debugMsg('PageLayoutBuilder was set', builderFN)
        
    }

    // Привязывает данные к пейджеру
    linkData(data) {
        this.#data = data

        this.#debugMsg('data was linked', data)
        // last page recalculate?

    }
    
    // Геттеры
    // -------

    // Возвращает текущую страницу
    CurrentPage() {
        this.#debugMsg('current page requested')
        return this.#currentPage
    }

    // Возвращает последнюю страницу
    LastPage() {
        this.#debugMsg('last page requested')
        return this.#lastPage
    }   

    // Возвращает страницу на основе предыдущего сообщения message
    pageLayout(message) {
        this.#debugMsg('page layout will build with', message)
        return this.#pageLayoutBuilder(this, message)
    }

    // Возвращает связанные с пейджером данные
    getContent() {
        this.#debugMsg('content requested', typeof this.#data, this.#data[this.#currentPage-1])

        // console.log('PAGER::getContent', this.#data)
        if(this.#data === null) return null

        return this.#data[this.#currentPage-1]
    }

    debug() {
        this.#debug = true

        return this
    }


    // Навигация
    // ---------

    // Перемещает пейджер на следующую страницу. 
    // Если следующей страницы нет, то останавливается на последней
    nextPage() {
        let next = this.#currentPage + 1
        if(next >= this.#lastPage) next = this.#lastPage

        this.#debugMsg('will go next page:', next, 'current page:', this.#currentPage)

        this.#currentPage = next

        return next
    }

    // Перемещает пейджер на предыдущую страницу.
    // Если предыдущей страницы нет, возращает первую страницу
    prevPage() {
        let prev = this.#currentPage - 1
        if(prev <= 1) prev = 1

        this.#debugMsg('will go prev page:', prev, 'current page:', this.#currentPage)

        this.#currentPage = prev

        return prev
    } 

    // Перемещает пейджер на последнюю страницу.
    lastPage() {
        this.#debugMsg('will go last page:', this.#lastPage, 'current page:', this.#currentPage)
        this.#currentPage = this.#lastPage

        return this.#lastPage
    }


    // Рендеринг
    // ---------

    // Собирает ActionRow и компоненты пейджера
    build() {
        this.#debugMsg('build called')
        // Кнопка предыдущей страницы
        const previousPage = new ButtonBuilder()
            .setCustomId(CID_PREV_PAGE)
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)

        // Кнопка следующей страницы
        const nextPage = new ButtonBuilder()
            .setCustomId(CID_NEXT_PAGE)
            .setLabel('next')
            .setStyle(ButtonStyle.Primary)

        // Кнопка(Дисплей) текущей страницы
        const curPage = new ButtonBuilder()
            .setCustomId(CID_CURRENT_PAGE)
            .setLabel(`${this.#currentPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true) 

        // Кнопка последней страницы
        const lastPage = new ButtonBuilder()
            .setCustomId(CID_LAST_PAGE)
            .setLabel(`${this.#lastPage}`)
            .setStyle(ButtonStyle.Primary)
        
        // // Доп.Кнопка
        // const betTokenButton = new ButtonBuilder()
        //     .setCustomId('pager_betToken')
        //     .setLabel('BET Now')
        //     .setStyle(ButtonStyle.Success)

        // Собираем компоненты
        const components = []
        // Если это первая страница, то предыдущей то нет
        if(this.#currentPage > 1) {
            components.push(previousPage)
        } else {
            // Поэтому либо не отображаем кнопку,
            // либо отображаем отключенной
            if(this.#showPreviousButton) {
                previousPage.setDisabled(true)
                components.push(previousPage)
            }
        }


        // Добавляем текущую страницы
        components.push(curPage)
        // До предпоследней страницы нужна кнопка следующая страница 
        if(this.#currentPage < this.#lastPage - 1) components.push(nextPage)

        // Если это не последняя страница, то кнопка с ней нам нужна
        if(this.#currentPage < this.#lastPage) {
            components.push(lastPage)
        }

        // // Дополнительные кнопочки вставляем да
        // components.push(betTokenButton)

        // Собираем строки панели управления
        const row = new ActionRowBuilder()
            .addComponents(...components);

        return [row]
    }
}

module.exports = {
    Pager: Pager,
    
    GO_NEXT_PAGE: GO_NEXT_PAGE,
    GO_PREV_PAGE: GO_PREV_PAGE,
    GO_LAST_PAGE: GO_LAST_PAGE,
    CID_LAST_PAGE: CID_LAST_PAGE,
    CID_NEXT_PAGE: CID_NEXT_PAGE,
    CID_PREV_PAGE: CID_PREV_PAGE,
    CID_CURRENT_PAGE: CID_CURRENT_PAGE,
}