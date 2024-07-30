# DiscordJS_InteractionPager
Типа когда пейджер надо сделать для контента в interactions, когда пишешь бота на либе Discord.js

У тебя тип есть список:
- ты этот список отдаешь пейджеру и говоришь ему как отрисовывается страница.
- затем пейджер будет тебе возвращать сообщение для страницы, которое можно либо отправить interaction.reply(PAGE_LAYOUT)
  либо использовать для обновления сообщения interaction.message.update(PAGE_LAYOUT)
- Что делать дальше, решать только тебе.

## Чо надо
1) Восстановление работы пейджера, при сбое/перезапуске приложения (нужно где-то состояние его хранить и полученные данные)

## Как использовать
Для примера применю на команде взятой с (https://discordjs.guide/creating-your-bot/slash-commands.html#individual-command-files)[документации discord.js]

```js
const { SlashCommandBuilder } = require('discord.js');
// тут добавляем пакет и берем от туда Process и Paging
const { Paging,Process } = require('discord.js-interpage')

function fetchList() {
    // implement me!
    // функция которая запрашивает список элементов, 
    // который пейджер затем разделит на страницы
    return []
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
        // В начале выполнения команды создаем процесс, привязываем взаимодействие к нему 
        // и сохраняем его в памяти
        const proc = Process.InitByInteraction(interaction)
        
        // тут мы запрашиваем какой-то список элементов
        const list = await fetchList()
        // создаем пейджер и шаблон страницы
        const p = Paging.that(
            list, 
            (pager, oldmessage) => {
                return {
                    content: `Ваш страница ${pager.CurrentPage()} из ${pager.LastPage()}\n` +
                    `\`${pager.getContent()}\``, // добавляем данные от пейджера в сообщения
                    embeds: oldmessage?.embeds,  // оставляем старые вложения
                    components: pager.build(),   // перерисовываем пейджер
                }
            }, 
            1 // для примера рассмотрен вывод по одному элементу
        )
        // Добавляем пэйджер в контекст процесса
        proc.register('pager', p)
        

		await interaction.reply(p.pageLayout()); // возвращаем страничку пейджера
	},
};
```