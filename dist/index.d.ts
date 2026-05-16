import { INodeType, ICredentialType } from 'n8n-workflow';
import { Telegram } from './nodes/Telegram.node';
import { TelegramTrigger } from './nodes/TelegramTrigger.node';
import { TelegramApiProxy } from './credentials/TelegramApiProxy.credentials';

export declare const nodeClasses: INodeType[];
export declare const credentialClasses: ICredentialType[];
