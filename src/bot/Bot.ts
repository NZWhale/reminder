// import { Reminder } from "../interfaces";
import { Telegraf, NarrowedContext, Markup, Context } from 'telegraf';
import { Update, Message, CallbackQuery } from 'telegraf/types';

import Database from "../database";
import RegistrationScene from "./scenes/RegistrationScene";
import NewReminderScene from "./scenes/NewReminderScene";
import GetRemindersScene from "./scenes/GetRemindersScene";
import NewChatReminderScene from "./scenes/NewChatReminderScene";

export default class BotProcessor {
    // private reminds: Array<Reminder> = []
    private updates: Array<Update> = []
    private bot: Telegraf | null = null

    constructor(
        private token: string,
        private database: Database,
        private registrationScene: RegistrationScene,
        private newReminderScene: NewReminderScene,
        private getRemindersScene: GetRemindersScene,
        private newChatReminder: NewChatReminderScene
    ) {

        this.bot = new Telegraf(this.token);

        this.bot.telegram.getUpdates(5, 1, -1, undefined)
            .then((value) => {
                this.updates = value
                console.log(this.updates)
            }).catch((reason) => {
                console.log(reason)
            })

        this.bot.command('start', this.start)
        this.bot.on('callback_query', async (ctx: any) => await this.onCallbackQuery(ctx, ctx.callbackQuery.data))
        // this.bot.launch();

        process.once('SIGINT', () => {
            if (!this.bot) {
                return
            }
            this.bot.stop('SIGINT')
        });
        process.once('SIGTERM', () => {
            if (!this.bot) {
                return
            }
            this.bot.stop('SIGTERM')
        });
    }


    async start(ctx: NarrowedContext<Context<Update>, {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }>) {
        let markDown
        const userId: number = ctx.from.id
        ctx.deleteMessage(ctx.message.message_id)
        if (!await this.database.isUserExist(userId)) {
            markDown = Markup.inlineKeyboard([
                Markup.button.callback('Registration', 'registration'),
            ]);
            ctx.replyWithMarkdownV2('U should register', markDown)
            return
        }
        markDown = Markup.inlineKeyboard([
            Markup.button.callback('New Reminder', 'new_reminder'),
            Markup.button.callback('New Chat Reminder', 'new_chat_reminder'),
            Markup.button.callback('My Reminders', 'get_reminders'),
            Markup.button.callback('My Reminders', 'get_reminders'),
        ]);
        ctx.replyWithMarkdownV2('Wazzzup', markDown)
    }

    async onCallbackQuery(ctx: NarrowedContext<Context<Update>, Update.CallbackQueryUpdate<CallbackQuery>>, event: string) {
        // Explicit usage
        switch (event) {
            case 'new_chat_reminder':
                this.enterScene(event)
                break
            case 'new_reminder_scene':
                this.enterScene(event)
                break
            case 'get_reminders_scene':
                this.enterScene(event)
                break
            case 'registration_scene':
                this.enterScene(event)
                break
            case 'default':
                break
        }
        await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
        // Using context shortcut
        await ctx.answerCbQuery();
    };

    enterScene(scene: string): void {
        switch (scene) {
            case 'new_chat_reminder':
                this.newChatReminder.enter()
                break
            case 'registration_scene':
                this.registrationScene.enter()
                break
            case 'new_reminder_scene':
                this.newReminderScene.enter()
                break
            case 'get_reminders_scene':
                this.getRemindersScene.enter()
                break
            case 'default':
                break
        }
    }
}