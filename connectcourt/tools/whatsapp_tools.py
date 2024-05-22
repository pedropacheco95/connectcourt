from twilio.rest import Client

class TwilioWhatsApp:
    def __init__(self, account_sid: str, auth_token: str):
        """
        Initializes the Twilio client with the provided account SID and auth token.
        """
        self.client = Client(account_sid, auth_token)

    def send_whatsapp_message(self, from_number: str, to_number: str, message: str) -> str:
        """
        Sends a WhatsApp message through Twilio's API.

        Parameters:
            from_number (str): The Twilio WhatsApp number to send the message from, must be in format 'whatsapp:+1234567890'.
            to_number (str): The recipient's WhatsApp number, must be in format 'whatsapp:+1234567890'.
            message (str): The message text to send.

        Returns:
            str: The message SID if sent successfully.
        """
        message_instance = self.client.messages.create(
            from_=from_number,
            body=message,
            to=to_number
        )
        return message_instance.sid