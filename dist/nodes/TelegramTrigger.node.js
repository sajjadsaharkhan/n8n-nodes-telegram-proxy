"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramTrigger = exports.downloadFile = void 0;
const crypto_1 = __importDefault(require("crypto"));
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const downloadFile = async (webhookFunctions, credentials, bodyData, additionalFields) => {
    let imageSize = 'large';
    let key = 'message';
    if (bodyData.channel_post) {
        key = 'channel_post';
    }
    const eventData = bodyData[key];
    if (eventData?.photo && Array.isArray(eventData.photo) && eventData.photo.length > 0) {
        if (additionalFields.imageSize) {
            imageSize = additionalFields.imageSize;
        }
        const image = (0, GenericFunctions_1.getImageBySize)(eventData.photo, imageSize) || eventData.photo[0];
        const fileId = image.file_id;
        const fileResult = await GenericFunctions_1.apiRequest.call(webhookFunctions, 'POST', 'getFile', { file_id: fileId });
        const filePath = fileResult.result.file_path;
        const file = await GenericFunctions_1.apiRequest.call(webhookFunctions, 'GET', '', {}, {}, { json: false, encoding: null, uri: `${credentials.baseUrl}/file/bot${credentials.accessToken}/${filePath}`, resolveWithFullResponse: true });
        const data = Buffer.from(file.body);
        const fileName = filePath.split('/').pop();
        const binaryData = await webhookFunctions.helpers.prepareBinaryData(data, fileName);
        return {
            workflowData: [[{ json: bodyData, binary: { data: binaryData } }]],
        };
    }
    return {};
};
exports.downloadFile = downloadFile;
class TelegramTrigger {
    constructor() {
        this.description = {
            displayName: 'Telegram Trigger (with Proxy)',
            name: 'telegramProxyTrigger',
            icon: 'file:telegram.svg',
            group: ['trigger'],
            version: [1, 1.1, 1.2, 1.3],
            defaultVersion: 1.3,
            subtitle: '=Updates: {{$parameter["updates"].join(", ")}}',
            description: 'Starts the workflow on a Telegram update with proxy support',
            defaults: { name: 'Telegram Trigger (with Proxy)' },
            inputs: [],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [{ name: 'telegramApiProxy', required: true }],
            webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
            properties: [
                { displayName: 'Due to Telegram API limitations, you can use just one Telegram trigger for each bot at a time', name: 'telegramTriggerNotice', type: 'notice', default: '' },
                {
                    displayName: 'Trigger On',
                    name: 'updates',
                    type: 'multiOptions',
                    options: [
                        { name: '*', value: '*', description: 'All updates' },
                        { name: 'Callback Query', value: 'callback_query', description: 'Trigger on new incoming callback query' },
                        { name: 'Channel Post', value: 'channel_post', description: 'Trigger on new incoming channel post' },
                        { name: 'Edited Message', value: 'edited_message', description: 'Trigger on edited message' },
                        { name: 'Message', value: 'message', description: 'Trigger on new incoming message' },
                    ],
                    required: true,
                    default: [],
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    options: [
                        { displayName: 'Download Images/Files', name: 'download', type: 'boolean', default: false, description: 'Download attached images or files' },
                        {
                            displayName: 'Image Size',
                            name: 'imageSize',
                            type: 'options',
                            displayOptions: { show: { download: [true] } },
                            options: [{ name: 'Small', value: 'small' }, { name: 'Medium', value: 'medium' }, { name: 'Large', value: 'large' }, { name: 'Extra Large', value: 'extraLarge' }],
                            default: 'large',
                            description: 'The size of the image to be downloaded',
                        },
                        {
                            displayName: 'Restrict to Chat IDs',
                            name: 'chatIds',
                            type: 'string',
                            default: '',
                            description: 'The chat IDs to restrict the trigger to. Multiple can be defined separated by comma.',
                            displayOptions: { show: { '@version': [{ _cnd: { gte: 1.1 } }] } },
                        },
                        {
                            displayName: 'Restrict to User IDs',
                            name: 'userIds',
                            type: 'string',
                            default: '',
                            description: 'The user IDs to restrict the trigger to. Multiple can be defined separated by comma.',
                            displayOptions: { show: { '@version': [{ _cnd: { gte: 1.1 } }] } },
                        },
                    ],
                },
            ],
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    const webhookReturnData = await GenericFunctions_1.apiRequest.call(this, 'POST', 'getWebhookInfo', {});
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    return webhookReturnData.result.url === webhookUrl;
                },
                async create() {
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    let allowedUpdates = this.getNodeParameter('updates');
                    if ((allowedUpdates || []).includes('*')) {
                        allowedUpdates = [];
                    }
                    const secret_token = GenericFunctions_1.getSecretToken.call(this);
                    const drop_pending_updates = this.getNode().typeVersion >= 1.3;
                    await GenericFunctions_1.apiRequest.call(this, 'POST', 'setWebhook', { url: webhookUrl, allowed_updates: allowedUpdates, secret_token, drop_pending_updates });
                    return true;
                },
                async delete() {
                    try {
                        await GenericFunctions_1.apiRequest.call(this, 'POST', 'deleteWebhook', {});
                        return true;
                    }
                    catch (error) {
                        return false;
                    }
                },
            },
        };
    }
    async webhook() {
        const credentials = await this.getCredentials('telegramApiProxy');
        const bodyData = this.getBodyData();
        const headerData = this.getHeaderData();
        const nodeVersion = this.getNode().typeVersion;
        if (nodeVersion > 1) {
            const secret = GenericFunctions_1.getSecretToken.call(this);
            const secretBuffer = Buffer.from(secret);
            const headerSecretBuffer = Buffer.from(String(headerData['x-telegram-bot-api-secret-token'] ?? ''));
            if (secretBuffer.byteLength !== headerSecretBuffer.byteLength || !crypto_1.default.timingSafeEqual(secretBuffer, headerSecretBuffer)) {
                const res = this.getResponseObject();
                res.status(403).json({ message: 'Provided secret is not valid' });
                return { noWebhookResponse: true };
            }
        }
        const additionalFields = this.getNodeParameter('additionalFields');
        if (additionalFields.download) {
            const downloadFilesResult = await (0, exports.downloadFile)(this, credentials, bodyData, additionalFields);
            if (Object.entries(downloadFilesResult).length !== 0)
                return downloadFilesResult;
        }
        if (nodeVersion >= 1.2) {
            if (additionalFields.chatIds) {
                const chatIds = additionalFields.chatIds;
                const splitIds = chatIds.split(',').map((chatId) => chatId.trim());
                if (!splitIds.includes(String(bodyData.message?.chat?.id))) {
                    return {};
                }
            }
            if (additionalFields.userIds) {
                const userIds = additionalFields.userIds;
                const splitIds = userIds.split(',').map((userId) => userId.trim());
                if (!splitIds.includes(String(bodyData.message?.from?.id))) {
                    return {};
                }
            }
        }
        return { workflowData: [this.helpers.returnJsonArray([bodyData])] };
    }
}
exports.TelegramTrigger = TelegramTrigger;
//# sourceMappingURL=TelegramTrigger.node.js.map