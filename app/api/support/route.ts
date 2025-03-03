import {Resend} from 'resend'
import {NextResponse} from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(request: Request) {
    try {
        const {name, email, subject, message} = await request.json();

        const response = await resend.emails.send({
            from: email,
            to: 'soporte@qviaje.com',
            subject: subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <p>Hola mi nombre es ${name},</p>
              <p>${message}</p>
                            
            </div>
      `,
        });

        console.log(response)

        return NextResponse.json({ status: 201 });
    }
    catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Error al registrar la agencia' },
            { status: 500 }
        );
    }
}