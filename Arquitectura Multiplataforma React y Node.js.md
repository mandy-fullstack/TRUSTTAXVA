# **Arquitectura de Sistemas Escalables para Servicios Financieros y Legales: Estrategia Integral para el Ecosistema TrustTax**

## **1\. Introducción y Contexto Estratégico**

La transformación digital en los sectores de servicios fiscales y legales, específicamente en las áreas de preparación de impuestos y gestión de inmigración, ha superado la etapa de ser una ventaja competitiva para convertirse en una necesidad operativa crítica. El proyecto "TrustTax" no debe concebirse simplemente como una colección de aplicaciones aisladas, sino como un ecosistema unificado de servicios digitales diseñado para gestionar datos altamente sensibles, orquestar flujos de trabajo complejos y proporcionar una experiencia de usuario fluida a través de múltiples plataformas. La solicitud de desarrollar una solución que integre un panel de administración, un portal web para clientes y una aplicación móvil nativa, todo ello respaldado por una infraestructura compartida en Node.js y autenticación mediante Firebase, presenta un desafío arquitectónico que requiere una planificación meticulosa orientada a la escalabilidad futura.

En el panorama actual de 2025, la arquitectura de software para aplicaciones empresariales de alto rendimiento ha convergido hacia modelos que maximizan la reutilización de código y la coherencia operativa. La fragmentación del código —tener repositorios separados para la web, el móvil y el backend— se ha identificado como una fuente principal de deuda técnica, inconsistencia en la lógica de negocio y ralentización en los ciclos de despliegue. Por lo tanto, la piedra angular de la estrategia técnica para TrustTax es la adopción de una arquitectura de "Monorepo Universal". Este enfoque permite que la lógica de negocio crítica, las definiciones de tipos, las constantes de configuración y los componentes de interfaz de usuario se definan una sola vez y se consuman en todas las aplicaciones, garantizando que una regla fiscal actualizada en el backend se refleje instantáneamente en las validaciones del frontend web y móvil.1

Este informe técnico exhaustivo desglosa la arquitectura propuesta, analizando cada capa del stack tecnológico desde la gestión del repositorio hasta la seguridad de los datos, pasando por el diseño de interfaces universales y la orquestación de servicios en el backend. El objetivo es proporcionar una hoja de ruta detallada que no solo satisfaga los requisitos funcionales inmediatos de TrustTax, sino que establezca los cimientos para un crecimiento exponencial, permitiendo la incorporación futura de módulos de inteligencia artificial, automatización avanzada y expansión a nuevos mercados sin requerir una reingeniería costosa.

## ---

**2\. Infraestructura del Repositorio y Gestión de Código: El Enfoque Monorepo**

La decisión de estructurar TrustTax como un monorepo es fundamental para la viabilidad a largo plazo del proyecto. Un monorepo no es simplemente colocar todo el código en una carpeta; es una estrategia de gestión de dependencias y flujos de trabajo que permite la colaboración eficiente entre equipos y la consistencia tecnológica.

### **2.1 Selección de la Herramienta de Orquestación: Turborepo**

Tras evaluar las opciones disponibles en el mercado actual, como Nx, Lerna y Turborepo, el análisis técnico favorece la implementación de **Turborepo** para el ecosistema TrustTax. Turborepo ha demostrado ser superior en entornos basados en JavaScript y TypeScript, optimizando los flujos de trabajo tanto para aplicaciones React web (Vite) como para ecosistemas de React Native.3

La principal ventaja de Turborepo reside en su capacidad para la ejecución de tareas en paralelo y su sistema de caché inteligente. En un proyecto como TrustTax, donde coexistirán el backend (/apps/api), el panel administrativo (/apps/admin), el portal de clientes (/apps/web) y la aplicación móvil (/apps/mobile), los tiempos de compilación (build times) pueden convertirse en un cuello de botella significativo. Turborepo mitiga esto mediante un caché computacional remoto y local. Si un desarrollador realiza un cambio en el componente de "Historial de Pagos" que solo afecta al portal web, Turborepo detecta que el código de la aplicación móvil y el backend no ha cambiado y, por lo tanto, recupera sus artefactos de construcción del caché en lugar de recompilarlos. Esto reduce los tiempos de integración continua (CI) de minutos a segundos, acelerando drásticamente el ciclo de feedback.5

Además, Turborepo se integra de manera nativa con gestores de paquetes modernos como **pnpm**. Se recomienda el uso de pnpm sobre npm o yarn debido a su manejo eficiente del espacio en disco y su estricta gestión de dependencias. pnpm utiliza un almacén global direccionable por contenido, lo que significa que si múltiples proyectos dentro del monorepo utilizan la misma versión de React, esta se descarga una sola vez en el disco, ahorrando espacio y tiempo de instalación. Esta eficiencia es crucial cuando se escala el equipo de desarrollo y se añaden más microservicios o aplicaciones satélite al repositorio.2

