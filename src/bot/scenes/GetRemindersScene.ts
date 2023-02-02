import { Scenes, Markup } from 'telegraf';
// import { Update, Message, CallbackQuery } from 'telegraf/types';
export default class GetRemindersScene {
    private getRemindersScene

    constructor() {
        this.getRemindersScene = new Scenes.BaseScene('get_remindes');

        // this.getRemindersScene.action(THEATER_ACTION, (ctx) => {
        //     ctx.reply('You choose theater');
        //     ctx.session.myData.preferenceType = 'Theater';
        //     return ctx.scene.enter('SOME_OTHER_SCENE_ID'); // switch to some other scene
        // });

        // this.getRemindersScene.action(MOVIE_ACTION, (ctx) => {
        //     ctx.reply('You choose movie, your loss');
        //     ctx.session.myData.preferenceType = 'Movie';
        //     return ctx.scene.leave(); // exit global namespace
        // });

        this.getRemindersScene.leave((ctx) => {
            ctx.reply('Thank you for your time!');
        });

        // What to do if user entered a raw message or picked some other option?
        this.getRemindersScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Movie or Theater'));
    }

    enter(chats?: Array<{ chatId: number, chatName: string }>) {
        if (!chats) {
            return
        }
        this.getRemindersScene.enter((ctx) => {
            const markDown = Markup.inlineKeyboard(chats.map(chat => Markup.button.callback(chat.chatName, chat.chatId.toString())));
            ctx.replyWithMarkdownV2('Choose chat for riminding', markDown)
        });
    }
}