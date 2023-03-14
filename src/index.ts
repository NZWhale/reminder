import process from 'process';
import Database from './database';
import configuration, { IConfig } from './configuration';
import BotProcessor from './bot';
import NewChatReminderScene from './bot/scenes/NewChatReminderScene';


async function main(): Promise<void> {
    try {
        const config = configuration()
        validateConfig(config)
        new BotProcessor(
            config.telegram.apiKey as string,
            new Database(config.db)
        )
    } catch (err) {
        console.error(err instanceof Error ? err : new Error(String(err)));
        process.exit(1);
    }
}

void main();

function validateConfig(config: IConfig): void {
    // Object.keys(config).forEach((key: string) => {

    // })
    if (Object.values(config.db).some(val => !val)) {
        throw new Error('incorrect db config')
    }
    if (Object.values(config.telegram).some(val => !val)) {
        throw new Error('incorrect telegram config')
    }
}