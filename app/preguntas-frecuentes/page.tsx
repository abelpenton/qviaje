// @ts-nocheck
"use client";

import {useEffect, useState} from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {useSearchParams} from 'next/navigation'

export default function PreguntasFrecuentesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Preguntas para viajeros
    const viajerosQuestions = [
        {
            category: "Búsqueda de Paquetes",
            questions: [
                {
                    question: "¿Cómo puedo buscar paquetes turísticos?",
                    answer: "Puedes buscar paquetes turísticos de varias formas: 1) Desde la página principal, utiliza el buscador para filtrar por destino, fechas y número de viajeros. 2) En la sección 'Explorar', puedes aplicar filtros más específicos como rango de precio, duración, categorías y más. 3) También puedes ver los paquetes destacados en la página principal."
                },
                {
                    question: "¿Puedo filtrar los paquetes por precio?",
                    answer: "Sí, en la sección 'Explorar' encontrarás un filtro de rango de precios que te permite establecer un mínimo y un máximo para ajustar los resultados a tu presupuesto."
                },
                {
                    question: "¿Cómo encuentro paquetes para una fecha específica?",
                    answer: "En el buscador principal o en la sección 'Explorar', puedes seleccionar una fecha específica en el calendario. La plataforma te mostrará los paquetes que tienen salidas disponibles en esa fecha o fechas cercanas."
                },
                {
                    question: "¿Puedo buscar paquetes para un número específico de personas?",
                    answer: "Sí, puedes especificar el número de viajeros tanto en el buscador principal como en los filtros de la sección 'Explorar'. Esto te ayudará a encontrar paquetes que se adapten al tamaño de tu grupo."
                }
            ]
        },
        {
            category: "Agencias de Viaje",
            questions: [
                {
                    question: "¿Cómo sé si una agencia es confiable?",
                    answer: "En QViaje, las agencias verificadas muestran una insignia de 'Verificado' junto a su nombre. Esto significa que hemos confirmado su existencia, datos de contacto y presencia en redes sociales. Además, puedes revisar las calificaciones y reseñas de otros viajeros."
                },
                {
                    question: "¿Cómo puedo ver todos los paquetes de una agencia específica?",
                    answer: "Puedes ver todos los paquetes de una agencia específica de dos maneras: 1) En la página de detalles de cualquier paquete, haz clic en el nombre de la agencia para ver su perfil. 2) En la sección 'Agencias', busca la agencia que te interesa y haz clic en 'Ver Paquetes'."
                },
                {
                    question: "¿Puedo contactar directamente a la agencia?",
                    answer: "Sí, en la página de detalles de cada paquete encontrarás un botón para contactar directamente a la agencia por WhatsApp. También puedes ver su información de contacto (teléfono, email, sitio web) en la pestaña 'Agencia' dentro de los detalles del paquete."
                }
            ]
        },
        {
            category: "Favoritos y Reseñas",
            questions: [
                {
                    question: "¿Cómo guardo un paquete en favoritos?",
                    answer: "Para guardar un paquete en favoritos, debes iniciar sesión como usuario. Luego, en la página de detalles del paquete, encontrarás un botón con un ícono de corazón. Al hacer clic, el paquete se guardará en tu lista de favoritos."
                },
                {
                    question: "¿Dónde puedo ver mis paquetes favoritos?",
                    answer: "Puedes acceder a tus paquetes favoritos desde la sección 'Mis Paquetes' en el menú de navegación. Allí encontrarás todos los paquetes que has guardado y podrás gestionarlos."
                },
                {
                    question: "¿Cómo puedo escribir una reseña sobre un paquete?",
                    answer: "Para escribir una reseña, debes iniciar sesión como usuario. En la página de detalles del paquete, ve a la pestaña 'Reseñas' y encontrarás un formulario para calificar y comentar tu experiencia. También puedes subir fotos de tu viaje."
                },
                {
                    question: "¿Puedo eliminar o editar mi reseña?",
                    answer: "Actualmente, no es posible editar reseñas publicadas. Si necesitas modificar o eliminar una reseña, por favor contacta a nuestro equipo de soporte."
                }
            ]
        },
        {
            category: "Reservas y Pagos",
            questions: [
                {
                    question: "¿Cómo reservo un paquete turístico?",
                    answer: "Para reservar un paquete, debes contactar directamente a la agencia. En la página de detalles del paquete, encontrarás un botón para iniciar una conversación por WhatsApp donde podrás solicitar más información y coordinar la reserva."
                },
                {
                    question: "¿QViaje procesa los pagos de los paquetes?",
                    answer: "No, QViaje no procesa pagos directamente. Somos una plataforma que conecta viajeros con agencias de viaje. Los pagos y condiciones de reserva se gestionan directamente con la agencia seleccionada."
                },
                {
                    question: "¿Qué sucede si tengo problemas con mi reserva?",
                    answer: "Si tienes problemas con tu reserva, debes contactar directamente a la agencia de viajes. Si no recibes una respuesta satisfactoria, puedes reportar el problema a nuestro equipo de soporte y evaluaremos la situación."
                }
            ]
        },
        {
            category: "Cuenta de Usuario",
            questions: [
                {
                    question: "¿Cómo creo una cuenta en QViaje?",
                    answer: "Para crear una cuenta, haz clic en 'Registro' en el menú de navegación. Completa el formulario con tu nombre, email, teléfono y una foto opcional. Una vez registrado, podrás guardar favoritos y escribir reseñas."
                },
                {
                    question: "¿Cómo actualizo mi información personal?",
                    answer: "Puedes actualizar tu información personal en la sección 'Mi Perfil'. Allí podrás modificar tu nombre, email, teléfono y foto de perfil."
                },
                {
                    question: "¿Puedo eliminar mi cuenta?",
                    answer: "Si deseas eliminar tu cuenta, por favor contacta a nuestro equipo de soporte. Ten en cuenta que al eliminar tu cuenta, perderás acceso a tus favoritos y reseñas publicadas."
                }
            ]
        }
    ];

    // Preguntas para agencias
    const agenciasQuestions = [
        {
            category: "Registro y Verificación",
            questions: [
                {
                    question: "¿Cómo registro mi agencia en QViaje?",
                    answer: "Para registrar tu agencia, haz clic en 'Soy Agencia' en el menú de navegación. Completa el formulario con la información de tu agencia, incluyendo nombre, email, contraseña y ubicación. Una vez registrado, podrás acceder al panel de control para gestionar tus paquetes."
                },
                {
                    question: "¿Qué es la verificación de agencia y cómo la obtengo?",
                    answer: "La verificación es un proceso que aumenta la confianza de los viajeros en tu agencia. Para obtenerla, debes completar tu perfil con: logo de la agencia, sitio web válido, perfil de Facebook e Instagram. Una vez completados estos requisitos, puedes solicitar la verificación desde la sección 'Configuración' en tu panel de control."
                },
                {
                    question: "¿Cuánto tiempo toma el proceso de verificación?",
                    answer: "El proceso de verificación es automático y se realiza inmediatamente si cumples con todos los requisitos. Si encuentras algún problema durante el proceso, contacta a nuestro equipo de soporte."
                }
            ]
        },
        {
            category: "Gestión de Paquetes",
            questions: [
                {
                    question: "¿Cómo creo un nuevo paquete turístico?",
                    answer: "Para crear un nuevo paquete, accede a tu panel de control y haz clic en 'Paquetes' y luego en 'Nuevo Paquete'. Completa el formulario con toda la información del paquete: título, descripción, destino, precio, duración, fechas disponibles, itinerario, etc. Asegúrate de incluir imágenes atractivas para aumentar el interés de los viajeros."
                },
                {
                    question: "¿Puedo editar un paquete después de publicarlo?",
                    answer: "Sí, puedes editar tus paquetes en cualquier momento. En la sección 'Paquetes' de tu panel de control, encontrarás todos tus paquetes listados. Haz clic en el ícono de edición junto al paquete que deseas modificar."
                },
                {
                    question: "¿Cómo gestiono las fechas de salida de mis paquetes?",
                    answer: "Al crear o editar un paquete, encontrarás una sección para agregar fechas de salida. Puedes especificar la fecha, el número de plazas disponibles y el precio específico para esa salida. Esto permite a los viajeros buscar paquetes para fechas específicas."
                },
                {
                    question: "¿Cómo puedo destacar mi paquete en la plataforma?",
                    answer: "Los paquetes destacados en la página principal se seleccionan automáticamente en base a su popularidad (vistas y consultas). Para aumentar las posibilidades de que tu paquete sea destacado: 1) Asegúrate de que tu agencia esté verificada. 2) Incluye imágenes de alta calidad. 3) Proporciona descripciones detalladas. 4) Mantén precios competitivos."
                }
            ]
        },
        {
            category: "Estadísticas y Análisis",
            questions: [
                {
                    question: "¿Qué estadísticas puedo ver sobre mis paquetes?",
                    answer: "En el panel de control, encontrarás una sección de 'Estadísticas' donde puedes ver: número de vistas de tus paquetes, consultas recibidas, tasa de conversión (consultas/vistas), paquetes más populares, y tendencias a lo largo del tiempo. Puedes filtrar estas estadísticas por período (semana o mes)."
                },
                {
                    question: "¿Cómo sé si un viajero está interesado en mi paquete?",
                    answer: "Cuando un viajero hace clic en el botón 'Consultar por WhatsApp' en la página de detalles de tu paquete, se registra como una consulta en tus estadísticas. Además, recibirás un mensaje directo con los detalles del paquete y la consulta del viajero."
                },
                {
                    question: "¿Puedo ver quién ha guardado mis paquetes como favoritos?",
                    answer: "Por razones de privacidad, no mostramos información específica sobre qué usuarios han guardado tus paquetes como favoritos. Sin embargo, puedes ver el número total de veces que tus paquetes han sido vistos y consultados."
                }
            ]
        },
        {
            category: "Reseñas y Calificaciones",
            questions: [
                {
                    question: "¿Cómo funcionan las reseñas en QViaje?",
                    answer: "Los viajeros pueden dejar reseñas y calificaciones en tus paquetes después de experimentarlos. Las reseñas incluyen una calificación de 1 a 5 estrellas, un comentario y opcionalmente fotos del viaje. Estas reseñas son públicas y ayudan a otros viajeros a tomar decisiones informadas."
                },
                {
                    question: "¿Puedo responder a las reseñas de los viajeros?",
                    answer: "Actualmente, no es posible responder directamente a las reseñas. Sin embargo, estamos trabajando en implementar esta funcionalidad en el futuro."
                },
                {
                    question: "¿Qué debo hacer si recibo una reseña injusta o falsa?",
                    answer: "Si consideras que has recibido una reseña injusta o que contiene información falsa, puedes reportarla a nuestro equipo de soporte. Evaluaremos el caso y tomaremos las medidas apropiadas si la reseña viola nuestras políticas."
                }
            ]
        },
        {
            category: "Facturación y Suscripción",
            questions: [
                {
                    question: "¿Cuánto cuesta publicar paquetes en QViaje?",
                    answer: "Actualmente, el registro y la publicación de paquetes en QViaje es completamente gratuito. Estamos en fase de crecimiento y queremos ofrecer la mejor experiencia tanto a agencias como a viajeros sin costos adicionales."
                },
                {
                    question: "¿Habrá planes de pago en el futuro?",
                    answer: "Es posible que en el futuro implementemos planes premium con funcionalidades adicionales para agencias. Sin embargo, siempre mantendremos una opción gratuita para asegurar que todas las agencias puedan participar en la plataforma."
                },
                {
                    question: "¿QViaje cobra comisión por las reservas?",
                    answer: "No, QViaje no cobra comisión por las reservas realizadas. Somos una plataforma de conexión entre viajeros y agencias, pero no intervenimos en el proceso de reserva o pago."
                }
            ]
        }
    ];

    // Preguntas generales
    const generalesQuestions = [
        {
            category: "Sobre QViaje",
            questions: [
                {
                    question: "¿Qué es QViaje?",
                    answer: "QViaje es una plataforma que conecta viajeros con agencias de viajes verificadas en Latinoamérica. Nuestro objetivo es facilitar la búsqueda y comparación de paquetes turísticos, permitiendo a los viajeros tomar decisiones informadas basadas en reseñas reales y a las agencias llegar a más clientes potenciales."
                },
                {
                    question: "¿Cómo gana dinero QViaje si el servicio es gratuito?",
                    answer: "Actualmente, QViaje está en fase de crecimiento y nos enfocamos en crear la mejor experiencia posible para usuarios y agencias. En el futuro, implementaremos modelos de monetización como planes premium para agencias con funcionalidades adicionales, sin afectar la experiencia básica gratuita."
                },
                {
                    question: "¿En qué países opera QViaje?",
                    answer: "QViaje está diseñado para operar en toda Latinoamérica. Actualmente, nos enfocamos principalmente en destinos y agencias de México, Colombia, Perú, Argentina, Chile y Brasil, pero las agencias de cualquier país de la región pueden registrarse y ofrecer sus servicios."
                }
            ]
        },
        {
            category: "Soporte y Contacto",
            questions: [
                {
                    question: "¿Cómo puedo contactar al soporte de QViaje?",
                    answer: "Puedes contactar a nuestro equipo de soporte a través del correo electrónico support@qviaje.com. Intentamos responder a todas las consultas en un plazo de 24-48 horas hábiles."
                },
                {
                    question: "¿Tienen un número de teléfono para contacto?",
                    answer: "Actualmente, no ofrecemos soporte telefónico. La mejor manera de contactarnos es a través de nuestro correo electrónico de soporte."
                },
                {
                    question: "¿QViaje tiene oficinas físicas?",
                    answer: "QViaje es una plataforma digital y no contamos con oficinas físicas abiertas al público. Operamos de manera remota para poder servir eficientemente a toda la región latinoamericana."
                }
            ]
        },
        {
            category: "Privacidad y Seguridad",
            questions: [
                {
                    question: "¿Cómo protege QViaje mis datos personales?",
                    answer: "En QViaje, la seguridad de tus datos es una prioridad. Utilizamos encriptación SSL para todas las comunicaciones, almacenamos las contraseñas de forma segura y nunca compartimos tu información personal con terceros sin tu consentimiento. Puedes consultar nuestra política de privacidad completa en el pie de página."
                },
                {
                    question: "¿QViaje almacena mis datos de pago?",
                    answer: "QViaje no procesa ni almacena datos de pago, ya que las transacciones se realizan directamente entre el viajero y la agencia de viajes fuera de nuestra plataforma."
                },
                {
                    question: "¿Cómo puedo reportar un problema de seguridad?",
                    answer: "Si detectas algún problema de seguridad o tienes preocupaciones sobre la privacidad de tus datos, por favor contáctanos inmediatamente a security@qviaje.com. Investigaremos y abordaremos el problema lo antes posible."
                }
            ]
        }
    ];

    // Función para filtrar preguntas según la búsqueda
    const filterQuestions = (questions, query) => {
        if (!query) return questions;

        return questions.map(category => {
            const filteredQuestions = category.questions.filter(q =>
                q.question.toLowerCase().includes(query.toLowerCase()) ||
                q.answer.toLowerCase().includes(query.toLowerCase())
            );

            return {
                ...category,
                questions: filteredQuestions
            };
        }).filter(category => category.questions.length > 0);
    };

    const filteredViajeros = filterQuestions(viajerosQuestions, searchQuery);
    const filteredAgencias = filterQuestions(agenciasQuestions, searchQuery);
    const filteredGenerales = filterQuestions(generalesQuestions, searchQuery);

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h1>
                    <p className="text-muted-foreground mb-6">
                        Encuentra respuestas a las preguntas más comunes sobre QViaje
                    </p>

                    <div className="relative max-w-md mx-auto mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar preguntas..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue={"generales"}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="viajeros">Para Viajeros</TabsTrigger>
                        <TabsTrigger value="agencias">Para Agencias</TabsTrigger>
                        <TabsTrigger value="generales">Generales</TabsTrigger>
                    </TabsList>

                    <TabsContent value="viajeros" className="mt-6">
                        {filteredViajeros.length > 0 ? (
                            filteredViajeros.map((category, index) => (
                                <div key={index} className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {category.questions.map((item, qIndex) => (
                                            <AccordionItem key={qIndex} value={`viajeros-${index}-${qIndex}`}>
                                                <AccordionTrigger className="text-left">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p className="text-muted-foreground">{item.answer}</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="agencias" className="mt-6">
                        {filteredAgencias.length > 0 ? (
                            filteredAgencias.map((category, index) => (
                                <div key={index} className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {category.questions.map((item, qIndex) => (
                                            <AccordionItem key={qIndex} value={`agencias-${index}-${qIndex}`}>
                                                <AccordionTrigger className="text-left">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p className="text-muted-foreground">{item.answer}</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="generales" className="mt-6">
                        {filteredGenerales.length > 0 ? (
                            filteredGenerales.map((category, index) => (
                                <div key={index} className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {category.questions.map((item, qIndex) => (
                                            <AccordionItem key={qIndex} value={`generales-${index}-${qIndex}`}>
                                                <AccordionTrigger className="text-left">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p className="text-muted-foreground">{item.answer}</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}