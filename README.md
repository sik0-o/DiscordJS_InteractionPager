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
### ManualProcess init and binding(mpb)
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
Замечательно, это мы добавили команду, добавили туда пейджер и после выполнения команды нам будет отображена первая страница Пейджера, но его кнопки будут скорее всего недоступны.
Чтобы включить обработку событий пейджера нужно добавить обработчик взаимодействий в бота.
Как это сделать рассказно (https://discordjs.guide/message-components/interactions.html#the-client-interactioncreate-event)[в этой прекрасной статье в разделе event]

Нам нужен последний пример:
```js
const { Events } = require('discord.js');
const { pagerCallback } = require('discord.js-interpage')

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.isButton()) {
			// respond to the button
            // собственно обрабатывааем ошибку с помощью pagerCallback
            pagerCallback(interaction)
		} else if (interaction.isStringSelectMenu()) {
			// respond to the select menu
		}
	},
};
```

### Auto-process binging
Вместо метода `Paging.that()` можно использовать метод `Paging.for()` отличие лишь в том, что
`Paging.for(interaction, arr, like, pageSize)` требует interaction первым аргументом, 
но при этом `Process` будет создан, и `Pager` будет прикреплен к нему автоматически.

Пример:
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
        // тут мы запрашиваем какой-то список элементов
        const list = await fetchList()
        // создаем пейджер и шаблон страницы
        const pageLayout = Paging.for(
            interaction, // здесь добавился interaction
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
        ).pageLayout()

		await interaction.reply(pageLayout); // возвращаем страничку пейджера
	},
};
```