### **2.2 Estructura Arquitectónica de Directorios**

Para garantizar la mantenibilidad y la clara separación de responsabilidades, se propone la siguiente estructura de directorios jerárquica para TrustTax. Esta estructura fomenta la modularidad y evita el acoplamiento excesivo entre las aplicaciones.

| Ruta del Directorio | Tipo             | Tecnologías Clave            | Propósito y Responsabilidad                                                  |
| :------------------ | :--------------- | :--------------------------- | :--------------------------------------------------------------------------- |
| **/apps**           | **Aplicaciones** |                              | Contenedores ejecutables finales.                                            |
| /apps/web-client    | Frontend         | React, Vite                  | Portal público y área de cliente. Single Page Application (SPA).             |
| /apps/web-admin     | Frontend         | React, Vite                  | Panel de administración para empleados. Enfoque en densidad de datos.        |
| /apps/mobile        | Nativo           | Expo (Managed), React Native | Aplicación iOS/Android para clientes. Escaneo de documentos, notificaciones. |
| /apps/api           | Backend          | NestJS, Node.js              | API Gateway y lógica de negocio central.                                     |
| **/packages**       | **Librerías**    |                              | Código compartido y utilidades.                                              |
| /packages/ui        | UI Kit           | Gluestack UI / Tamagui       | Componentes visuales universales (Botones, Inputs, Cards).                   |
| /packages/core      | Lógica           | TypeScript, Zod              | Tipos, validaciones de formularios, constantes de negocio.                   |
| /packages/database  | Datos            | Prisma / TypeORM             | Definición del esquema de DB y cliente ORM tipado.                           |
| /packages/config    | Configuración    | ESLint, TSConfig             | Estándares de código compartidos para todo el monorepo.                      |
| /packages/utils     | Utilidades       | Lodash, date-fns             | Funciones puras de ayuda (formato de fechas, cálculos de impuestos).         |

Esta separación permite, por ejemplo, que el esquema de validación de un formulario de impuestos (definido en /packages/core usando Zod) sea importado tanto por el backend (para validar la petición API) como por el frontend web y móvil (para dar feedback en tiempo real al usuario), garantizando una consistencia absoluta en las reglas de negocio sin duplicación de código.5

## ---

**3\. Estrategia de Desarrollo Frontend Unificado: El Paradigma Universal**

El requisito de desarrollar para web y móvil simultáneamente presenta el riesgo de duplicar esfuerzos. La estrategia para TrustTax se basa en el desarrollo de "Universal Apps", donde la mayor parte del código de la interfaz de usuario y la lógica de estado se comparte entre plataformas.

### **3.1 Estrategia de Navegación Multiplataforma**

A diferencia de soluciones que buscan unificar la navegación forzadamente, TrustTax adoptará un enfoque de **"Navegación Nativa por Plataforma"** para maximizar la experiencia de usuario y simplificar la arquitectura al no usar Next.js.

- **Web (Cliente y Admin):** Se utilizará **React Router**. Es el estándar de oro para SPAs en React, ofreciendo un manejo robusto de rutas, parámetros y protección de rutas privadas (Guards).
- **Móvil:** Se utilizará **React Navigation** (vía Expo Router o Stack clásica). Es la solución definitiva para ofrecer transiciones nativas (stack push/pop, gestos) en iOS y Android.

**Compartición de Código:**
Aunque la navegación es específica, la **lógica de negocio** y los **componentes de UI** residirán en paquetes compartidos (`packages/core` y `packages/ui`). Las pantallas (screens) importarán estos componentes. Por ejemplo, el formulario de impuestos será un componente compartido que se renderiza dentro de una ruta de React Router en la web y dentro de una Screen de React Navigation en el móvil.

### **3.2 Sistema de Diseño: Gluestack UI vs. Tamagui**

La elección de la biblioteca de componentes es crítica para mantener la consistencia visual de la marca TrustTax y la eficiencia del desarrollo. Para 2025, las dos opciones líderes para sistemas de diseño universales son Gluestack UI y Tamagui. Tras un análisis detallado, se recomienda **Gluestack UI** para este proyecto específico, aunque Tamagui ofrece ventajas de rendimiento que vale la pena considerar.

**Análisis de Gluestack UI:** Gluestack UI se selecciona por su arquitectura modular y su integración con **NativeWind**. NativeWind permite utilizar la sintaxis de **Tailwind CSS** para estilizar componentes de React Native. Esto es una ventaja estratégica enorme, ya que Tailwind es un estándar de la industria ampliamente conocido. Permite a los desarrolladores web transicionar al desarrollo móvil sin tener que aprender un nuevo sistema de estilizado propietario. Gluestack proporciona componentes accesibles y sin estilo por defecto ("headless"), lo que otorga total libertad para implementar la identidad visual de TrustTax sin luchar contra estilos predeterminados difíciles de sobrescribir.12

