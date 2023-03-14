import { log } from "@bb/source-log-ts";
import { Composer, Scenes } from "telegraf";
import { getDayName, replyWithMarkdown, sendMessage } from "./helpers";

const reminder = {
    data: '',
    type: '',
    days: [] as Array<Day>,

}
interface Day {
    day: string
    hours: string,
    minutes: string
    seconds: string
}

const reminderText = new Composer();
reminderText.on("message", async (ctx: any) => {
    try {
        await ctx.deleteMessage(ctx.message.message_id)
        await ctx.deleteMessage(ctx.message.message_id - 1)
        reminder.data = ctx.data
        log.info('Data for remind', { data: ctx.data })
        await replyWithMarkdown(
            ctx,
            [['Repeat', 'repeat'], ['Once', 'once']],
            "Do you want to repeat reminder or remind once?"
        )
        return ctx.wizard.next()
    } catch (e) {
        console.log(e);
    }
});

const reminderType = new Composer();
reminderType.on('callback_query', async (ctx: any) => {
    try {
        const callbackQuery = ctx.callbackQuery.data
        const markDown = [
            ['Monday', '1'], ['Tuesday', '2'],
            ['Wednesday', '3'], ['Thursday', '4'],
            ['Friday', '5'], ['Saturday', '6'],
            ['Sunday', '7']
        ]
        const text = "Select one or few days for reminder"
        await ctx.deleteMessage(ctx.message.message_id)
        await ctx.deleteMessage(ctx.message.message_id - 1)
        switch (callbackQuery) {
            case 'repeat':
                reminder.type = 'repeat'
                log.info('Type', { type: 'repeat' })
                break
            case 'once':
                reminder.type = 'once'
                log.info('Type', { type: 'once' })
                break
            default:
                break
        }
        await replyWithMarkdown(ctx, markDown, text)
        return ctx.wizard.next()
    } catch (e) {
        log.error(e as Error);
    }
})

const reminderDays = new Composer();
reminderDays.on('callback_query', async (ctx: any) => {
    try {
        const selectedDays = reminder.days.map(day => `${day.day} - ${getDayName(day.day)}`)
        const callbackQuery = ctx.callbackQuery.data
        const text = `Enter the reminder time for each selected day, in the format *day number - time* separated by commas:\n Example 1 - 16:20:00, 2 - 4:20:00, 3 - 15:30:00.\nSelected days - ${selectedDays}`
        switch (callbackQuery) {
            case '1':
                reminder.days.push({ day: '1', hours: '', minutes: '', seconds: '' })
                break
            case '2':
                reminder.days.push({ day: '2', hours: '', minutes: '', seconds: '' })
                break
            case '3':
                reminder.days.push({ day: '3', hours: '', minutes: '', seconds: '' })
                break
            case '4':
                reminder.days.push({ day: '4', hours: '', minutes: '', seconds: '' })
                break
            case '5':
                reminder.days.push({ day: '5', hours: '', minutes: '', seconds: '' })
                break
            case '6':
                reminder.days.push({ day: '6', hours: '', minutes: '', seconds: '' })
                break
            case '7':
                reminder.days.push({ day: '7', hours: '', minutes: '', seconds: '' })
                break
            case 'done':
                await sendMessage(ctx, ctx.chat.id, text)
                return ctx.wizard.next()
        }
    } catch (e) {
        log.error(e as Error);
    }
})

const reminderTime = new Composer();
reminderTime.on('message', async (ctx: any) => {
    try {
        const message = ctx.message.data
        const days = message.replace(' ', '').split(',')
        days.forEach((day: string) => {
            const timeByDay = day.split('-')
            reminder.days[Number(timeByDay[0])].hours = timeByDay[1].split(':')[0]
            reminder.days[Number(timeByDay[0])].minutes = timeByDay[1].split(':')[1]
            reminder.days[Number(timeByDay[0])].seconds = timeByDay[1].split(':')[2]
        })
        const markDown = [
            ['Got it!', 'leave'], ['Create new', 'enter']
        ]
        const text = `Done!\nYou will recieve reminder: '${reminder.data} ${reminder.type === 'once' ? 'on' : 'every'}`+
        `${reminder.days.map(day => `${getDayName(day.day)} as ${day.hours}:${day.minutes}:${day.seconds}\n`).join(', ')}`
        await replyWithMarkdown(ctx, markDown, text)
        return ctx.wizard.next()
    } catch (e) {
        log.error(e as Error);
    }
})
const lastAction = new Composer();
lastAction.on('callback_query', async (ctx: any) => {
    try{
        const callbackQuery = ctx.callbackQuery.data
        switch(callbackQuery){
            case 'leave':
                await replyWithMarkdown(
                    ctx,
                    [['New Reminder', 'new_reminder'], ['New Chat Reminder', 'new_chat_reminder']],
                    'Wazzzup'
                )
                ctx.leave()
                break
            case 'enter':
                NewChatReminderScene.enter()
                break
        }
    }catch (e) {
        log.error(e as Error);
    }
})

const NewChatReminderScene = new Scenes.WizardScene<any>("new_chat_reminder", reminderText, reminderType, reminderDays, reminderTime, lastAction);

NewChatReminderScene.enter(async (ctx: any) => {
    await ctx.reply("Send me message of reminder. It should be a text(sticker|emoji) or image");
    ctx.wizard.next()
});
export default NewChatReminderScene;