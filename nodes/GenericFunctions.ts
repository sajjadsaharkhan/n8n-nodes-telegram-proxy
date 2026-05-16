import { lookup } from 'mime-types';
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export interface IProxyConfig {
	host?: string;
	port?: number;
	protocol?: string;
	auth?: {
		username?: string;
		password?: string;
	};
}

// Interface in n8n
export interface IMarkupKeyboard {
	rows?: IMarkupKeyboardRow[];
}

export interface IMarkupKeyboardRow {
	row?: IMarkupKeyboardRow;
}

export interface IMarkupKeyboardRow {
	buttons?: IMarkupKeyboardButton[];
}

export interface IMarkupKeyboardButton {
	text: string;
	additionalFields?: IDataObject;
}

// Interface in Telegram
export interface ITelegramInlineReply {
	inline_keyboard?: ITelegramKeyboardButton[][];
}

export interface ITelegramKeyboardButton {
	[key: string]: string | number | boolean;
}

export interface ITelegramReplyKeyboard extends IMarkupReplyKeyboardOptions {
	keyboard: ITelegramKeyboardButton[][];
}

// Shared interfaces
export interface IMarkupForceReply {
	force_reply?: boolean;
	selective?: boolean;
}

export interface IMarkupReplyKeyboardOptions {
	one_time_keyboard?: boolean;
	resize_keyboard?: boolean;
	selective?: boolean;
}

export interface IMarkupReplyKeyboardRemove {
	force_reply?: boolean;
	selective?: boolean;
}

function getProxyUrl(proxy: IProxyConfig): string | undefined {
	if (!proxy.host || !proxy.port) {
		return undefined;
	}

	const protocol = proxy.protocol || 'http';
	const auth = proxy.auth?.username
		? `${encodeURIComponent(proxy.auth.username)}:${encodeURIComponent(proxy.auth.password)}@`
		: '';

	return `${protocol}://${auth}${proxy.host}:${proxy.port}`;
}

/**
 * Add the additional fields to the body
 */
export function addAdditionalFields(
	this: IExecuteFunctions,
	body: IDataObject,
	index: number,
	nodeVersion?: number,
	instanceId?: string,
) {
	const operation = this.getNodeParameter('operation', index);

	// Add the additional fields
	const additionalFields = this.getNodeParameter('additionalFields', index);

	if (operation === 'sendMessage') {
		const attributionText = 'This message was sent automatically with ';
		const link = `https://n8n.io?utm_source=${instanceId ?? 'n8n-nodes-telegram-proxy'}`;

		if (nodeVersion && nodeVersion >= 1.1 && additionalFields.appendAttribution === undefined) {
			additionalFields.appendAttribution = true;
		}

		if (!additionalFields.parse_mode) {
			additionalFields.parse_mode = 'Markdown';
		}

		const regex = /(https?|ftp|file):\/\/\S+|www\.\S+|\S+\.\S+/;
		const containsUrl = regex.test(body.text as string);

		if (!containsUrl) {
			body.disable_web_page_preview = true;
		}

		if (additionalFields.appendAttribution) {
			if (additionalFields.parse_mode === 'Markdown') {
				body.text = `${body.text}\n\n_${attributionText}_[n8n](${link})`;
			} else if (additionalFields.parse_mode === 'HTML') {
				body.text = `${body.text}\n\n<em>${attributionText}</em><a href="${link}" target="_blank">n8n</a>`;
			}
		}

		if (
			nodeVersion &&
			nodeVersion >= 1.2 &&
			additionalFields.disable_web_page_preview === undefined
		) {
			body.disable_web_page_preview = true;
		}

		delete additionalFields.appendAttribution;
	}

	Object.assign(body, additionalFields);

	// Add the reply markup
	let replyMarkupOption = '';
	if (operation !== 'sendMediaGroup') {
		replyMarkupOption = this.getNodeParameter('replyMarkup', index) as string;
		if (replyMarkupOption === 'none') {
			return;
		}
	}

	body.reply_markup = {} as
		| IMarkupForceReply
		| IMarkupReplyKeyboardRemove
		| ITelegramInlineReply
		| ITelegramReplyKeyboard;
	if (['inlineKeyboard', 'replyKeyboard'].includes(replyMarkupOption)) {
		let setParameterName = 'inline_keyboard';
		if (replyMarkupOption === 'replyKeyboard') {
			setParameterName = 'keyboard';
		}

		const keyboardData = this.getNodeParameter(replyMarkupOption, index) as IMarkupKeyboard;

		(body.reply_markup as ITelegramInlineReply | ITelegramReplyKeyboard)[setParameterName] =
			[] as ITelegramKeyboardButton[][];
		let sendButtonData: ITelegramKeyboardButton;
		if (keyboardData.rows !== undefined) {
			for (const row of keyboardData.rows) {
				const sendRows: ITelegramKeyboardButton[] = [];
				if (row.row?.buttons === undefined) {
					continue;
				}
				for (const button of row.row.buttons) {
					sendButtonData = {};
					sendButtonData.text = button.text;
					if (button.additionalFields) {
						Object.assign(sendButtonData, button.additionalFields);
					}
					sendRows.push(sendButtonData);
				}

				const array = (body.reply_markup as ITelegramInlineReply | ITelegramReplyKeyboard)[
					setParameterName
				] as ITelegramKeyboardButton[][];
				array.push(sendRows);
			}
		}
	} else if (replyMarkupOption === 'forceReply') {
		const forceReply = this.getNodeParameter('forceReply', index) as IMarkupForceReply;
		body.reply_markup = forceReply;
	} else if (replyMarkupOption === 'replyKeyboardRemove') {
		const forceReply = this.getNodeParameter(
			'replyKeyboardRemove',
			index,
		) as IMarkupReplyKeyboardRemove;
		body.reply_markup = forceReply;
	}

	if (replyMarkupOption === 'replyKeyboard') {
		const replyKeyboardOptions = this.getNodeParameter(
			'replyKeyboardOptions',
			index,
		) as IMarkupReplyKeyboardOptions;
		Object.assign(body.reply_markup, replyKeyboardOptions);
	}
}

