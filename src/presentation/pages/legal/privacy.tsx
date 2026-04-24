import React from 'react';
import { SeoHelmet } from '@/presentation/components';
import Styles from './legal-styles.scss';
import { CURRENT_PRIVACY_VERSION } from './legal-versions';

const PrivacyPage: React.FC = () => {
  const sections = [
    'Resumen rápido',
    'Quiénes somos',
    'Qué datos guardamos',
    'Para qué usamos tus datos',
    'Con quién los compartimos',
    'Cuánto tiempo los guardamos',
    'Qué derechos tienes',
    'Cómo ejercer tus derechos',
    'Cookies y similares',
    'Menores de edad',
    'Seguridad',
    'Cambios a esta política',
    'Contacto',
  ];

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title="HypePass — Política de Privacidad"
        description="Cómo HypePass recolecta, usa y protege tus datos personales."
      />

      <div className={Styles.eyebrow}>◆ Legal</div>
      <h1 className={Styles.title}>Política de Privacidad</h1>
      <div className={Styles.meta}>
        Versión {CURRENT_PRIVACY_VERSION} · Vigente desde abril 2026
      </div>

      <div className={Styles.draftBanner}>
        <strong>Documento en borrador</strong>
        Explicamos aquí cómo manejamos tus datos de forma honesta y en
        palabras normales. Es un borrador preparado por el equipo que debe
        revisarse antes de considerarse final. Si tienes dudas escríbenos a{' '}
        <a href="mailto:privacidad@hypepass.co">privacidad@hypepass.co</a>.
      </div>

      <nav className={Styles.toc}>
        <h2>Contenido</h2>
        <ol>
          {sections.map((s, i) => (
            <li key={s}>
              <a href={`#p${i + 1}`}>{s}</a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="p1" className={Styles.section}>
        <div className={Styles.sectionNum}>01</div>
        <h2 className={Styles.sectionTitle}>Resumen rápido</h2>
        <p>
          En corto: <strong>guardamos solo lo mínimo para que la
          plataforma funcione</strong>. No vendemos tus datos, no los usamos
          para publicidad de terceros, y puedes borrarlos cuando quieras.
          Más abajo te contamos en detalle qué guardamos y por qué.
        </p>
        <div className={Styles.callout}>
          <strong>Lo esencial</strong>
          Nombre, correo, tickets comprados, y algo de historial técnico
          (IP, navegador) para seguridad. Compartimos datos solo con los
          servicios que hacen posible la plataforma: pagos (Wompi), correos
          (Resend), imágenes (Cloudinary) e inicio de sesión (Better Auth).
          Nada de esto se vende a anunciantes.
        </div>
      </section>

      <section id="p2" className={Styles.section}>
        <div className={Styles.sectionNum}>02</div>
        <h2 className={Styles.sectionTitle}>Quiénes somos</h2>
        <p>
          HypePass es operada por una entidad registrada en Colombia. Para
          esta política somos el <strong>"responsable de tus datos"</strong>
          : somos los que decidimos qué se guarda y por qué.
        </p>
        <p>
          Puedes escribirnos a{' '}
          <strong>
            <a
              href="mailto:privacidad@hypepass.co"
              style={{ color: '#d7ff3a', textDecoration: 'none' }}
            >
              privacidad@hypepass.co
            </a>
          </strong>{' '}
          para cualquier asunto relacionado con tus datos.
        </p>
      </section>

      <section id="p3" className={Styles.section}>
        <div className={Styles.sectionNum}>03</div>
        <h2 className={Styles.sectionTitle}>Qué datos guardamos</h2>
        <p>Cuando creas una cuenta y usas HypePass, guardamos:</p>
        <ul>
          <li>
            <strong>Datos de identidad</strong>: tu nombre y correo
            electrónico.
          </li>
          <li>
            <strong>Contraseña</strong>: guardada cifrada; ni siquiera
            nosotros podemos verla en texto plano.
          </li>
          <li>
            <strong>Datos de compra</strong>: eventos a los que fuiste,
            cuántos tickets compraste, el total pagado. No guardamos el
            número completo de tu tarjeta — eso se queda en Wompi.
          </li>
          <li>
            <strong>Datos del comprador</strong>: teléfono y número de
            documento, que el medio de pago (Wompi) exige para procesar
            transacciones en Colombia.
          </li>
          <li>
            <strong>Datos de tu método de pago</strong> para recibir ventas
            del marketplace (tipo de cuenta, número, titular, documento).
            Esto solo aplica si decides vender.
          </li>
          <li>
            <strong>Tickets y QRs</strong>: qué tickets te pertenecen, qué
            QRs se generaron, cuáles se escanearon.
          </li>
          <li>
            <strong>Datos técnicos</strong>: dirección IP, tipo de
            navegador, fecha y hora. Se usan para detectar fraude y
            diagnosticar problemas.
          </li>
          <li>
            <strong>Aceptaciones de términos</strong>: guardamos la fecha,
            versión y la IP desde donde aceptaste estos documentos. Es un
            requisito legal.
          </li>
        </ul>
      </section>

      <section id="p4" className={Styles.section}>
        <div className={Styles.sectionNum}>04</div>
        <h2 className={Styles.sectionTitle}>Para qué usamos tus datos</h2>
        <ul>
          <li>
            <strong>Hacer funcionar la plataforma</strong>: cobrar, emitir
            tickets, mostrarte tu wallet, generar QRs, procesar reventas.
          </li>
          <li>
            <strong>Comunicarnos contigo</strong>: enviar confirmaciones,
            avisos sobre tus eventos, y responder tus preguntas.
          </li>
          <li>
            <strong>Seguridad y prevención de fraude</strong>: detectar
            cuentas falsas, intentos de uso indebido, y proteger a
            compradores y vendedores.
          </li>
          <li>
            <strong>Cumplir la ley</strong>: en Colombia ciertos datos
            (transacciones, identificación del comprador) deben guardarse
            por varios años por exigencia tributaria y regulatoria.
          </li>
          <li>
            <strong>Mejorar el producto</strong>: miramos datos agregados
            (cuántos compraron, qué se vendió) para ver qué funciona y qué
            no. Esto no te identifica personalmente.
          </li>
        </ul>
        <p>
          <strong>Lo que NO hacemos</strong>: no vendemos tus datos, no los
          intercambiamos con terceros para publicidad, ni hacemos perfiles
          de consumo para revenderlos.
        </p>
      </section>

      <section id="p5" className={Styles.section}>
        <div className={Styles.sectionNum}>05</div>
        <h2 className={Styles.sectionTitle}>Con quién los compartimos</h2>
        <p>
          Para que HypePass funcione trabajamos con proveedores de
          tecnología. Cada uno solo recibe los datos que necesita para
          hacer su trabajo:
        </p>
        <ul>
          <li>
            <strong>Wompi</strong> (pagos): procesa tus pagos con tarjeta,
            PSE, Nequi, etc. Regulada por la Superintendencia Financiera
            de Colombia.
          </li>
          <li>
            <strong>Better Auth</strong> (inicio de sesión): maneja la
            autenticación y tus sesiones activas. Corre dentro de nuestra
            propia infraestructura.
          </li>
          <li>
            <strong>Resend</strong> (correos): envía las confirmaciones y
            avisos. Solo recibe tu correo y el asunto/cuerpo del mensaje.
          </li>
          <li>
            <strong>Cloudinary</strong> (imágenes): aloja imágenes de
            eventos. Tus datos personales no pasan por ahí.
          </li>
          <li>
            <strong>Proveedor de hosting</strong>: donde corre el servidor.
          </li>
          <li>
            <strong>Organizadores del evento</strong>: les compartimos solo
            lo mínimo para el control de acceso (que tienes un ticket
            válido). No les compartimos tu correo ni tu documento.
          </li>
          <li>
            <strong>Autoridades</strong>: si una autoridad competente (SIC,
            DIAN, fiscalía) lo solicita mediante orden formal, estamos
            obligados a entregar información.
          </li>
        </ul>
      </section>

      <section id="p6" className={Styles.section}>
        <div className={Styles.sectionNum}>06</div>
        <h2 className={Styles.sectionTitle}>Cuánto tiempo los guardamos</h2>
        <ul>
          <li>
            <strong>Cuenta activa</strong>: mientras uses la plataforma.
          </li>
          <li>
            <strong>Cuenta eliminada</strong>: borramos la mayoría de tus
            datos a los 30 días de recibir la solicitud. Algunos datos se
            retienen más tiempo por obligación legal (por ejemplo, los
            registros de compras deben guardarse 5 años en Colombia por
            temas tributarios).
          </li>
          <li>
            <strong>Datos de aceptación de términos</strong>: los guardamos
            mientras tengas cuenta, como prueba legal de tu consentimiento.
          </li>
          <li>
            <strong>Logs técnicos</strong>: rotados cada 90 días por
            defecto.
          </li>
        </ul>
      </section>

      <section id="p7" className={Styles.section}>
        <div className={Styles.sectionNum}>07</div>
        <h2 className={Styles.sectionTitle}>Qué derechos tienes</h2>
        <p>
          Según la Ley 1581 de 2012 (Colombia) y otras normas equivalentes,
          tienes derecho a:
        </p>
        <ul>
          <li>
            <strong>Conocer</strong> qué datos tenemos sobre ti.
          </li>
          <li>
            <strong>Actualizar o corregir</strong> datos que estén
            incompletos o incorrectos.
          </li>
          <li>
            <strong>Solicitar prueba</strong> del permiso que nos diste
            para usar tus datos.
          </li>
          <li>
            <strong>Retirar tu autorización</strong>: si quitas el permiso,
            cerramos tu cuenta.
          </li>
          <li>
            <strong>Acceder a tus datos gratis</strong> una vez al mes.
          </li>
          <li>
            <strong>Presentar quejas</strong> ante la Superintendencia de
            Industria y Comercio (SIC) si consideras que estamos mal
            manejando tus datos.
          </li>
        </ul>
      </section>

      <section id="p8" className={Styles.section}>
        <div className={Styles.sectionNum}>08</div>
        <h2 className={Styles.sectionTitle}>Cómo ejercer tus derechos</h2>
        <p>Escríbenos a privacidad@hypepass.co con:</p>
        <ul>
          <li>Tu nombre y correo registrado.</li>
          <li>Qué derecho quieres ejercer.</li>
          <li>
            Una descripción clara de la solicitud (qué datos, qué cambio,
            por qué).
          </li>
        </ul>
        <p>
          Respondemos en máximo <strong>15 días hábiles</strong> desde que
          recibimos la solicitud (el plazo que exige la ley).
        </p>
      </section>

      <section id="p9" className={Styles.section}>
        <div className={Styles.sectionNum}>09</div>
        <h2 className={Styles.sectionTitle}>Cookies y similares</h2>
        <p>
          Usamos cookies estrictamente necesarias para que puedas iniciar
          sesión (guardamos tu sesión activa en una cookie segura). No
          usamos cookies de seguimiento publicitario ni compartimos con
          Google Analytics u otros servicios de medición externa en este
          momento.
        </p>
        <p>
          Puedes borrar las cookies desde tu navegador en cualquier momento.
          Si lo haces te saldrás de sesión y tendrás que volver a entrar.
        </p>
      </section>

      <section id="p10" className={Styles.section}>
        <div className={Styles.sectionNum}>10</div>
        <h2 className={Styles.sectionTitle}>Menores de edad</h2>
        <p>
          HypePass es para personas <strong>mayores de 18 años</strong>. Si
          detectamos una cuenta de un menor, la cerramos y borramos los
          datos. Si eres madre, padre o tutor y crees que un menor a tu
          cargo creó una cuenta, escríbenos y la eliminamos de inmediato.
        </p>
      </section>

      <section id="p11" className={Styles.section}>
        <div className={Styles.sectionNum}>11</div>
        <h2 className={Styles.sectionTitle}>Seguridad</h2>
        <p>
          Tomamos medidas razonables para proteger tus datos: conexiones
          cifradas (HTTPS), contraseñas cifradas, control de acceso
          riguroso, y monitoreo de actividad sospechosa. Ningún sistema
          es 100% infalible; si llegara a ocurrir un incidente que afecte
          tus datos, te avisaremos por correo y reportaremos a la SIC según
          la ley lo exige.
        </p>
      </section>

      <section id="p12" className={Styles.section}>
        <div className={Styles.sectionNum}>12</div>
        <h2 className={Styles.sectionTitle}>Cambios a esta política</h2>
        <p>
          Si cambiamos cómo manejamos tus datos te avisaremos por correo y
          la próxima vez que entres te pediremos aceptar la nueva versión.
          No aplicaremos los cambios retroactivamente a datos que ya
          recolectamos bajo la política anterior.
        </p>
      </section>

      <section id="p13" className={Styles.section}>
        <div className={Styles.sectionNum}>13</div>
        <h2 className={Styles.sectionTitle}>Contacto</h2>
        <ul>
          <li>
            Temas de datos personales:{' '}
            <strong>
              <a
                href="mailto:privacidad@hypepass.co"
                style={{ color: '#d7ff3a', textDecoration: 'none' }}
              >
                privacidad@hypepass.co
              </a>
            </strong>
          </li>
          <li>
            Soporte general:{' '}
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
            Superintendencia de Industria y Comercio (SIC):{' '}
            <a
              href="https://www.sic.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#d7ff3a', textDecoration: 'none' }}
            >
              sic.gov.co
            </a>
          </li>
        </ul>
      </section>

      <div className={Styles.footer}>
        Esta política de privacidad se rige por las leyes de la República
        de Colombia, en particular la Ley 1581 de 2012 y sus decretos
        reglamentarios.
      </div>
    </div>
  );
};

export default PrivacyPage;
