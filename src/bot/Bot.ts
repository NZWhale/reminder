// import { Reminder } from "../interfaces";
import { Telegraf, NarrowedContext, Markup, Context } from 'telegraf';
import { Update, Message, CallbackQuery } from 'telegraf/types';
import { CronJob } from 'cron'

import Database from "../database";
import RegistrationScene from "./scenes/RegistrationScene";
import NewReminderScene from "./scenes/NewReminderScene";
import GetRemindersScene from "./scenes/GetRemindersScene";
import NewChatReminderScene from "./scenes/NewChatReminderScene";

const TEST_CHAT = {
    TITLE: 'test',
    ID: '-820229051'
}
const ATMO_CHAT = {
    TITLE: 'ATMOSFERA UNITED',
    ID: '-820229051'
}

const ERMASTATUS = {
    width: 512,
    height: 512,
    emoji: "🕘",
    set_name: "atmosteam",
    is_animated: false,
    is_video: false,
    type: "regular",
    thumb: {
        file_id: "AAMCAgADGQEAAyBj3A6GZF0AATB-y1_whP93IEBq-OkAAoUnAAL-B3BIGcE1aWI43JsBAAdtAAMuBA",
        file_unique_id: "AQADhScAAv4HcEhy",
        file_size: 8900,
        width: 320,
        height: 320,
    },
    file_id: "CAACAgIAAxkBAAMgY9wOhmRdAAEwfstf8IT_dyBAavjpAAKFJwAC_gdwSBnBNWliONybLgQ",
    file_unique_id: "AgADhScAAv4HcEg",
    file_size: 17168,
}
interface WeeklyJobs {
    mondeyJob: CronJob
    thursdayJob: CronJob
}
export default class BotProcessor {
    // private reminds: Array<Reminder> = []
    // private updates: Array<Update> = []
    private bot: Telegraf | null = null
    private weeklyJobs: WeeklyJobs = {
        mondeyJob: {} as CronJob,
        thursdayJob: {} as CronJob
    }

    constructor(
        private token: string,
        private database: Database,
        private registrationScene: RegistrationScene,
        private newReminderScene: NewReminderScene,
        private getRemindersScene: GetRemindersScene,
        private newChatReminder: NewChatReminderScene
    ) {

        this.bot = new Telegraf(this.token);
        this.bot.command('start', this.start.bind(this))
        this.bot.hears('напомни про мит', this.startGroupReminder.bind(this))
        // this.bot.on('sticker', this.startGroupReminder.bind(this));
        this.bot.on('callback_query', async (ctx: any) => await this.onCallbackQuery(ctx, ctx.callbackQuery.data))
        this.bot.launch();
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

    private startGroupReminder(ctx: NarrowedContext<Context<Update> & {
        match: RegExpExecArray;
    }, {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }>) {
        const { message } = ctx
        const { chat, date, from } = message
        const { id, type } = chat
        console.log(id, type)
        console.log(chat, date, from)
        ctx.deleteMessage(ctx.message.message_id)
        if (type === 'group' && (`${chat.id}` === ATMO_CHAT.ID || `${chat.id}` === TEST_CHAT.ID)) {
            this.weeklyMeetReminder(id)
        }
    }

    private weeklyMeetReminder(chatId: number) {
        if (!this.bot) {
            console.log('Bot not initialized')
            return
        }
        this.weeklyJobs.mondeyJob = new CronJob(
            // '58 14 * * Mon',
            '19 0 * * FRI',
            () => {
                if (!this.bot) {
                    return
                }
                this.bot.telegram.sendSticker(chatId, ERMASTATUS.file_id)
            },
            null,
            true,
            'America/Los_Angeles'
        );
        this.weeklyJobs.thursdayJob = new CronJob(
            // '58 14 * * Thu,
            '25 0 * * FRI',
                        function () {
                console.log('You will see this message every second');
            },
            null,
            true,
            'America/Los_Angeles'
        );
        // this.bot.telegram.sendSticker(chatId, ERMASTATUS.file_id)
    }
}