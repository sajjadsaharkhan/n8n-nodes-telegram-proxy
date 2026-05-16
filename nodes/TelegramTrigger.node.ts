import crypto from 'crypto';
import type {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { apiRequest, getSecretToken, getImageBySize } from './GenericFunctions';
import type { IEvent } from './IEvent';

export const downloadFile = async (
	webhookFunctions: IWebhookFunctions,
	credentials: IDataObject,
	bodyData: IEvent,
	additionalFields: IDataObject,
): Promise<IWebhookResponseData> => {
	let imageSize = 'large';
	let key: 'message' | 'channel_post' = 'message';

	if (bodyData.channel_post) {
		key = 'channel_post';
	}

	const eventData = bodyData[key];
	if (eventData?.photo && Array.isArray(eventData.photo) && eventData.photo.length > 0) {
		if (additionalFields.imageSize) {
			imageSize = additionalFields.imageSize as string;
		}

		const image = getImageBySize(eventData.photo as IDataObject[], imageSize) as IDataObject || eventData.photo[0];
		const fileId = image.file_id as string;

		const fileResult = await apiRequest.call(webhookFunctions, 'POST', 'getFile', { file_id: fileId });
		const filePath = fileResult.result.file_path as string;

		const file = await apiRequest.call(
			webhookFunctions,
			'GET',
			'',
			{},
			{},
			{ json: false, encoding: null, uri: `${credentials.baseUrl}/file/bot${credentials.accessToken}/${filePath}`, resolveWithFullResponse: true },
		);

		const data = Buffer.from(file.body as string);
		const fileName = filePath.split('/').pop() as string;
		const binaryData = await webhookFunctions.helpers.prepareBinaryData(data as unknown as Buffer, fileName);

		return {
			workflowData: [[{ json: bodyData as unknown as IDataObject, binary: { data: binaryData } }]],
		};
	}

	return {};
};

export class TelegramTrigger implements INodeType {
	description: INodeTypeDescription = {
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
		outputs: [NodeConnectionTypes.Main],
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

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookReturnData = await apiRequest.call(this, 'POST', 'getWebhookInfo', {});
				const webhookUrl = this.getNodeWebhookUrl('default');
				return webhookReturnData.result.url === webhookUrl;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				let allowedUpdates = this.getNodeParameter('updates') as string[];
				if ((allowedUpdates || []).includes('*')) {
					allowedUpdates = [];
				}
				const secret_token = getSecretToken.call(this);
				const drop_pending_updates = this.getNode().typeVersion >= 1.3;
				await apiRequest.call(this, 'POST', 'setWebhook', { url: webhookUrl, allowed_updates: allowedUpdates, secret_token, drop_pending_updates });
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				try {
					await apiRequest.call(this, 'POST', 'deleteWebhook', {});
					return true;
				} catch (error) {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const credentials = await this.getCredentials('telegramApiProxy');
		const bodyData = this.getBodyData() as unknown as IEvent;
		const headerData = this.getHeaderData();
		const nodeVersion = this.getNode().typeVersion;

		if (nodeVersion > 1) {
			const secret = getSecretToken.call(this);
			const secretBuffer = Buffer.from(secret);
			const headerSecretBuffer = Buffer.from(String(headerData['x-telegram-bot-api-secret-token'] ?? ''));
			if (secretBuffer.byteLength !== headerSecretBuffer.byteLength || !crypto.timingSafeEqual(secretBuffer, headerSecretBuffer)) {
				const res = this.getResponseObject();
				res.status(403).json({ message: 'Provided secret is not valid' });
				return { noWebhookResponse: true };
			}
		}

		const additionalFields = this.getNodeParameter('additionalFields') as IDataObject;

		if (additionalFields.download) {
			const downloadFilesResult = await downloadFile(this, credentials, bodyData, additionalFields);
			if (Object.entries(downloadFilesResult).length !== 0) return downloadFilesResult;
		}

		if (nodeVersion >= 1.2) {
			if (additionalFields.chatIds) {
				const chatIds = additionalFields.chatIds as string;
				const splitIds = chatIds.split(',').map((chatId) => chatId.trim());
				if (!splitIds.includes(String(bodyData.message?.chat?.id))) {
					return {};
				}
			}
			if (additionalFields.userIds) {
				const userIds = additionalFields.userIds as string;
				const splitIds = userIds.split(',').map((userId) => userId.trim());
				if (!splitIds.includes(String(bodyData.message?.from?.id))) {
					return {};
				}
			}
		}

		return { workflowData: [this.helpers.returnJsonArray([bodyData as unknown as IDataObject])] };
	}
}
