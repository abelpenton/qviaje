import {NextResponse} from 'next/server'

export async function POST(request: Request) {
    try {

        console.log(request.json())


        return NextResponse.json({status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
    }
}