**Implementación del Sistema de Diseño en /packages/ui:**

- Se creará una biblioteca interna de componentes que envuelva los primitivos de Gluestack. Por ejemplo, un componente TrustButton que encapsule los colores corporativos, las variantes de tamaño y la tipografía definida.
- Este paquete exportará los componentes listos para usar. Las aplicaciones consumidoras (web, mobile, admin) simplemente importarán import { TrustButton } from '@trusttax/ui'.
- La configuración del tema (colores, espaciado, fuentes) se centralizará en un archivo gluestack.config.ts dentro de este paquete, permitiendo cambios globales de diseño (como un "rebranding" o modo oscuro) con una sola modificación.15

### **3.3 Gestión de Estado Global y Asíncrono**

Para una aplicación de servicios fiscales, la gestión del estado es compleja. Se requiere manejar datos de sesión de usuario, formularios multipaso extensos (como una declaración de impuestos) y el estado de carga de múltiples documentos.

- **Estado del Servidor (Server State):** Se utilizará **TanStack Query (React Query)**. Esta herramienta es esencial para gestionar datos asíncronos provenientes del backend. Maneja automáticamente el caché, la revalidación de datos en segundo plano y los estados de carga/error. Esto asegura que si el cliente actualiza su perfil en la web, la aplicación móvil refleje esos cambios inmediatamente sin necesidad de recargar manualmente, mejorando la experiencia de usuario.16
- **Estado del Cliente (Client State):** Para el estado global que no persiste en el servidor (como el paso actual en un asistente de formulario o la preferencia de tema UI), se recomienda **Zustand**. Es una biblioteca ligera, basada en hooks, que evita la complejidad y el "boilerplate" excesivo de Redux, manteniendo un rendimiento alto y una curva de aprendizaje baja.17

## ---

**4\. Arquitectura de Backend: Node.js y NestJS**

El backend es el cerebro de TrustTax. Debe ser seguro, escalable y fácil de mantener. Aunque el requisito es Node.js, utilizar "Node.js puro" o Express básico a menudo conduce a arquitecturas desordenadas en proyectos grandes. Por ello, la recomendación técnica firme es utilizar **NestJS**.

### **4.1 NestJS como Framework Empresarial**

NestJS es un framework progresivo de Node.js que utiliza TypeScript de forma nativa y está fuertemente inspirado en Angular. Promueve una arquitectura modular sólida, inyección de dependencias y patrones de diseño bien establecidos (Decoradores, Guardianes, Interceptores).18

**Módulos Propuestos para TrustTax:**

1. **AuthModule:** Encargado de la integración con Firebase, validación de tokens y gestión de sesiones.
2. **UserModule:** Gestión de perfiles de clientes y administradores, preferencias y configuraciones.
3. **TaxModule:** Lógica específica de impuestos. Cálculo de estimaciones, gestión de formularios fiscales (1040, W-2), lógica de deducciones.
4. **ImmigrationModule:** Lógica de casos de inmigración. Seguimiento de estados, gestión de formularios (I-485, N-400), cálculo de fechas límite legales.
5. **DocumentModule:** Gestión de subida, almacenamiento seguro, indexación y recuperación de archivos. Integración con OCR.
6. **NotificationModule:** Orquestación de emails (SendGrid/AWS SES) y notificaciones push (Firebase Cloud Messaging).

### **4.2 Modelo de Autenticación Híbrido: Node.js \+ Firebase**

El usuario especificó el uso de Firebase para autenticación. Sin embargo, confiar únicamente en el SDK de cliente de Firebase para la seguridad de los datos es un error crítico en aplicaciones que manejan información sensible (PII). Se debe implementar un modelo de **Validación de Token en el Servidor**.20

**Flujo de Autenticación Detallado:**

1. **Login en Cliente:** El usuario inicia sesión en la app React/React Native usando el SDK de Firebase (Google Sign-In, Apple ID, Email/Password). Firebase devuelve un ID Token (JWT) firmado.
2. **Transmisión Segura:** El cliente envía este token en el encabezado Authorization: Bearer \<token\> de cada solicitud HTTP hacia el backend NestJS.
3. **Middleware de Verificación (AuthGuard):**
   - NestJS intercepta la solicitud mediante un Guard.
   - Utiliza el SDK firebase-admin para verificar criptográficamente el token: admin.auth().verifyIdToken(token). Esto asegura que el token fue emitido por Google, no ha expirado y no ha sido revocado.
   - Si es válido, el backend extrae el uid (User ID) de Firebase.
