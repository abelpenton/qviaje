//@ts-nocheck
export default function useTelegramBot() {

    const sendMessageToTelegram = async (message) => {
        try {
            const response = await fetch('/api/alerts/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const result = await response.json();
            if (result.success) {
                console.log('Message sent successfully');
            } else {
                console.error('Error sending message:', result.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return {
        sendMessageToTelegram
    }
}