from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

class TwilioSMS:
    def __init__(self, account_sid: str, auth_token: str) -> None:
        """
        Initializes the Twilio client with the provided account SID and auth token.
        """
        self.client = Client(account_sid, auth_token)

    def send_sms(self, from_number: str, to_number: str, message: str) -> str:
        """
        Sends an SMS message through Twilio's API.

        Parameters:
            from_number (str): The Twilio phone number to send the message from.
            to_number (str): The recipient's phone number.
            message (str): The message text to send.

        Returns:
            str: The message SID if sent successfully.

        Raises:
            TwilioRestException: An error occurred when sending the message through the Twilio API.
        """
        try:
            message = self.client.messages.create(
                body=message,
                from_=from_number,
                to=to_number
            )
            return message.sid
        except TwilioRestException as e:
            raise Exception(f"An error occurred while sending the message: {e}")
        