4. **Autorización de Negocio:** El backend utiliza ese uid para buscar en su propia base de datos (PostgreSQL) el perfil del usuario y sus roles (Admin, Cliente, Preparador). Esto permite un control de acceso basado en roles (RBAC) granular que Firebase Auth por sí solo no ofrece fácilmente (ej. "Un preparador solo puede ver los documentos de los clientes que tiene asignados").

Este enfoque combina la conveniencia y seguridad del manejo de identidad de Firebase con el control y la lógica de negocio robusta de un backend propio.23

## ---

**5\. Diseño de Base de Datos y Modelado de Datos**

Dada la naturaleza estructurada y relacional de los datos fiscales y de inmigración, una base de datos relacional SQL es superior a una NoSQL (como Firestore) para el núcleo de los datos de negocio. Se recomienda **PostgreSQL** por su robustez, soporte de transacciones ACID y capacidad de manejar consultas complejas.19

### **5.1 Estrategia de Persistencia de Datos**

Aunque Firebase es excelente para autenticación y actualizaciones en tiempo real, PostgreSQL será la "fuente de la verdad". Se utilizará **Prisma ORM** para interactuar con la base de datos desde NestJS. Prisma ofrece seguridad de tipos de extremo a extremo, lo que significa que el backend "sabe" exactamente qué campos existen en la base de datos, previniendo errores de tiempo de ejecución.

### **5.2 Esquema de Datos para Impuestos (Tax Schema)**

El modelo de datos para impuestos debe soportar la complejidad de múltiples años fiscales y tipos de formularios.

- **Tabla TaxReturns:** Almacena la cabecera de la declaración (Año Fiscal, Estado (Borrador/En Revisión/Finalizado), ID del Cliente, ID del Preparador).
- **Tabla TaxForms:** Relación uno a muchos con TaxReturns. Almacena los formularios individuales (W-2, 1099-MISC). Debido a que cada formulario tiene campos muy diferentes, se puede utilizar una columna tipo JSONB dentro de PostgreSQL para almacenar los datos específicos de cada formulario de manera flexible, manteniendo las ventajas de SQL para los metadatos.25
- **Tabla Deductions:** Registro detallado de gastos deducibles, vinculados a categorías y con referencias a las evidencias documentales.

### **5.3 Esquema de Datos para Inmigración (Immigration Schema)**

Los casos de inmigración son procesos de larga duración con múltiples hitos.

- **Tabla ImmigrationCases:** Tipo de caso (Residencia, Ciudadanía, Visa de Trabajo), Número de Recibo de USCIS, Fecha de Prioridad.
- **Tabla CaseTimeline:** Una tabla de eventos vinculada al caso. Cada fila representa un hito: "Solicitud Recibida", "Cita de Biométricos Programada", "RFE Recibida". Esto permite construir la visualización de línea de tiempo en el frontend.
- **Integración con Boletines de Visas:** Se pueden mantener tablas auxiliares con datos de los boletines de visas para calcular automáticamente si una fecha de prioridad está vigente, una característica de alto valor para los clientes.27

## ---

**6\. Manejo de Documentos y Seguridad de la Información (PII)**

TrustTax manejará documentos extremadamente sensibles (Pasaportes, Tarjetas de Seguro Social, Declaraciones de Impuestos). La seguridad en esta capa es innegociable.

### **6.1 Almacenamiento Seguro de Documentos**

No se deben almacenar archivos binarios en la base de datos. Se utilizará un servicio de almacenamiento de objetos como **AWS S3** o **Google Cloud Storage**.

- **Bucket Privado:** El bucket de almacenamiento debe estar configurado como totalmente privado, bloqueando todo acceso público directo.
- **URLs Firmadas (Signed URLs):** Cuando un usuario autenticado necesita ver un documento (ej. un PDF de su declaración), el backend de Node.js genera una URL firmada temporalmente (válida por 15 minutos) que otorga acceso directo al archivo. Esto evita que el tráfico pase por el servidor de aplicaciones (ahorrando ancho de banda) pero mantiene el control de seguridad estricto.28

### **6.2 Encriptación y Protección de PII**

- **Encriptación en Reposo:** La base de datos PostgreSQL debe tener activada la encriptación de almacenamiento. Además, campos críticos como el SSN (Número de Seguro Social) deben encriptarse a nivel de aplicación antes de ser insertados en la base de datos, utilizando algoritmos estándar como AES-256. La clave de desencriptación debe gestionarse mediante un servicio de gestión de secretos (como AWS KMS o Google Secret Manager) y nunca debe estar "hardcoded" en el código fuente.29
- **Encriptación en Tránsito:** Todo el tráfico debe forzarse a través de HTTPS utilizando TLS 1.2 o superior. Se debe implementar HSTS (HTTP Strict Transport Security) para evitar ataques de "downgrade".

