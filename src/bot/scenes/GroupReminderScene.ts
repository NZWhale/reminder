import { CronJob } from "cron";
import { Scenes, Telegram } from "telegraf";
// import { Reminder } from "../interfaces";
import { Telegraf, NarrowedContext, Markup, Context } from 'telegraf';
import { Update, Message, CallbackQuery } from 'telegraf/types';

const TEST_CHAT = {
    TITLE: 'test',
    ID: '-820229051'
}
const ATMO_CHAT = {
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
interface WeeklyJobs {
    mondeyJob: CronJob
    thursdayJob: CronJob
}

export default class GroupReminderScene {
    private groupReminder
    private telegram: Telegram | null = null
    private weeklyJobs: WeeklyJobs = {
        mondeyJob: {} as CronJob,
        thursdayJob: {} as CronJob
    }

    constructor() {
        this.groupReminder = new Scenes.BaseScene('group_reminder');
        this.groupReminder.leave((ctx) => {
            ctx.reply('Thank you for your time!');
        });
    }

    enter(ctx: NarrowedContext<Context<Update> & {
        match: RegExpExecArray;
    }, {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }>) {
        // this.groupReminder.enter((ctx) => {
        this.startGroupReminder(ctx)
        // });
    }

    private startGroupReminder(ctx: Context<Update>) {
        const { message } = ctx
        if (!message) {
            console.log('message does not exist')
            return
        }
        const { chat, date, from } = message
        const { id, type } = chat
        this.telegram = ctx.telegram
        ctx.deleteMessage(message.message_id)
        if (`${chat.id}` === ATMO_CHAT.ID || `${chat.id}` === TEST_CHAT.ID) {
            this.weeklyMeetReminder(id)
        }
    }

    private weeklyMeetReminder(chatId: number) {
        if (!this.telegram) {
            console.log('Bot not initialized')
            return
        }
        this.weeklyJobs.mondeyJob = new CronJob(
            '49 15 * * 1',
            () => {
                if (!this.telegram) {
                    return
                }
                this.telegram.sendSticker(chatId, ERMASTATUS.file_id)
            },
            null,
            true,
            'Europe/Moscow'
        );
        this.weeklyJobs.thursdayJob = new CronJob(
            '49 15 * * 4',
            () => {
                if (!this.telegram) {
                    return
                }
                this.telegram.sendSticker(chatId, ERMASTATUS.file_id)
            },
            null,
            true,
            'Europe/Moscow'
        );
    }
}