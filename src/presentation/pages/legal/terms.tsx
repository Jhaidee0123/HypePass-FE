import React from 'react';
import { SeoHelmet } from '@/presentation/components';
import Styles from './legal-styles.scss';
import { CURRENT_TERMS_VERSION } from './legal-versions';

const TermsPage: React.FC = () => {
  const sections = [
    'Qué es HypePass',
    'Crear una cuenta',
    'Comprar tickets',
    'Cómo funciona tu QR',
    'Transferir un ticket',
    'Vender un ticket (marketplace)',
    'Cómo te pagamos si vendes',
    'Reembolsos y cancelaciones',
    'Qué está prohibido',
    'Qué pasa si incumples',
    'Nuestra responsabilidad',
    'Cambios a estos términos',
    'Cómo contactarnos',
  ];

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title="HypePass — Términos y Condiciones"
        description="Términos y condiciones del servicio de HypePass."
      />

      <div className={Styles.eyebrow}>◆ Legal</div>
      <h1 className={Styles.title}>Términos y Condiciones</h1>
      <div className={Styles.meta}>
        Versión {CURRENT_TERMS_VERSION} · Vigente desde abril 2026
      </div>

      <div className={Styles.draftBanner}>
        <strong>Documento en borrador</strong>
        Este texto explica cómo funciona HypePass en palabras sencillas. Es
        un borrador preparado por el equipo y debe ser revisado por un
        abogado antes de considerarse el contrato final. Si ves algo que no
        te cuadra, escríbenos a <a href="mailto:soporte@hypepass.co">
          soporte@hypepass.co
        </a>.
      </div>

      <nav className={Styles.toc}>
        <h2>Contenido</h2>
        <ol>
          {sections.map((s, i) => (
            <li key={s}>
              <a href={`#s${i + 1}`}>{s}</a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="s1" className={Styles.section}>
        <div className={Styles.sectionNum}>01</div>
        <h2 className={Styles.sectionTitle}>Qué es HypePass</h2>
        <p>
          HypePass es una plataforma donde puedes <strong>comprar tickets
          oficiales</strong> para conciertos, festivales y otros eventos, y
          también <strong>revender un ticket que ya no vas a usar</strong> a
          otro usuario. Cuando vendes, nosotros actuamos como intermediario:
          recibimos el dinero del comprador, garantizamos que el ticket sea
          real, y después te lo giramos a ti.
        </p>
        <p>
          HypePass no es la empresa que produce el evento. El evento lo
          organiza una <strong>compañía organizadora</strong> (por ejemplo,
          un productor de conciertos). Nosotros somos solo el canal de venta
          y revalidación del ticket.
        </p>
      </section>

      <section id="s2" className={Styles.section}>
        <div className={Styles.sectionNum}>02</div>
        <h2 className={Styles.sectionTitle}>Crear una cuenta</h2>
        <p>
          Para comprar, vender o transferir tickets necesitas una cuenta.
          Solo pedimos tu nombre y un correo. Al registrarte aceptas estos
          términos y nuestra{' '}
          <a
            href="/legal/privacy"
            style={{ color: '#d7ff3a', textDecoration: 'none' }}
          >
            política de privacidad
          </a>
          .
        </p>
        <p>
          Debes ser <strong>mayor de edad</strong> (18 años en Colombia)
          para crear una cuenta. La información que nos das tiene que ser
          verdadera: usamos el email para mandarte tus tickets y los avisos
          importantes.
        </p>
        <p>
          Tú eres responsable de cuidar tu contraseña. Si crees que alguien
          entró a tu cuenta sin permiso, cambia tu contraseña desde tu
          perfil y avísanos.
        </p>
      </section>

      <section id="s3" className={Styles.section}>
        <div className={Styles.sectionNum}>03</div>
        <h2 className={Styles.sectionTitle}>Comprar tickets</h2>
        <p>
          Los precios que ves incluyen el valor del ticket más cualquier{' '}
          <strong>cargo por servicio</strong> que cobremos para sostener la
          plataforma (validación, soporte, medios de pago). Todo aparece
          desglosado antes de pagar.
        </p>
        <p>
          El pago se procesa a través de <strong>Wompi</strong>, una pasarela
          regulada por la Superintendencia Financiera de Colombia. HypePass
          no guarda los datos de tu tarjeta — eso lo maneja Wompi
          directamente.
        </p>
        <p>
          Cuando tu pago se aprueba recibes un correo de confirmación y tus
          tickets aparecen en <strong>"Mis tickets"</strong>. Cada ticket
          queda asociado a tu cuenta; nadie más puede usarlo.
        </p>
        <div className={Styles.callout}>
          <strong>Importante</strong>
          Si tu pago no se aprueba, no te cobramos nada. Las reservas que
          dejamos preparadas mientras pagas se liberan automáticamente a los
          10 minutos.
        </div>
      </section>

      <section id="s4" className={Styles.section}>
        <div className={Styles.sectionNum}>04</div>
        <h2 className={Styles.sectionTitle}>Cómo funciona tu QR</h2>
        <p>
          Tu ticket no es un archivo que te mandamos por correo — es un{' '}
          <strong>código QR que vive en tu cuenta</strong> y cambia cada 30
          segundos. Esto evita que alguien tome una foto del QR y entre con
          él.
        </p>
        <p>
          El QR solo se habilita dentro de una ventana cercana al evento
          (por defecto, las 24 horas previas). Antes de eso verás un candado
          — eso es normal y es para tu seguridad.
        </p>
        <p>
          En la puerta del evento, el equipo de logística escanea el QR con
          la app. Si alguien intentó entrar antes con tu ticket, en ese
          momento lo vemos y te avisamos.
        </p>
      </section>

      <section id="s5" className={Styles.section}>
        <div className={Styles.sectionNum}>05</div>
        <h2 className={Styles.sectionTitle}>Transferir un ticket</h2>
        <p>
          Si ya no puedes ir o quieres darle el ticket a otra persona,
          puedes <strong>transferirlo</strong> desde "Mis tickets". Solo
          necesitas el correo del destinatario (que debe tener cuenta en
          HypePass).
        </p>
        <p>
          La transferencia es inmediata y gratis. Una vez que transfieres,
          el ticket desaparece de tu cuenta y aparece en la del destinatario.
          El QR anterior queda invalidado en el acto para que no puedan
          usarlo los dos.
        </p>
        <p>
          No todas las transferencias son posibles: algunos organizadores
          bloquean transferencias cerca del evento (por seguridad), y otros
          no permiten transferencias en absoluto. Siempre verás en el ticket
          si se puede transferir.
        </p>
      </section>

      <section id="s6" className={Styles.section}>
        <div className={Styles.sectionNum}>06</div>
        <h2 className={Styles.sectionTitle}>
          Vender un ticket (marketplace)
        </h2>
        <p>
          Si ya no vas a usar un ticket, puedes publicarlo en el marketplace
          de HypePass para que otro usuario lo compre. Tú eliges el precio,{' '}
          <strong>
            pero no puede pasar del 120% del valor original
          </strong>{' '}
          (el tope está para proteger a los compradores de sobreprecios
          abusivos).
        </p>
        <p>Cuando publicas una venta:</p>
        <ul>
          <li>
            <strong>Retenemos una comisión del 10%</strong> del precio. Es
            lo que sostiene la plataforma y cubre el procesamiento de pago.
          </li>
          <li>
            El ticket queda visible en el marketplace hasta que alguien lo
            compre o tú lo canceles.
          </li>
          <li>
            Antes de publicar necesitas tener registrada una{' '}
            <strong>cuenta bancaria o Nequi</strong> en tu perfil, para que
            sepamos cómo pagarte.
          </li>
        </ul>
        <div className={Styles.callout}>
          <strong>Ejemplo</strong>
          Si publicas tu ticket a $100.000: el comprador paga $100.000, la
          plataforma retiene $10.000 (10%) y tú recibes $90.000 después del
          evento.
        </div>
      </section>

      <section id="s7" className={Styles.section}>
        <div className={Styles.sectionNum}>07</div>
        <h2 className={Styles.sectionTitle}>
          Cómo te pagamos si vendes
        </h2>
        <p>
          Cuando alguien compra tu ticket, el dinero llega primero a
          HypePass. <strong>No te lo giramos de inmediato.</strong> Esperamos
          hasta aproximadamente <strong>48 horas después de que termine
          el evento</strong>, por dos razones:
        </p>
        <ul>
          <li>
            <strong>Proteger al comprador</strong>: si el evento se cancela
            o hay un problema, podemos devolverle el dinero sin que tú
            tengas que regresarlo tú mismo.
          </li>
          <li>
            <strong>Prevenir fraude</strong>: el medio de pago (Wompi) puede
            recibir disputas del comprador dentro de cierta ventana. Si
            ocurren, podemos responderlas sin haber soltado tu plata.
          </li>
        </ul>
        <p>
          Una vez termina el evento y pasa el período de seguridad, marcamos
          el pago como <strong>listo para girar</strong> y te enviamos el
          dinero a la cuenta que registraste (Nequi, Daviplata, Bancolombia,
          etc.). Recibirás un correo cuando se procese.
        </p>
        <p>
          Si el evento se cancela: te avisamos y el dinero vuelve al
          comprador. Tu ticket se anula y no recibes pago.
        </p>
      </section>

      <section id="s8" className={Styles.section}>
        <div className={Styles.sectionNum}>08</div>
        <h2 className={Styles.sectionTitle}>
          Reembolsos y cancelaciones
        </h2>
        <p>
          Por lo general <strong>las compras no son reembolsables</strong>:
          una vez pagas, el ticket es tuyo. Las excepciones son:
        </p>
        <ul>
          <li>
            <strong>El evento se canceló</strong> por el organizador: te
            devolvemos el valor total.
          </li>
          <li>
            <strong>El evento se aplazó</strong> y la nueva fecha no te
            sirve: avísanos antes de la nueva fecha.
          </li>
          <li>
            <strong>Problema técnico nuestro</strong> que impidió que
            recibieras tu ticket: te devolvemos el pago o emitimos el ticket
            correctamente.
          </li>
        </ul>
        <p>
          En todos los demás casos (te arrepentiste, te surgió un
          compromiso, compraste la fecha equivocada) no devolvemos el
          dinero, pero sí puedes <strong>transferir</strong> o{' '}
          <strong>revender</strong> tu ticket.
        </p>
      </section>

      <section id="s9" className={Styles.section}>
        <div className={Styles.sectionNum}>09</div>
        <h2 className={Styles.sectionTitle}>Qué está prohibido</h2>
        <ul>
          <li>
            Usar la plataforma con información falsa o suplantando a otra
            persona.
          </li>
          <li>
            Vender tickets por fuera de HypePass con ánimo especulativo
            (reventa no autorizada).
          </li>
          <li>
            Duplicar o falsificar QRs, o intentar usar un mismo ticket dos
            veces.
          </li>
          <li>
            Hacer cargos no autorizados con tarjetas de terceros o pagar con
            métodos fraudulentos.
          </li>
          <li>
            Acceder por medios automatizados (bots, scripts) para acaparar
            tickets.
          </li>
          <li>Interferir con la plataforma o tratar de romperla.</li>
        </ul>
      </section>

      <section id="s10" className={Styles.section}>
        <div className={Styles.sectionNum}>10</div>
        <h2 className={Styles.sectionTitle}>Qué pasa si incumples</h2>
        <p>
          Si detectamos actividad sospechosa o un incumplimiento de estos
          términos, podemos (según la gravedad):
        </p>
        <ul>
          <li>Anular el ticket o la venta involucrada.</li>
          <li>Suspender tu cuenta temporal o permanentemente.</li>
          <li>
            Retener pagos pendientes hasta aclarar lo ocurrido. Si
            comprueba fraude, no se giran.
          </li>
          <li>Reportar el caso a las autoridades si aplica.</li>
        </ul>
      </section>

      <section id="s11" className={Styles.section}>
        <div className={Styles.sectionNum}>11</div>
        <h2 className={Styles.sectionTitle}>Nuestra responsabilidad</h2>
        <p>
          HypePass hace su mejor esfuerzo para que la plataforma funcione
          sin interrupciones, pero no podemos garantizar cero caídas. Si
          tienes un problema comprando, vendiendo o entrando al evento por
          una falla nuestra, <strong>repararemos lo que esté a nuestro
          alcance</strong>: reembolso del pago, reemisión del ticket, o
          acceso manual al evento coordinando con el organizador.
        </p>
        <p>
          No somos responsables por:
        </p>
        <ul>
          <li>
            Lo que hace o deja de hacer el organizador del evento (retrasos,
            cancelaciones, experiencia en el sitio).
          </li>
          <li>
            Disputas entre un comprador y un vendedor del marketplace más
            allá de lo que ofrecemos (retención, reembolso si el evento no
            ocurre).
          </li>
          <li>
            Daños indirectos como costos de transporte, hospedaje, o lucro
            cesante si un evento se cancela.
          </li>
        </ul>
      </section>

      <section id="s12" className={Styles.section}>
        <div className={Styles.sectionNum}>12</div>
        <h2 className={Styles.sectionTitle}>
          Cambios a estos términos
        </h2>
        <p>
          Podemos actualizar estos términos cuando evolucione la plataforma
          (por ejemplo, si lanzamos un nuevo tipo de ticket, cambiamos el
          tope de reventa, o ajustamos las comisiones). Cuando haya un
          cambio importante te avisaremos por correo y la próxima vez que
          entres te pediremos aceptar la nueva versión.
        </p>
        <p>
          Los términos que aceptaste al registrarte aplican a las compras y
          ventas que ya hiciste, incluso si después publicamos una versión
          nueva.
        </p>
      </section>

      <section id="s13" className={Styles.section}>
        <div className={Styles.sectionNum}>13</div>
        <h2 className={Styles.sectionTitle}>Cómo contactarnos</h2>
        <p>
          ¿Dudas, reclamos, o quieres eliminar tu cuenta?
        </p>
        <ul>
          <li>
            Correo de soporte:{' '}
            <strong>
              <a
                href="mailto:soporte@hypepass.co"
                style={{ color: '#d7ff3a', textDecoration: 'none' }}
              >
                soporte@hypepass.co
              </a>
            </strong>
          </li>
          <li>
            Peticiones, quejas o reclamos formales:{' '}
            <strong>
              <a
                href="mailto:legal@hypepass.co"
                style={{ color: '#d7ff3a', textDecoration: 'none' }}
              >
                legal@hypepass.co
              </a>
            </strong>
          </li>
        </ul>
        <p>
          Respondemos en un plazo máximo de 15 días hábiles desde que
          recibimos el correo.
        </p>
      </section>

      <div className={Styles.footer}>
        Al usar HypePass aceptas estos términos. Si no estás de acuerdo, por
        favor no uses la plataforma.
      </div>
    </div>
  );
};

export default TermsPage;