## ---

**7\. Flujos de Trabajo y Automatización del Negocio**

La aplicación debe modelar los procesos reales de una firma de impuestos e inmigración para aportar valor real.

### **7.1 Automatización del Flujo Fiscal (Tax Workflow)**

1. **Intake Digital:** El cliente utiliza la app móvil para escanear documentos. Se integra una librería de escaneo en React Native que detecta bordes y corrige la perspectiva.
2. **OCR y Extracción de Datos:** Al subir el documento, el backend puede enviarlo a un servicio de OCR (como Google Cloud Vision API o AWS Textract). Esto extrae datos clave (Salarios, Impuestos Retenidos) y pre-llena el formulario en la base de datos, reduciendo la entrada manual de datos para el preparador.30
3. **Revisión y Feedback:** El preparador revisa los datos en el Panel Admin. Si falta algo, marca el campo específico. Esto dispara una notificación push al cliente: "Se requiere evidencia adicional para la deducción médica".
4. **Firma Electrónica:** Una vez finalizada la declaración, se genera un PDF. Se integra una API de firma electrónica (como DocuSign o una solución embebida) para recabar la firma legal del cliente directamente en la app.31

### **7.2 Gestión Proactiva de Inmigración**

- **Rastreo Automático:** El backend puede implementar tareas programadas (Cron Jobs en NestJS) que consulten periódicamente el estado de los casos en el portal de USCIS (siempre respetando los términos de servicio y límites de tasa) para detectar cambios de estado.
- **Alertas de Vencimiento:** El sistema debe calcular fechas críticas (ej. vencimiento de un permiso de trabajo EAD) y enviar recordatorios automáticos por email y push notification 90, 60 y 30 días antes, invitando al cliente a iniciar el proceso de renovación.32

## ---

**8\. Infraestructura, Despliegue y CI/CD**

Para asegurar la escalabilidad y la estabilidad, el proceso de despliegue debe estar completamente automatizado.

### **8.1 Estrategia de Hosting**

- **Web (React + Vite):** Se recomienda **Vercel** o **Netlify**. Ambos ofrecen excelente soporte para SPAs de React, con despliegues automáticos (CI/CD) y redes de entrega de contenido (CDN) globales. Vercel es óptimo incluso sin Next.js.34
- **Backend (NestJS):** Se recomienda **Render** o **Google Cloud Run**. Ambas plataformas permiten desplegar el backend como un contenedor Docker. Render es particularmente atractivo por su facilidad de uso, capacidad de "Blue-Green deployments" (cero tiempo de inactividad) y gestión automática de certificados SSL.36
- **Base de Datos:** PostgreSQL gestionado (ej. Supabase, AWS RDS o el mismo Render). Esto delega la gestión de copias de seguridad, actualizaciones y escalado al proveedor de la nube.

### **8.2 Integración Continua y Despliegue (CI/CD)**

Utilizando **GitHub Actions** como motor de CI/CD, se definen los siguientes flujos de trabajo automatizados:

| Evento           | Acción Automatizada                                                                                                                                                                                                                                                     |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pull Request** | Ejecución de Turborepo para correr lint y test solo en los paquetes afectados. Verificación de tipos TypeScript.                                                                                                                                                        |
| **Merge a main** | 1\. Construcción de imágenes Docker para el backend. 2\. Despliegue del Backend a Render (Entorno Staging/Prod). 3\. Despliegue del Frontend Web a Vercel. 4\. Publicación de actualización OTA (Over-The-Air) para la app móvil vía Expo EAS Update (canal 'preview'). |
| **Release Tag**  | Disparo de **EAS Build** para generar los binarios nativos (.apk,.ipa) y enviarlos a las tiendas de aplicaciones (Google Play, App Store).38                                                                                                                            |

### **8.3 Mobile DevOps con Expo EAS**

La gestión de la app móvil se realizará a través de **Expo Application Services (EAS)**.

- **EAS Build:** Permite compilar la aplicación en la nube de Expo, eliminando la necesidad de mantener Macs y entornos Android complejos en local.
- **EAS Submit:** Automatiza la subida de los binarios a las tiendas de aplicaciones.
- **EAS Update:** Permite corregir errores críticos de JavaScript en la app móvil de los usuarios finales instantáneamente, sin pasar por el proceso de revisión de Apple o Google (siempre que no se cambie código nativo o permisos), lo cual es vital durante la temporada alta de impuestos.41

## ---

**9\. Conclusiones y Recomendaciones Finales**

