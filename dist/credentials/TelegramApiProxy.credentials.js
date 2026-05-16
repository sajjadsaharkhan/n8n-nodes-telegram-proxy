"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramApiProxy = void 0;
class TelegramApiProxy {
    constructor() {
        this.name = 'telegramApiProxy';
        this.displayName = 'Telegram API (with Proxy)';
        this.documentationUrl = 'https://core.telegram.org/bots/api';
        this.properties = [
            {
                displayName: 'Access Token',
                name: 'accessToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Chat with the <a href="https://telegram.me/botfather">BotFather</a> to obtain the access token',
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
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}/bot{{$credentials.accessToken}}',
                url: '/getMe',
            },
        };
    }
}
exports.TelegramApiProxy = TelegramApiProxy;
//# sourceMappingURL=TelegramApiProxy.credentials.js.map