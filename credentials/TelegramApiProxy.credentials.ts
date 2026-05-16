import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TelegramApiProxy implements ICredentialType {
	name = 'telegramApiProxy';

	displayName = 'Telegram API (with Proxy)';

	documentationUrl = 'https://core.telegram.org/bots/api';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Chat with the <a href="https://telegram.me/botfather">BotFather</a> to obtain the access token',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.telegram.org',
			description: 'Base URL for Telegram Bot API',
		},
		{
			displayName: 'HTTP Proxy',
			name: 'httpProxy',
			placeholder: 'Add Proxy',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: false,
			},
			default: {},
			options: [
				{
					displayName: 'Proxy',
					name: 'proxy',
					values: [
						{
							displayName: 'Host',
							name: 'host',
							type: 'string',
							default: '',
							description: 'Proxy server hostname or IP address',
						},
						{
							displayName: 'Port',
							name: 'port',
							type: 'number',
							default: 3128,
							description: 'Proxy server port',
							typeOptions: {
								minValue: 1,
								maxValue: 65535,
							},
						},
						{
							displayName: 'Protocol',
							name: 'protocol',
							type: 'options',
							options: [
								{
									name: 'HTTP',
									value: 'http',
								},
								{
									name: 'HTTPS',
									value: 'https',
								},
								{
									name: 'SOCKS',
									value: 'socks',
								},
								{
									name: 'SOCKS5',
									value: 'socks5',
								},
							],
							default: 'http',
							description: 'Proxy protocol type',
						},
						{
							displayName: 'Authentication',
							name: 'auth',
							type: 'collection',
							placeholder: 'Add Authentication',
							default: {},
							options: [
								{
									displayName: 'Username',
									name: 'username',
									type: 'string',
									default: '',
									description: 'Proxy authentication username',
								},
								{
									displayName: 'Password',
									name: 'password',
									type: 'string',
									typeOptions: { password: true },
									default: '',
									description: 'Proxy authentication password',
								},
							],
						},
					],
				},
			],
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}/bot{{$credentials.accessToken}}',
			url: '/getMe',
		},
	};
}
