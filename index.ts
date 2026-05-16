import type { INodeType, ICredentialType } from 'n8n-workflow';

import { Telegram } from './nodes/Telegram.node';
import { TelegramTrigger } from './nodes/TelegramTrigger.node';
import { TelegramApiProxy } from './credentials/TelegramApiProxy.credentials';

export const nodeClasses: INodeType[] = [new Telegram(), new TelegramTrigger()];

export const credentialClasses: ICredentialType[] = [new TelegramApiProxy()];
