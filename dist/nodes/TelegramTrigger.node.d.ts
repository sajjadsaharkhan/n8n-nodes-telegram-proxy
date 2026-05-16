import type { IHookFunctions, IWebhookFunctions, IDataObject, INodeType, INodeTypeDescription, IWebhookResponseData } from 'n8n-workflow';
import type { IEvent } from './IEvent';
export declare const downloadFile: (webhookFunctions: IWebhookFunctions, credentials: IDataObject, bodyData: IEvent, additionalFields: IDataObject) => Promise<IWebhookResponseData>;
export declare class TelegramTrigger implements INodeType {
    description: INodeTypeDescription;
    webhookMethods: {
        default: {
            checkExists(this: IHookFunctions): Promise<boolean>;
            create(this: IHookFunctions): Promise<boolean>;
            delete(this: IHookFunctions): Promise<boolean>;
        };
    };
    webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>;
}
