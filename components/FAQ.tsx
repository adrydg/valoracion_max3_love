import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cuánto tarda la valoración?",
    answer: "La valoración básica es instantánea (2 minutos). Si optas por la versión avanzada con análisis de fotos por IA, recibirás tu informe completo en menos de 10 minutos."
  },
  {
    question: "¿Qué datos necesito para valorar mi inmueble?",
    answer: "Para la valoración básica solo necesitas: código postal, metros cuadrados, número de habitaciones y baños. Para mayor precisión puedes añadir orientación, estado de conservación y subir fotos."
  },
  {
    question: "¿Es realmente gratis la primera valoración?",
    answer: "Sí, tu primera valoración básica es 100% gratuita y sin compromiso. La versión avanzada con análisis de fotos por IA tiene un coste de solo 29€ (normalmente 65€)."
  },
  {
    question: "¿Qué diferencia hay entre versión básica y avanzada?",
    answer: "La básica analiza datos del mercado y características generales (±20% precisión). La avanzada suma análisis de fotos con IA, calidad de acabados y estado real, reduciendo el margen a ±8%."
  },
  {
    question: "¿Cómo de precisa es la valoración online?",
    answer: "Nuestra valoración básica tiene un margen de ±20%. Con la versión avanzada alcanzamos ±8% de precisión al analizar +20 bases de datos oficiales de compraventas reales más el análisis de fotos con IA."
  },
  {
    question: "¿Puedo valorar desde el móvil?",
    answer: "Sí, nuestra plataforma está 100% optimizada para móvil. Puedes valorar tu inmueble, subir fotos y recibir tu informe desde cualquier dispositivo, en cualquier momento."
  }
];

export const FAQ = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Resolvemos tus dudas sobre la valoración online
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline py-5">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
