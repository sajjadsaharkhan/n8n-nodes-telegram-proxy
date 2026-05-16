import type { INodeType } from 'n8n-workflow';

import { Telegram } from './Telegram.node';
import { TelegramTrigger } from './TelegramTrigger.node';

export const nodeClasses: INodeType[] = [new Telegram(), new TelegramTrigger()];
