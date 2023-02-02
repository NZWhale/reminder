import { Scenes, Markup } from 'telegraf';
// import { Update, Message, CallbackQuery } from 'telegraf/types';
export default class RegistrationScene {
    private registrationScene

    constructor() {
        this.registrationScene = new Scenes.BaseScene('registration');
        
        // this.registrationScene.action(THEATER_ACTION, (ctx) => {
        //     ctx.reply('You choose theater');
        //     ctx.session.myData.preferenceType = 'Theater';
        //     return ctx.scene.enter('SOME_OTHER_SCENE_ID'); // switch to some other scene
        // });
        
        // this.registrationScene.action(MOVIE_ACTION, (ctx) => {
        //     ctx.reply('You choose movie, your loss');
        //     ctx.session.myData.preferenceType = 'Movie';
        //     return ctx.scene.leave(); // exit global namespace
        // });
        
        this.registrationScene.leave((ctx) => {
            ctx.reply('Thank you for your time!');
        });
        
        // What to do if user entered a raw message or picked some other option?
        this.registrationScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Movie or Theater'));
    }

    enter(chats?: Array<{chatId: number, chatName: string}>){
        if(!chats){
            return
        }
        this.registrationScene.enter((ctx) => {
            const markDown = Markup.inlineKeyboard(chats.map(chat => Markup.button.callback(chat.chatName, chat.chatId.toString())));
            ctx.replyWithMarkdownV2('Choose chat for riminding', markDown)
        });
    }
}


