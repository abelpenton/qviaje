import {Resend} from 'resend'
import {NextResponse} from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(request: Request) {
    try {
        const {name, email, subject, message} = await request.json();

        const response = await resend.emails.send({
            from: 'QViaje <no-reply@qviaje.com>',
            to: "2235penton@gmail.com",
            subject: 'Mensaje de Soporte',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <p>Nombre ${name},</p>
              <p>Email ${email},</p>
              <p>Asunto ${subject},</p>
              <p>Mensaje ${message}</p>                            
            </div>
      `,
        });

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