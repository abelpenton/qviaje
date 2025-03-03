//@ts-nocheck

import {NextResponse} from 'next/server'
import fetch from 'node-fetch';

export async function POST(request: Request) {
    const { message } = await request.json();

    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const params = {
        chat_id: chatId,
        text: message,
    };

    try {
        // const response = await fetch(url, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(params),
        // });
        //
        // const result = await response.json();
        return NextResponse.json({ success: true, message: 'Message sent' });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: 'Error sending message', error });
    }
}
