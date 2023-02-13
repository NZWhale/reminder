// import { Reminder } from "../interfaces";
import { Telegraf, NarrowedContext, Markup, Context } from 'telegraf';
import { Update, Message, CallbackQuery } from 'telegraf/types';
import { CronJob } from 'cron'

import Database from "../database";
import RegistrationScene from "./scenes/RegistrationScene";
import NewReminderScene from "./scenes/NewReminderScene";
import GetRemindersScene from "./scenes/GetRemindersScene";
import NewChatReminderScene from "./scenes/NewChatReminderScene";
import GroupReminderScene from './scenes/GroupReminderScene';
import BotProcessor from './BotProcessor';



const TEST_CHAT: CHAT = {
    TITLE: 'test',
    ID: '-820229051'
}
const ATMO_CHAT: CHAT = {
    TITLE: 'ATMOSFERA UNITED',
    ID: '-1001841736576'
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

interface CHAT {
    TITLE: string
    ID: string
}
interface WeeklyJobs {
    mondeyJob: {
        [key: string]: CronJob;
    },
    thursdayJob: {
        [key: string]: CronJob;
    },
}

export default class Bot {
    // private reminds: Array<Reminder> = []
    // private updates: Array<Update> = []
    private bot: Telegraf | null = null
    private processor: BotProcessor
    private weeklyJobs: WeeklyJobs = {
        mondeyJob: {} as {
            [key: string]: CronJob;
        },
        thursdayJob: {} as {
            [key: string]: CronJob;
        },
    }


    constructor(
        private token: string,
        private database: Database,
        private registrationScene: RegistrationScene,
        private newReminderScene: NewReminderScene,
        private getRemindersScene: GetRemindersScene,
        private newChatReminder: NewChatReminderScene,
        private groupReminderScene: GroupReminderScene
    ) {
        this.processor = new BotProcessor(this.registrationScene, this.newReminderScene, this.getRemindersScene, this.newChatReminder)
        this.bot = new Telegraf(this.token);
        this.bot.command('start', this.start.bind(this))
        // this.bot.hears('напомни про мит', (ctx) => this.groupReminderScene.enter(ctx))
        this.bot.on('callback_query', async (ctx: any) => await this.processor.onCallbackQuery(ctx, ctx.callbackQuery.data))
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
        const chatType = ctx.update.message.chat.type
        this.weeklyMeetReminder([TEST_CHAT, ATMO_CHAT])
        if (chatType === 'group' || chatType === 'supergroup') {
            ctx.deleteMessage(ctx.message.message_id)
            return
        }
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
        ]);
        ctx.replyWithMarkdownV2('Wazzzup', markDown)
    }

    // private startGroupReminder(ctx: Context<Update>) {
    //     const { message } = ctx
    //     if (!message) {
    //         console.log('message does not exist')
    //         return
    //     }
    //     const { chat, date, from } = message
    //     const { id, type } = chat
    //     ctx.deleteMessage(message.message_id)
    //     if (type === 'group' && (`${chat.id}` === ATMO_CHAT.ID || `${chat.id}` === TEST_CHAT.ID)) {
    //         this.weeklyMeetReminder(id)
    //     }
    // }

    private weeklyMeetReminder(chats: Array<CHAT>) {
        if (!this.bot) {
            console.log('Bot not initialized')
            return
        }
        chats.forEach(chat => {
            if (!Object.hasOwn(this.weeklyJobs.mondeyJob, chat.TITLE)) {
                this.weeklyJobs.mondeyJob[chat.TITLE] = new CronJob(
                    '49 15 * * 1',
                    () => {
                        if (!this.bot) {
                            return
                        }
                        this.bot.telegram.sendSticker(chat.ID, ERMASTATUS.file_id)
                    },
                    null,
                    true,
                    'Europe/Moscow'
                )
                console.log('first job started', this.weeklyJobs.mondeyJob)
            }
            if (!Object.hasOwn(this.weeklyJobs.thursdayJob, chat.TITLE)) {
                this.weeklyJobs.thursdayJob[chat.TITLE] = new CronJob(
                    '49 15 * * 4',
                    () => {
                        if (!this.bot) {
                            return
                        }
                        this.bot.telegram.sendSticker(chat.ID, ERMASTATUS.file_id)
                    },
                    null,
                    true,
                    'Europe/Moscow'
                )
                console.log('second job started', this.weeklyJobs.thursdayJob)
            }
        })
    }
}