import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cuánto tiempo tarda el proceso de valoración?",
    answer: "Recibirás tu valoración inicial en menos de 24 horas. Nuestro equipo de expertos analiza tu propiedad y el mercado local para ofrecerte el precio más competitivo."
  },
  {
    question: "¿Qué documentación necesito para vender mi propiedad?",
    answer: "Necesitarás la escritura de la propiedad, nota simple del registro, certificado energético, IBI al corriente de pago y cédula de habitabilidad. Nosotros te ayudamos a gestionar toda la documentación necesaria."
  },
  {
    question: "¿Cuánto cobráis por vuestros servicios?",
    answer: "Nuestros honorarios son competitivos y totalmente transparentes. La valoración inicial es completamente gratuita y sin compromiso. Los honorarios de gestión se discuten una vez recibas tu valoración personalizada."
  },
  {
    question: "¿Realmente puedo vender en 30 días?",
    answer: "Sí, gracias a nuestra amplia red de compradores potenciales y estrategias de marketing avanzadas, la mayoría de nuestras propiedades se venden en un promedio de 18 días. Garantizamos que encontrarás comprador en 30 días o menos."
  },
  {
    question: "¿Qué pasa si no estoy satisfecho con la valoración?",
    answer: "La valoración es completamente gratuita y sin compromiso. Si no estás satisfecho, no hay ninguna obligación de continuar. Queremos que tomes la mejor decisión para ti."
  },
  {
    question: "¿Puedo vender si todavía tengo hipoteca?",
    answer: "Sí, es completamente posible vender una propiedad con hipoteca. Te ayudamos a coordinar con tu banco para la cancelación de la hipoteca durante el proceso de compraventa."
  }
];

export const FAQ = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Resolvemos tus dudas sobre el proceso de venta
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