La arquitectura propuesta para **TrustTax** representa un equilibrio óptimo entre velocidad de desarrollo inicial y robustez empresarial a largo plazo. La adopción de un **monorepo con Turborepo** es la decisión estratégica más impactante, ya que elimina silos de información y garantiza la coherencia entre la plataforma web y móvil. La combinación de **NestJS y PostgreSQL** proporciona una base sólida y tipada para la gestión de datos complejos de impuestos e inmigración, mientras que el modelo de autenticación híbrido con **Firebase** asegura la seguridad de la identidad sin sacrificar el control de acceso empresarial.

Finalmente, la elección de **Gluestack UI** y **Solito** facilita una experiencia de desarrollo "universal", permitiendo al equipo de ingeniería entregar valor en múltiples plataformas con una eficiencia sin precedentes. Esta infraestructura no solo está preparada para manejar la carga operativa actual, sino que está diseñada para escalar horizontalmente y adaptarse a las futuras innovaciones tecnológicas en el sector LegalTech y FinTech.

### **Resumen de Tecnologías Seleccionadas**

| Capa                | Tecnología Recomendada          | Justificación Clave                                                    |
| :------------------ | :------------------------------ | :--------------------------------------------------------------------- |
| **Monorepo**        | Turborepo \+ pnpm               | Caché remoto, velocidad de build, gestión eficiente de disco.          |
| **Web**             | React \+ Vite                   | Performance, simplicidad, SPAs robustas sin la complejidad de SSR.     |
| **Móvil**           | Expo (React Native)             | Iteración rápida, actualizaciones OTA, gestión simplificada de nativo. |
| **Backend**         | NestJS (Node.js)                | Arquitectura modular, TypeScript, inyección de dependencias.           |
| **Base de Datos**   | PostgreSQL \+ Prisma            | Integridad relacional, seguridad de tipos, consultas complejas.        |
| **UI Kit**          | Gluestack UI \+ NativeWind      | Estilizado universal (Tailwind), accesibilidad, componentes headless.  |
| **Navegación**      | React Router / React Navigation | Estándares respectivos de Web y Móvil para mejor experiencia nativa.   |
| **Auth**            | Firebase \+ Server Guard        | Facilidad de uso en cliente, seguridad robusta en servidor.            |
| **Infraestructura** | Vercel (Web) / Render (API)     | Escalabilidad automática, integración CI/CD, DX superior.              |

Esta hoja de ruta técnica proporciona a TrustTax una ventaja competitiva significativa, asegurando que la tecnología sea un habilitador del negocio y no un obstáculo para su crecimiento.

#### **Fuentes citadas**

