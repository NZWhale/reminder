import { Scenes, Markup } from 'telegraf';
// import { Update, Message, CallbackQuery } from 'telegraf/types';
export default class NewReminderScene {
  private newReminderScene

  constructor() {
      this.newReminderScene = new Scenes.BaseScene('new_reminder');
      
      // this.newReminderScene.action(THEATER_ACTION, (ctx) => {
      //     ctx.reply('You choose theater');
      //     ctx.session.myData.preferenceType = 'Theater';
      //     return ctx.scene.enter('SOME_OTHER_SCENE_ID'); // switch to some other scene
      // });
      
      // this.newReminderScene.action(MOVIE_ACTION, (ctx) => {
      //     ctx.reply('You choose movie, your loss');
      //     ctx.session.myData.preferenceType = 'Movie';
      //     return ctx.scene.leave(); // exit global namespace
      // });
      
      this.newReminderScene.leave((ctx) => {
          ctx.reply('Thank you for your time!');
      });
      
      // What to do if user entered a raw message or picked some other option?
      this.newReminderScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Movie or Theater'));
  }

  enter(chats?: Array<{chatId: number, chatName: string}>){
    if(!chats){
        return
    }
    this.newReminderScene.enter((ctx) => {
        const markDown = Markup.inlineKeyboard(chats.map(chat => Markup.button.callback(chat.chatName, chat.chatId.toString())));
        ctx.replyWithMarkdownV2('Choose chat for riminding', markDown)
    });
}
}
