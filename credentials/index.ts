import type { ICredentialType } from 'n8n-workflow';

import { TelegramApiProxy } from './TelegramApiProxy.credentials';

export const credentialClasses: ICredentialType[] = [new TelegramApiProxy()];
