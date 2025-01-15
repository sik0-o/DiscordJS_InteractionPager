const BY_INTERACTION = 0
const BY_MESSAGE = 1
const BY_WEBHOOK = 2

class ProcStorage {
    #processes = {}
    #interaction = {}
    #message = {}
    #webhook = {}

    byInteraction(i) {
        const interactionID = i?.id ?? null
        const messageID = i?.message.id ?? null
        const messageInteractionID = i?.message?.interaction?.id ?? null
        const webhookID = i?.webhook.id ?? null

        // console.log(this.#processes, this.#interaction, this.#message, this.#webhook)

        // by messageID
        if(messageID) {
            console.log('ByMessageID', messageID)
            const p = this.findProc(BY_MESSAGE, messageID)
            if(p) return p
        }
        // by message InteractionID
        if(messageInteractionID) {
            console.log('ByMessageInteractionID', messageInteractionID)
            const p = this.findProc(BY_INTERACTION, messageInteractionID)
            if(p) return p
        }

        // by interactionID
        if(interactionID) {
            console.log('ByInteractionID', interactionID)
            const p = this.findProc(BY_INTERACTION, interactionID)
            if(p) return p
        }
        // by webhookID
        // // this is fallback variant!
        // if(webhookID) {
        //     console.log('ByWebhookID', webhookID)
        //     const p = this.findProc(BY_WEBHOOK, webhookID)
        //     if(p) return p
        // }
        
        throw new Error('Proccess not found')
    }

    findProc(type, id) {
        const hash = this.getProcessHash(type, id)
        if(hash) return this.getProcByHash(hash)
        return null
    }

    getProcByHash(hash) {
        return this.#processes[hash] ?? null
    }

    getProcessHash(type, id) {
        switch(type) {
            case 0:
                return this.#interaction[id] ?? null
            case 1:
                return this.#message[id] ?? null
            case 2:
                return this.#webhook[id] ?? null
        }

        return null
    }

    Store(proc, hash, interactionID, messageID, webhookID) {
        this.#processes[hash] = proc

        if(interactionID) this.#interaction[interactionID] = hash
        if(messageID) this.#message[messageID] = hash
        if(webhookID)  this.#webhook[webhookID] = hash
    }
}

const __ProcSTORAGE = new ProcStorage()

/**
 * Process представляет класс для работы на до процессом команды приложения.
 * Он хранит в себе контекст выполнения в который можно помещать занчения с помощью метода register(name, val)
 * И получать значения с помощью метода access(name)
 * Процесс сохраняет контекст при работе приложения, но сбрасывается при пересоздании процесса (тут требуется доработка, чтобы состояния сохранялись меджу запусками)
 */
class Process {
    #initialInteractionID
    #interactionID = []
    #messageID
    #webhookID
    #context = {}
    #hash = Date.now()

    // Инициализирует процесс из interaction
    // производит биндинг процесса к interaction
    static InitByInteraction(interaction) {
        const p = new Process()
        p.#initialInteractionID = interaction?.id
        p.bindInteraction(interaction)
        p.Store()

        return p
    }

    // Получает действующий процесс исходя из interaction
    // Производит поиск исходя из полученных данных о взаимодействии 
    // Сначала поиск процесса производится по webhook, затем по message
    // далее поиск производится по interactionID сообщения, и уже затем по ID полученной interaction 
    static GetByInteraction(i) {
        const p = __ProcSTORAGE.byInteraction(i)
        // Получили процесс
        if(p) {
            // добавляем данные этого взаимодействия в процесс и сохраняем его
            p.bindInteraction(i)
            p.Store()
        }

        return p
    }

    Store() {
        __ProcSTORAGE.Store(this, this.#hash, this.#interactionID[this.#interactionID.length-1], this.#messageID, this.#webhookID)

        return this
    }

    bindInteraction(i) {
        if(i?.id ?? null) this.#interactionID.push(i.id)
        // TODO: в процессе не сохраняются сообщения, которые были созданы у этого процесса,
        // вместо этого сохраняется последнее сообщение. 
        // Получить нужный пейджер, если он был создан в одном процессе, не получится (будет выдан пейджер из последнего сообщения)
        this.#messageID = i?.message?.id ?? null
        this.#webhookID = i?.webhook?.id ?? null
    }

    // register добавляет значение value под названием name в Контекст процесса
    register(name, value) {
        this.#context[name] = value
    }

    // access возвращает значение с названием name из Контекста процесса
    access(name) {
        return this.#context[name] ?? null
    }
}

module.exports = {
    Process: Process
}