import React from 'react';
import { SeoHelmet } from '@/presentation/components';
import Styles from './faq-styles.scss';

type QA = { q: string; a: React.ReactNode };
type Group = { title: string; items: QA[] };

const GROUPS: Group[] = [
  {
    title: 'Comprar tickets',
    items: [
      {
        q: '¿Cómo compro un ticket?',
        a: (
          <>
            <p>
              Entra al evento que te interesa, elige la fecha, la zona (si
              aplica), la cantidad y toca "Continuar al checkout". Llenas
              tus datos, pagas con tarjeta, PSE, Nequi o lo que uses, y en
              segundos ves tus tickets en <strong>Mis tickets</strong>.
            </p>
          </>
        ),
      },
      {
        q: '¿Puedo comprar sin crear cuenta?',
        a: (
          <p>
            Sí. Al pagar como invitado te creamos una cuenta automáticamente
            con el correo que usaste, y te enviamos un enlace para que
            definas tu propia contraseña. Así puedes volver a entrar en
            cualquier momento a ver tus tickets.
          </p>
        ),
      },
      {
        q: '¿Qué métodos de pago aceptan?',
        a: (
          <p>
            Aceptamos los métodos que procesa Wompi en Colombia: tarjetas
            de crédito y débito, PSE, Bancolombia Transfer, Nequi,
            Daviplata y más. Lo verás en el widget al pagar.
          </p>
        ),
      },
      {
        q: '¿Los precios incluyen todos los cargos?',
        a: (
          <p>
            Antes de pagar te desglosamos todo: precio del ticket + cargo
            por servicio + impuestos si aplica. No hay costos sorpresa al
            final.
          </p>
        ),
      },
      {
        q: '¿Qué pasa si mi pago no se aprueba?',
        a: (
          <p>
            No te cobran. Cualquier reserva que tuviéramos preparada se
            libera automáticamente para que otros puedan comprar. Si crees
            que hubo un error, revisa con tu banco o prueba con otro
            método.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Usar tu ticket',
    items: [
      {
        q: '¿Cómo entro al evento?',
        a: (
          <p>
            En el día del evento abre <strong>Mis tickets</strong> en tu
            celular. El QR se activa unas horas antes. En la puerta lo
            muestras, el equipo lo escanea y listo.
          </p>
        ),
      },
      {
        q: '¿Por qué mi QR aparece bloqueado?',
        a: (
          <p>
            Por seguridad, el QR solo se habilita dentro de una ventana
            cercana al evento (por lo general 24 horas antes). Antes de eso
            verás un candado y la fecha en que se activará. Es normal: te
            lo mostramos apenas se abra.
          </p>
        ),
      },
      {
        q: '¿Por qué el QR cambia cada 30 segundos?',
        a: (
          <p>
            Para que nadie pueda entrar con una foto o captura de pantalla.
            Si alguien te manda una foto del QR, a los 30 segundos ya no
            sirve. El QR real siempre está en tu cuenta, en tu celular.
          </p>
        ),
      },
      {
        q: '¿Qué pasa si me quedo sin batería?',
        a: (
          <p>
            En la mayoría de venues hay puntos de carga o puedes pedir
            ayuda al staff. También puedes dejar <strong>Mis tickets
            </strong> abierto antes de llegar y bajar el brillo para ahorrar
            batería. Si tienes un problema real, el equipo de puerta puede
            validarte con tu documento.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Transferir un ticket',
    items: [
      {
        q: '¿Puedo mandarle el ticket a un amigo?',
        a: (
          <p>
            Sí. Entra al ticket, toca <strong>Transferir</strong>, y escribe
            el correo del amigo (debe tener cuenta en HypePass). El ticket
            se mueve a su cuenta al instante y el QR anterior queda
            invalidado automáticamente para que no puedan usarlo los dos.
          </p>
        ),
      },
      {
        q: '¿La transferencia tiene costo?',
        a: <p>No, transferir es gratis.</p>,
      },
      {
        q: '¿Puedo deshacer una transferencia?',
        a: (
          <p>
            No se puede deshacer desde la app. Si la persona que recibió el
            ticket te lo devuelve, ella puede transferirlo de vuelta a tu
            cuenta. Piensa dos veces antes de transferir.
          </p>
        ),
      },
      {
        q: '¿Qué pasa si el organizador no permite transferencias?',
        a: (
          <p>
            Algunos eventos las bloquean (por seguridad o regulación).
            Cuando abres el ticket verás si se puede transferir o no. Si
            está bloqueado no podrás hacerlo.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Vender un ticket en el marketplace',
    items: [
      {
        q: '¿Cómo vendo un ticket que ya no voy a usar?',
        a: (
          <>
            <p>Hay dos cosas que debes hacer primero:</p>
            <ul>
              <li>
                Ir a <strong>Mi perfil</strong> y registrar una cuenta
                bancaria o Nequi para que sepamos cómo pagarte.
              </li>
              <li>
                Abrir el ticket y tocar <strong>Vender</strong>. Eliges un
                precio (dentro del tope permitido) y lo publicas.
              </li>
            </ul>
            <p>
              Tu ticket queda visible en el marketplace hasta que alguien
              lo compre o tú lo canceles.
            </p>
          </>
        ),
      },
      {
        q: '¿Hay un precio máximo?',
        a: (
          <p>
            Sí. El tope es <strong>120% del valor original del ticket</strong>.
            Por ejemplo: si compraste a $100.000 puedes revender hasta por
            $120.000. Esto es para que la reventa siga siendo justa y no
            se convierta en especulación.
          </p>
        ),
      },
      {
        q: '¿Cuánto cobra HypePass por vender?',
        a: (
          <p>
            Retenemos un <strong>10% de comisión</strong> del precio de
            venta. Ejemplo: si vendes en $100.000, el comprador paga
            $100.000, nos quedamos con $10.000, y tú recibes $90.000.
          </p>
        ),
      },
      {
        q: '¿Cuándo recibo el dinero de mi venta?',
        a: (
          <p>
            No te pagamos al instante. Retenemos el dinero hasta{' '}
            <strong>aproximadamente 48 horas después de que termine el
            evento</strong>. Esto es estándar en plataformas serias de
            reventa (StubHub, Ticketmaster) y está ahí para protegerte a ti
            y al comprador si el evento se cancela o hay una disputa.
            Cuando pase la ventana, giramos el dinero a tu cuenta y te
            avisamos por correo.
          </p>
        ),
      },
      {
        q: '¿Qué pasa si el evento se cancela?',
        a: (
          <p>
            Si el evento se cancela, le devolvemos el dinero al comprador.
            La venta se anula y no recibes pago. Es lo justo: si no hubo
            evento, no hubo compra.
          </p>
        ),
      },
      {
        q: '¿Puedo cancelar una publicación?',
        a: (
          <p>
            Sí, mientras nadie la haya comprado. Si ya está reservada (un
            comprador empezó el pago) toca esperar a que el pago se concrete
            o expire; luego puedes cancelar.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Reembolsos',
    items: [
      {
        q: '¿Puedo devolver un ticket?',
        a: (
          <>
            <p>
              Por regla general no. Una vez compras, el ticket es tuyo. Las
              únicas devoluciones son:
            </p>
            <ul>
              <li>El evento se canceló.</li>
              <li>El evento se aplazó y no te sirve la nueva fecha.</li>
              <li>Un problema técnico nuestro impidió que recibieras tu ticket.</li>
            </ul>
            <p>
              En otros casos (te arrepentiste, te cambió un plan), lo que
              puedes hacer es <strong>transferir</strong> el ticket o{' '}
              <strong>revenderlo</strong> en el marketplace.
            </p>
          </>
        ),
      },
      {
        q: '¿Cuánto demora un reembolso?',
        a: (
          <p>
            Una vez aprobamos el reembolso, el dinero regresa al medio de
            pago original en <strong>5 a 15 días hábiles</strong>,
            dependiendo del banco.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Mi cuenta',
    items: [
      {
        q: '¿Cómo cambio mi contraseña?',
        a: (
          <p>
            Entra a <strong>Mi perfil</strong> y en la sección{' '}
            <strong>Cambiar contraseña</strong> pones la actual, la nueva,
            y confirmas. Al cambiarla cerramos todas las otras sesiones
            abiertas por seguridad.
          </p>
        ),
      },
      {
        q: 'Olvidé mi contraseña, ¿qué hago?',
        a: (
          <p>
            En la página de inicio de sesión toca "Olvidé mi contraseña".
            Te enviamos un correo con un enlace para que la definas nueva.
            El enlace expira en 1 hora por seguridad.
          </p>
        ),
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: (
          <p>
            Escríbenos a{' '}
            <a href="mailto:privacidad@hypepass.co">
              privacidad@hypepass.co
            </a>{' '}
            desde el correo con el que te registraste. Confirmamos y
            borramos tu cuenta en máximo 30 días. Algunos datos (compras,
            aceptación de términos) debemos guardarlos más tiempo por ley.
          </p>
        ),
      },
      {
        q: '¿Puedo cambiar mi correo electrónico?',
        a: (
          <p>
            Por ahora esto se hace manualmente: escríbenos a{' '}
            <a href="mailto:soporte@hypepass.co">soporte@hypepass.co</a>{' '}
            desde el correo antiguo y te apoyamos.
          </p>
        ),
      },
    ],
  },
];

const FAQPage: React.FC = () => {
  return (
    <div className={Styles.page}>
      <SeoHelmet
        title="HypePass — Preguntas frecuentes"
        description="Respuestas a las dudas más comunes sobre cómo comprar, vender y transferir tickets en HypePass."
      />

      <div className={Styles.eyebrow}>◆ Preguntas frecuentes</div>
      <h1 className={Styles.title}>¿En qué te ayudamos?</h1>
      <p className={Styles.subtitle}>
        Las preguntas más comunes de nuestros usuarios. Si no encuentras tu
        respuesta, escríbenos a{' '}
        <a
          href="mailto:soporte@hypepass.co"
          style={{ color: '#d7ff3a', textDecoration: 'none' }}
        >
          soporte@hypepass.co
        </a>
        .
      </p>

      {GROUPS.map((group) => (
        <div className={Styles.group} key={group.title}>
          <div className={Styles.groupTitle}>{group.title}</div>
          {group.items.map((item, i) => (
            <details className={Styles.item} key={i}>
              <summary className={Styles.question}>
                <span>{item.q}</span>
                <span className={Styles.questionArrow}>+</span>
              </summary>
              <div className={Styles.answer}>{item.a}</div>
            </details>
          ))}
        </div>
      ))}

      <div className={Styles.contact}>
        <h3>¿Sigues con dudas?</h3>
        <p>
          Escríbenos a{' '}
          <a href="mailto:soporte@hypepass.co">soporte@hypepass.co</a> y te
          respondemos en menos de 24 horas.
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
