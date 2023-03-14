import { Telegraf, NarrowedContext, Markup, Context, Scenes, session } from 'telegraf';
import { Update, Message, CallbackQuery } from 'telegraf/types';
import { CronJob } from 'cron'
import Database from "../database";
import NewChatReminderScene from "./scenes/NewChatReminderScene";
import { log } from '@bb/source-log-ts';
import { escape } from './scenes/helpers'

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
    private stage: any
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
    ) {
        this.bot = new Telegraf(this.token);
        this.stage = new Scenes.Stage(
            [
                NewChatReminderScene,
                // NewReminderScene,
            ]
        )
        this.bot.command('start', this.start.bind(this))
        this.bot.action('new_chat_reminder', this.newChatReminder.bind(this))
        // this.bot.action('new_reminder', this.newReminder.bind(this))

        this.bot.use(session());
        this.bot.use(this.stage.middleware());
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


    private async start(ctx: any): Promise<void> {
        const userId: number = ctx.from.id
        const chatId: number = ctx.chat.id
        const chatType = ctx.update.message.chat.type
        this.weeklyMeetReminder([TEST_CHAT, ATMO_CHAT])
        if (chatType === 'group' || chatType === 'supergroup') {
            ctx.deleteMessage(ctx.message.message_id)
            return
        }
        if (!await this.database.isUserExist(userId)) {
            const text = `You are not registred, please contact admin for solve this issue. Your ID is - ${userId}`
            await this.sendMessage(chatId, text)
            return
        }
        await this.replyWithMarkdown(
            ctx,
            [['New Reminder', 'new_reminder'], ['New Chat Reminder', 'new_chat_reminder']],
            'Wazzzup'
        )
    }

    private async newChatReminder(ctx: any): Promise<void> {
        const callbackQuery = ctx.callbackQuery
        const scene = this.stage.scenes.get('new_chat_reminder')
        scene.enter()
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



    private async replyWithMarkdown(ctx: any, buttons: Array<Array<string>>, text: string): Promise<number> {
        try {
            const markDown = Markup.inlineKeyboard(buttons.map(mark => {
                if (mark[2] === 'webapp') {
                    return Markup.button.webApp(mark[0], mark[1])
                }
                return Markup.button.callback(mark[0], mark[1])
            }));
            text = escape(text);
            const msg = await ctx.replyWithMarkdownV2(text, markDown)
            await this.deleteMessage(ctx.chat.id, msg.message_id-1)
            return msg.message_id
        } catch (e: unknown) {
            log.error(e as Error)
            return -1
        }
    }

    private async sendMessage(chatId: number, text: string): Promise<number> {
        try {
            if (!this.bot) {
                throw new Error('BOT_NOT_EXIST')
            }
            text = escape(text);
            const msg = await this.bot.telegram.sendMessage(chatId, text)
            await this.deleteMessage(chatId, msg.message_id-1)
            return msg.message_id
        } catch (e: unknown) {
            log.error(e as Error)
            return -1
        }
    }

    private async deleteMessage(chatId: number, msgId: number): Promise<boolean> {
        try {
            if (!this.bot) {
                throw new Error('BOT_NOT_EXIST')
            }
            return await this.bot.telegram.deleteMessage(chatId, msgId)
        } catch (e: unknown) {
            log.error(e as Error)
            return false
        }
    }

    private weeklyMeetReminder(chats: Array<CHAT>) {
        if (!this.bot) {
            console.log('Bot not initialized')
            return
        }
        chats.forEach(chat => {
            if (!Object.hasOwn(this.weeklyJobs.mondeyJob, chat.TITLE)) {
                this.weeklyJobs.mondeyJob[chat.TITLE] = new CronJob(
                    '59 15 * * 1',
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
                // console.log('first job started', this.weeklyJobs.mondeyJob)
            }
            if (!Object.hasOwn(this.weeklyJobs.thursdayJob, chat.TITLE)) {
                this.weeklyJobs.thursdayJob[chat.TITLE] = new CronJob(
                    '59 15 * * 4',
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
                // console.log('second job started', this.weeklyJobs.thursdayJob)
            }
        })
    }
}