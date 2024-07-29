const { 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle 
} = require('discord.js')

/**
 * Pager собственно класс объекта пейджера. 
 */
class Pager {
    #currentPage
    #lastPage
    #data
    #pageLayoutBuilder

    #showPreviousButton = true
    
    // Инициализируется начальной страницей и последней страницей
    constructor(currentPage, lastPage) {
        this.#currentPage = currentPage
        this.#lastPage = lastPage
    }
    
    // Сеттеры
    // -------

    // Устанавливает функцию сборки страницы
    SetPageLayoutBuilder(builderFN) {
        this.#pageLayoutBuilder = builderFN
    }

    // Привязывает данные к пейджеру
    linkData(data) {
        this.#data = data
        // last page recalculate?

    }
    
    // Геттеры
    // -------

    // Возвращает текущую страницу
    CurrentPage() {
        return this.#currentPage
    }

    // Возвращает последнюю страницу
    LastPage() {
        return this.#lastPage
    }   

    // Возвращает страницу на основе предыдущего сообщения message
    pageLayout(message) {
        return this.#pageLayoutBuilder(this, message)
    }

    // Возвращает связанные с пейджером данные
    getContent() {
        // console.log('PAGER::getContent', this.#data)
        if(this.#data === null) return null

        return this.#data[this.#currentPage-1]
    }


    // Навигация
    // ---------

    // Перемещает пейджер на следующую страницу. 
    // Если следующей страницы нет, то останавливается на последней
    nextPage() {
        let next = this.#currentPage + 1
        if(next >= this.#lastPage) next = this.#lastPage

        this.#currentPage = next

        return next
    }

    // Перемещает пейджер на предыдущую страницу.
    // Если предыдущей страницы нет, возращает первую страницу
    prevPage() {
        let prev = this.#currentPage - 1
        if(prev <= 1) prev = 1

        this.#currentPage = prev

        return prev
    } 

    // Перемещает пейджер на последнюю страницу.
    lastPage() {
        this.#currentPage = this.#lastPage

        return this.#lastPage
    }


    // Рендеринг
    // ---------

    // Собирает ActionRow и компоненты пейджера
    build() {
        // Кнопка предыдущей страницы
        const previousPage = new ButtonBuilder()
            .setCustomId('pager_prevPage')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)

        // Кнопка следующей страницы
        const nextPage = new ButtonBuilder()
            .setCustomId('pager_nextPage')
            .setLabel('next')
            .setStyle(ButtonStyle.Primary)

        // Кнопка(Дисплей) текущей страницы
        const curPage = new ButtonBuilder()
            .setCustomId('pager_currentPage')
            .setLabel(`${this.#currentPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true) 

        // Кнопка последней страницы
        const lastPage = new ButtonBuilder()
            .setCustomId('pager_lastPage')
            .setLabel(`${this.#lastPage}`)
            .setStyle(ButtonStyle.Primary)
        
        // Доп.Кнопка
        const betTokenButton = new ButtonBuilder()
            .setCustomId('pager_betToken')
            .setLabel('BET Now')
            .setStyle(ButtonStyle.Success)

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

        // Дополнительные кнопочки вставляем да
        components.push(betTokenButton)

        // Собираем строки панели управления
        const row = new ActionRowBuilder()
            .addComponents(...components);

        return [row]
    }
}

module.exports = {
    Pager: Pager,
}