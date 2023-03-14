import { log } from "@bb/source-log-ts";
import { Markup } from "telegraf";

export async function replyWithMarkdown(ctx: any, buttons: Array<Array<string>>, text: string): Promise<number> {
    try {
        const markDown = Markup.inlineKeyboard(buttons.map(mark => {
            if (mark[2] === 'webapp') {
                return Markup.button.webApp(mark[0], mark[1])
            }
            return Markup.button.callback(mark[0], mark[1])
        }));
        text = escape(text);
        const msg = await ctx.replyWithMarkdownV2(text, markDown)
        return msg.message_id
    } catch (e: unknown) {
        log.error(e as Error)
        return -1
    }
}

export async function sendMessage(ctx: any, chatId: number, text: string): Promise<number> {
    try {
        text = escape(text);
        const msg = await ctx.sendMessage(chatId, text)
        return msg.message_id
    } catch (e: unknown) {
        log.error(e as Error)
        return -1
    }
}

export async function deleteMessage(ctx: any, chatId: number, msgId: number): Promise<boolean> {
    try {
        return await ctx.deleteMessage(chatId, msgId)
    } catch (e: unknown) {
        log.error(e as Error)
        return false
    }
}

export function escape(string: string): string {
    if (typeof string !== 'string') {
        throw new TypeError('Expected a string');
    }
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string
        .replace(/[|\\{}()[\]^$\!*?.+-]/g, '\\$&')
    // .replace(/-/g, '\\x2d');
}

export function getDayName(day: string): string {
    switch (day) {
        case '1':
            return 'Monday'
        case '2':
            return 'Tuesday'
        case '3':
            return 'Wednesday'
        case '4':
            return 'Thursday'
        case '5':
            return 'Friday'
        case '6':
            return 'Saturday'
        case '7':
            return 'Sunday'
        default:
            return ''
    }
}