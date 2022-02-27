from channels.generic.websocket import AsyncWebsocketConsumer
import json

# class ChatConsumer(AsyncWebsocketConsumer):

#     async def connect(self):
#         self.room_group_name = 'Test-Room'
#         print('in connect')
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def recieve(self, text_data):
#         recieve_dict = json.loads(text_data)
#         print("in recieve")
#         print(text_data)
#         msg = recieve_dict['msg']
#         action = recieve_dict['action']

#         if action == 'new-offer' or action == 'new-answer':
#             reciever_channel_name = recieve_dict['msg']['reciever_channel_name']
#             recieve_dict['msg']['reviever_channel_name'] = self.channel_name
#             await self.channel_layer.group_send(
#                 reciever_channel_name,
#                 {
#                     'type':'send_sdp',
#                     'recieve_dict':recieve_dict
#                 }
#             )

#         recieve_dict['msg']['reciever_channel_name'] = self.channel_name      

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type':'send_sdp',
#                 'recieve_dict':recieve_dict
#             }
#         )

#     async def send_sdp(self, event):
#         recieve_dict = event['recieve_dict']
        
#         await self.send(text_data=json.dumps(recieve_dict))

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_group_name = 'Test-Room'
        print('in connect')
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def recieve(self, text_data):
        recieve_dict = json.loads(text_data)
        print("in recieve")
        print(text_data)
        msg = recieve_dict['message']   

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':'send.message',
                'message':msg
            }
        )

    async def send_message(self, event):
        msg = event['message']
        
        await self.send(text_data=json.dumps({'message':msg}))