/**
 * Make an API request to Telegram with proxy support
 */
export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('telegramApiProxy');

	query = query || {};

	const options: IRequestOptions = {
		headers: {},
		method,
		uri: `${credentials.baseUrl}/bot${credentials.accessToken}/${endpoint}`,
		body,
		qs: query,
		json: true,
	};

	// Add proxy support
	const proxyConfig = credentials.httpProxy as IDataObject;
	if (proxyConfig && proxyConfig.proxy) {
		const proxy = proxyConfig.proxy as IProxyConfig;
		const proxyUrl = getProxyUrl(proxy);
		if (proxyUrl) {
			options.proxy = proxyUrl;
		}
	}

	if (Object.keys(option).length > 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export function getImageBySize(photos: IDataObject[], size: string): IDataObject | undefined {
	const sizes = {
		small: 0,
		medium: 1,
		large: 2,
		extraLarge: 3,
	} as IDataObject;

	const index = sizes[size] as number;

	return photos[index];
}

export function getPropertyName(operation: string) {
	return operation.replace('send', '').toLowerCase();
}

export function getSecretToken(this: IHookFunctions | IWebhookFunctions) {
	// Only characters A-Z, a-z, 0-9, _ and - are allowed.
	const secret_token = `${this.getWorkflow().id}_${this.getNode().id}`;
	return secret_token.replace(/[^a-zA-Z0-9\_\-]+/g, '');
}

export function createSendAndWaitMessageBody(context: IExecuteFunctions) {
	const chat_id = context.getNodeParameter('chatId', 0) as string;

	const instanceId = context.getInstanceId();
	const attributionText = 'This message was sent automatically with ';
	const link = `https://n8n.io?utm_source=${instanceId ?? 'n8n-nodes-telegram-proxy'}`;
	let text = `Please select an option:\n\n${context.getNodeParameter('message', 0) as string}`;

	text = `${text}\n\n_${attributionText}_[n8n](${link})`;

	const body = {
		chat_id,
		text,

		disable_web_page_preview: true,
		parse_mode: 'Markdown',
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '✅ Approve',
						url: context.getNodeParameter('approveUrl', 0) as string,
					},
					{
						text: '❌ Decline',
						url: context.getNodeParameter('disapproveUrl', 0) as string,
					},
				],
			],
		},
	};

	return body;
}