1. Setting up React Native Monorepo With Yarn Workspaces (2025) \- DEV Community, acceso: enero 22, 2026, [https://dev.to/pgomezec/setting-up-react-native-monorepo-with-yarn-workspaces-2025-a29](https://dev.to/pgomezec/setting-up-react-native-monorepo-with-yarn-workspaces-2025-a29)
2. The Ultimate Guide to Building a Monorepo in 2026: Sharing Code Like the Pros \- Medium, acceso: enero 22, 2026, [https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa](https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa)
3. Top 5 Monorepo Tools for 2025 | Best Dev Workflow Tools \- Aviator, acceso: enero 22, 2026, [https://www.aviator.co/blog/monorepo-tools/](https://www.aviator.co/blog/monorepo-tools/)
4. Nx vs Turborepo: A Comprehensive Guide to Monorepo Tools \- Wisp CMS, acceso: enero 22, 2026, [https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools](https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools)
5. Monorepo with Next.js and Expo \- Convex, acceso: enero 22, 2026, [https://www.convex.dev/templates/monorepo](https://www.convex.dev/templates/monorepo)
6. Start with an example \- Turborepo, acceso: enero 22, 2026, [https://turborepo.dev/docs/getting-started/examples](https://turborepo.dev/docs/getting-started/examples)
7. Monorepos\!\! Nx vs Turborepo vs Lerna – Part 1 \- DEV Community, acceso: enero 22, 2026, [https://dev.to/suryansh_yc/monorepos-nx-vs-turborepo-vs-lerna-part-1-turborepo-167f](https://dev.to/suryansh_yc/monorepos-nx-vs-turborepo-vs-lerna-part-1-turborepo-167f)
8. Going Universal: From a brownfield React Native and Next.js stack to one Expo app, acceso: enero 22, 2026, [https://expo.dev/blog/from-a-brownfield-react-native-and-next-js-stack-to-one-expo-app](https://expo.dev/blog/from-a-brownfield-react-native-and-next-js-stack-to-one-expo-app)
9. Introducing Solito 5 and the Web-Native Mindset | Callstack, acceso: enero 22, 2026, [https://www.callstack.com/events/exploring-solito-5-building-cross-platform-apps-with-react-and-react-native](https://www.callstack.com/events/exploring-solito-5-building-cross-platform-apps-with-react-and-react-native)
10. Compatibility \- Solito, acceso: enero 22, 2026, [https://solito.dev/compatibility](https://solito.dev/compatibility)
11. Solito 5 is now web-first (but still unifies NextJS and React Native) \- DEV Community, acceso: enero 22, 2026, [https://dev.to/redbar0n/solito-5-is-now-web-first-but-still-unifies-nextjs-and-react-native-2lek](https://dev.to/redbar0n/solito-5-is-now-web-first-but-still-unifies-nextjs-and-react-native-2lek)
12. Best react native ui libraries: Discover top UI toolkits for faster apps \- theappmarket, acceso: enero 22, 2026, [https://market.gluestack.io/blog/best-react-native-ui-libraries](https://market.gluestack.io/blog/best-react-native-ui-libraries)
13. GlueStack UI \- React and Native Components | All UtilityCSS, acceso: enero 22, 2026, [https://allutilitycss.com/components/gluestack-ui/](https://allutilitycss.com/components/gluestack-ui/)
14. Build a Simple UI with gluestack-ui and Expo, acceso: enero 22, 2026, [https://gluestack.io/blogs/build-a-simple-ui-with-gluestack-ui-and-expo](https://gluestack.io/blogs/build-a-simple-ui-with-gluestack-ui-and-expo)
15. Customizing Theme | gluestack-ui | Tailwind Css Theme, acceso: enero 22, 2026, [https://gluestack.io/ui/docs/home/theme-configuration/customizing-theme](https://gluestack.io/ui/docs/home/theme-configuration/customizing-theme)
16. Top 10 React Libraries to Use in 2025 \- Strapi, acceso: enero 22, 2026, [https://strapi.io/blog/top-react-libraries](https://strapi.io/blog/top-react-libraries)
17. Starting a React Native Project in 2025: Best Practices for Beginners \- Medium, acceso: enero 22, 2026, [https://medium.com/@sainudheenp/starting-a-react-native-project-in-2025-best-practices-for-beginners-4b242c721104](https://medium.com/@sainudheenp/starting-a-react-native-project-in-2025-best-practices-for-beginners-4b242c721104)
18. vndevteam/nestjs-turbo: Monorepo with NestJS boilerplate, Next.js, Nextra docs & Turbo, acceso: enero 22, 2026, [https://github.com/vndevteam/nestjs-turbo](https://github.com/vndevteam/nestjs-turbo)
19. barisgit/nextjs-nestjs-expo-template: Full Stack Typesafe Turborepo Boilerplate \- GitHub, acceso: enero 22, 2026, [https://github.com/barisgit/nextjs-nestjs-expo-template](https://github.com/barisgit/nextjs-nestjs-expo-template)
20. How to set up Firebase Authentication in Node.js Application \- Aegis Softtech, acceso: enero 22, 2026, [https://www.aegissofttech.com/insights/setup-firebase-authentication-in-nodejs/](https://www.aegissofttech.com/insights/setup-firebase-authentication-in-nodejs/)
21. Firebase and backend logic \- node.js \- Stack Overflow, acceso: enero 22, 2026, [https://stackoverflow.com/questions/35360421/firebase-and-backend-logic](https://stackoverflow.com/questions/35360421/firebase-and-backend-logic)
22. Verify ID Tokens | Firebase Authentication \- Google, acceso: enero 22, 2026, [https://firebase.google.com/docs/auth/admin/verify-id-tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
23. Secure Firebase Auth with NestJS Backend & Angular Frontend | by Yinyum \- Medium, acceso: enero 22, 2026, [https://medium.com/@yinyum/secure-firebase-auth-with-nestjs-backend-angular-frontend-cc4c93a2b917](https://medium.com/@yinyum/secure-firebase-auth-with-nestjs-backend-angular-frontend-cc4c93a2b917)
24. Fully Typesafe Turborepo Template \- NestJS, NextJS, Expo, tRPC, socket.io : r/reactjs, acceso: enero 22, 2026, [https://www.reddit.com/r/reactjs/comments/1jxj5sh/fully_typesafe_turborepo_template_nestjs_nextjs/](https://www.reddit.com/r/reactjs/comments/1jxj5sh/fully_typesafe_turborepo_template_nestjs_nextjs/)
25. Modelling a Database for Recording Taxes, acceso: enero 22, 2026, [https://dba.stackexchange.com/questions/196820/modelling-a-database-for-recording-taxes](https://dba.stackexchange.com/questions/196820/modelling-a-database-for-recording-taxes)
26. Taxes Database Schema \- Stack Overflow, acceso: enero 22, 2026, [https://stackoverflow.com/questions/16801286/taxes-database-schema](https://stackoverflow.com/questions/16801286/taxes-database-schema)
27. Adjustment of Status Timeline: A Step-by-Step Guide for Law Firms | MyCase, acceso: enero 22, 2026, [https://www.mycase.com/blog/legal-case-management/adjustment-of-status-timeline/](https://www.mycase.com/blog/legal-case-management/adjustment-of-status-timeline/)
28. Authentication With Firebase In React and Node.js | by Vaibhavdeshmukh Mern | Medium, acceso: enero 22, 2026, [https://medium.com/@vaibhavdeshmukh.mern/authentication-with-firebase-in-react-and-node-js-9fbbdd11d293](https://medium.com/@vaibhavdeshmukh.mern/authentication-with-firebase-in-react-and-node-js-9fbbdd11d293)
29. How to secure business documents in storage systems and beyond \- Sealpath, acceso: enero 22, 2026, [https://www.sealpath.com/blog/secure-business-documents-storage-systems/](https://www.sealpath.com/blog/secure-business-documents-storage-systems/)
30. Successful Tax Workflow, acceso: enero 22, 2026, [https://corp.sureprep.com/wp-content/uploads/5-Steps-to-a-Successful-Tax-Workflow-1.pdf](https://corp.sureprep.com/wp-content/uploads/5-Steps-to-a-Successful-Tax-Workflow-1.pdf)
31. What is tax client portal software? A complete guide for accountants & CPAs | Moxo, acceso: enero 22, 2026, [https://www.moxo.com/blog/tax-client-portal-software](https://www.moxo.com/blog/tax-client-portal-software)
32. Understanding USCIS Case Status and Processing Times: What Each Status Means, acceso: enero 22, 2026, [https://opensphere.ai/immigration-resources/understanding-uscis-case-status-and-processing-times-what-each-status-means](https://opensphere.ai/immigration-resources/understanding-uscis-case-status-and-processing-times-what-each-status-means)
33. Top Features of Leading Case Management Software: Immigration Speed, acceso: enero 22, 2026, [https://mylegalsoftware.com/top-features-of-leading-case-management-software-immigration-speed/](https://mylegalsoftware.com/top-features-of-leading-case-management-software-immigration-speed/)
34. Next.js on Vercel, acceso: enero 22, 2026, [https://vercel.com/docs/frameworks/full-stack/nextjs](https://vercel.com/docs/frameworks/full-stack/nextjs)
35. Getting Started: Deploying \- Next.js, acceso: enero 22, 2026, [https://nextjs.org/docs/pages/getting-started/deploying](https://nextjs.org/docs/pages/getting-started/deploying)
36. Deploy a Next.js App – Render Docs, acceso: enero 22, 2026, [https://render.com/docs/deploy-nextjs-app](https://render.com/docs/deploy-nextjs-app)
37. My Journey Deploying a Node.js \+ TypeScript App on Vercel and Render \- Medium, acceso: enero 22, 2026, [https://medium.com/@shadchika20/my-journey-deploying-a-node-js-typescript-app-on-vercel-and-render-322c8980d253](https://medium.com/@shadchika20/my-journey-deploying-a-node-js-typescript-app-on-vercel-and-render-322c8980d253)
38. Trigger builds from CI \- Expo Documentation, acceso: enero 22, 2026, [https://docs.expo.dev/build/building-on-ci/](https://docs.expo.dev/build/building-on-ci/)
39. React Native App Deployment with Expo & EAS CLI: Your Complete Guide to App Store Publishing \- Levi9 Serbia, acceso: enero 22, 2026, [https://levi9-serbia.medium.com/react-native-app-deployment-with-expo-eas-cli-your-complete-guide-to-app-store-publishing-d4674cb00518](https://levi9-serbia.medium.com/react-native-app-deployment-with-expo-eas-cli-your-complete-guide-to-app-store-publishing-d4674cb00518)
40. CI/CD Pipeline for React Native Apps: A Complete Guide | by ADEEL AHMED \- Medium, acceso: enero 22, 2026, [https://medium.com/@sp22-bcs-040/ci-cd-pipeline-for-react-native-apps-a-complete-guide-546f6ce7f116](https://medium.com/@sp22-bcs-040/ci-cd-pipeline-for-react-native-apps-a-complete-guide-546f6ce7f116)
41. How can I build and distribute an Expo (React Native) app without using EAS Build, while still supporting CI/CD and OTA testing for QA? \- Reddit, acceso: enero 22, 2026, [https://www.reddit.com/r/expo/comments/1l2ko25/how_can_i_build_and_distribute_an_expo_react/](https://www.reddit.com/r/expo/comments/1l2ko25/how_can_i_build_and_distribute_an_expo_react/)
