import type { IDataObject } from 'n8n-workflow';

export interface IEvent {
	update_id: number;
	message?: {
		message_id: number;
		from: {
			id: number;
			is_bot: boolean;
			first_name: string;
			last_name?: string;
			username?: string;
			language_code?: string;
		};
		chat: {
			id: number;
			first_name?: string;
			last_name?: string;
			username?: string;
			type: string;
		};
		date: number;
		text?: string;
		photo?: Array<{
			file_id: string;
			file_unique_id: string;
			file_size: number;
			width: number;
			height: number;
		}>;
		document?: {
			file_id: string;
			file_unique_id: string;
			file_name?: string;
			mime_type?: string;
			file_size?: number;
		};
		video?: {
			file_id: string;
			file_unique_id: string;
			width: number;
			height: number;
			duration: number;
			file_size?: number;
		};
	};
	edited_message?: IDataObject;
	channel_post?: IDataObject;
	edited_channel_post?: IDataObject;
	inline_query?: IDataObject;
	chosen_inline_result?: IDataObject;
	callback_query?: IDataObject;
	shipping_query?: IDataObject;
	pre_checkout_query?: IDataObject;
	poll?: IDataObject;
	poll_answer?: IDataObject;
	my_chat_member?: IDataObject;
	chat_member?: IDataObject;
	chat_join_request?: IDataObject;
}
