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

export default class BotProcessor {
    // private reminds: Array<Reminder> = []
    // private updates: Array<Update> = []
    private bot: Telegraf | null = null

    constructor(
        private registrationScene: RegistrationScene,
        private newReminderScene: NewReminderScene,
        private getRemindersScene: GetRemindersScene,
        private newChatReminder: NewChatReminderScene,
    ) {
}

    async onCallbackQuery(ctx: NarrowedContext<Context<Update>, Update.CallbackQueryUpdate<CallbackQuery>>, event: string) {
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
            // case 'group_reminder_scene':
            //     this.groupReminderScene.enter(ctx)
            //     break
            default:
                break
        }
    }
}