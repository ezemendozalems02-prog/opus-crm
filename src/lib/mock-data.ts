import type { Lead, Activity, Niche, Campaign, MessageTemplate, DailyMetrics } from './types'

export const mockNiches: Niche[] = [
  {
    id: '1', name: 'Restaurantes', color: '#f97316',
    description: 'Bares, restaurantes, parrillas y locales gastronómicos',
    problema: 'Dependen del boca a boca y tienen poca presencia digital. Les cuesta conseguir reservas nuevas.',
    oportunidad: 'Instagram y Google Maps bien trabajados multiplican las reservas sin costo publicitario.',
    tipo_cliente: 'Dueños de restaurante entre 35-55 años, activos en Instagram pero sin estrategia.',
    mensaje_sugerido: 'Hola! Vi su perfil y la verdad tienen muy buena propuesta. Te hago una consulta rápida, ¿ya están trabajando con página web o manejan todo por Instagram?',
    created_at: '2024-01-01',
  },
  {
    id: '2', name: 'Clínicas', color: '#06b6d4',
    description: 'Clínicas médicas, odontológicas y centros de salud',
    problema: 'No tienen sistema para conseguir pacientes nuevos. Dependen de derivaciones.',
    oportunidad: 'Las clínicas que trabajan su reputación online triplican las consultas en 90 días.',
    tipo_cliente: 'Médicos y directivos entre 40-60 años que quieren escalar sin complicarse.',
    mensaje_sugerido: 'Hola doctor/a! Vi la clínica en Google y tienen muy buenas referencias. ¿Están buscando conseguir más consultas nuevas por redes o ya tienen eso cubierto?',
    created_at: '2024-01-01',
  },
  {
    id: '3', name: 'Inmobiliarias', color: '#8b5cf6',
    description: 'Inmobiliarias y agentes de bienes raíces',
    problema: 'Publican propiedades en portales pero no generan leads propios. Alta competencia.',
    oportunidad: 'Con una presencia digital propia capturan leads sin pagar comisión a portales.',
    tipo_cliente: 'Dueños de inmobiliaria con 2-10 empleados, quieren crecer pero no saben cómo diferenciarse.',
    mensaje_sugerido: 'Hola! Vi que trabajan en la zona y tienen propiedades muy interesantes. ¿Tienen web propia donde la gente los pueda contactar o trabajan solo con los portales?',
    created_at: '2024-01-01',
  },
  {
    id: '4', name: 'Concesionarias', color: '#f59e0b',
    description: 'Concesionarias de autos nuevos y usados',
    problema: 'El vendedor de autos depende de que el cliente entre al local. Pocos capturan leads online.',
    oportunidad: 'Una estrategia de contenido + formulario de consulta puede duplicar las ventas mensuales.',
    tipo_cliente: 'Gerentes de ventas de 30-50 años que manejan equipos y quieren más volumen.',
    mensaje_sugerido: '¡Hola! Vi el perfil de la concesionaria y tienen un catálogo muy completo. ¿Los clientes los contactan más por Instagram o por WhatsApp cuando ven un auto que les interesa?',
    created_at: '2024-01-01',
  },
  {
    id: '5', name: 'Estudios jurídicos', color: '#6366f1',
    description: 'Estudios de abogados, notarías y consultoras legales',
    problema: 'La mayoría de los estudios no tienen presencia digital. Difícil diferenciarse.',
    oportunidad: 'El cliente legal busca en Google antes de llamar. Quien aparece primero gana.',
    tipo_cliente: 'Abogados independientes o socios de estudio que quieren posicionarse.',
    mensaje_sugerido: 'Hola! Vi el estudio en LinkedIn y tienen una trayectoria importante. ¿Están recibiendo consultas nuevas por internet o todos los casos vienen por referidos?',
    created_at: '2024-01-01',
  },
  {
    id: '6', name: 'Mármoles y Granitos', color: '#14b8a6',
    description: 'Empresas de mármoles, granitos, revestimientos y construcción',
    problema: 'Venden a través de relaciones con constructores pero no capturan clientes finales.',
    oportunidad: 'Las fotos de obra terminada generan mucho interés en Instagram. Casi nadie lo hace bien.',
    tipo_cliente: 'Dueños de empresa entre 40-60 años, trabajan mucho pero no muestran su trabajo.',
    mensaje_sugerido: 'Hola! Vi algunos trabajos de mármol que mostraron y están muy buenos. ¿Trabajan también con particulares que están refaccionando o sólo con empresas constructoras?',
    created_at: '2024-01-01',
  },
  {
    id: '7', name: 'Corralones', color: '#10b981',
    description: 'Corralones y ferreterías de materiales de construcción',
    problema: 'Clientes los conocen de toda la vida pero no llegan a nuevos compradores.',
    oportunidad: 'Un catálogo de precios online y WhatsApp bien organizado puede triplicar las consultas.',
    tipo_cliente: 'Dueños de corralón familiar entre 45-65 años, muy buenos en el negocio pero poco digitales.',
    mensaje_sugerido: 'Buenas! Vi el corralón y tienen muy buenos materiales. ¿Los clientes cuando necesitan cotización los llaman o tienen forma de mandar el pedido por WhatsApp?',
    created_at: '2024-01-01',
  },
  {
    id: '8', name: 'Locales de celulares', color: '#ec4899',
    description: 'Locales de venta y reparación de celulares y accesorios',
    problema: 'Mucha competencia y precios similares. Difícil diferenciarse del local de al lado.',
    oportunidad: 'Quien construye comunidad en Instagram con contenido útil se vuelve el referente de la zona.',
    tipo_cliente: 'Dueños jóvenes de 25-40 años, conocen bien el negocio pero no saben de marketing.',
    mensaje_sugerido: '¡Hola! Vi el local y tienen muy buenas reseñas. ¿Están activos en Instagram o reciben más consultas por WhatsApp cuando la gente quiere saber precios?',
    created_at: '2024-01-01',
  },
  {
    id: '9', name: 'Estéticas', color: '#a855f7',
    description: 'Centros estéticos, salones de belleza y spas',
    problema: 'Les cuesta llenar la agenda y fidelizar clientes. Alta rotación.',
    oportunidad: 'Las estéticas que usan Instagram + testimonios + sistema de turnos online llenan agenda fácil.',
    tipo_cliente: 'Dueñas de estética de 28-45 años, muy buenas en su trabajo pero sin tiempo para redes.',
    mensaje_sugerido: 'Hola! Vi el centro y tienen unos resultados increíbles. ¿Cómo manejan los turnos ahora, la gente les escribe por Instagram o tienen sistema de reserva online?',
    created_at: '2024-01-01',
  },
  {
    id: '10', name: 'Indumentaria', color: '#ef4444',
    description: 'Locales de ropa, moda y accesorios',
    problema: 'Instagram lleno de fotos pero sin estrategia de ventas. No convierten seguidores en clientes.',
    oportunidad: 'Con historias bien trabajadas y catálogo en WhatsApp Business se puede vender todos los días.',
    tipo_cliente: 'Emprendedoras de 25-40 años con marca propia o local multimarca, activas en redes.',
    mensaje_sugerido: '¡Hola! Vi la ropa que tienen y están muy buenos los modelos. ¿Venden solo en el local o también hacen envíos? Quería consultarte algo rápido sobre cómo están manejando el online.',
    created_at: '2024-01-01',
  },
]

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
const in3days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
const in2days = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

export const mockLeads: Lead[] = [
  {
    id: '1', name: 'Fabio Esposito', business_name: 'La Toscana Mármoles', niche: 'Mármoles y Granitos',
    city: 'Escobar', instagram: '@latoscana_marmoles', whatsapp: '+5491167834521',
    website: 'latoscana.com.ar', status: 'interested', interest_level: 5, score: 88,
    last_contacted_at: yesterday, next_followup_at: today,
    created_at: '2024-11-01', updated_at: yesterday,
    notes: 'Muy interesado. Tiene obras en Nordelta y quiere mostrar sus trabajos en Instagram. Presupuesto disponible.',
  },
  {
    id: '2', name: 'Roberto Ferrero', business_name: 'Estudio Jurídico Ferrero', niche: 'Estudios jurídicos',
    city: 'CABA', instagram: '@estudioferrero', whatsapp: '+5491145678234',
    website: '', status: 'replied', interest_level: 4, score: 71,
    last_contacted_at: twoDaysAgo, next_followup_at: today,
    created_at: '2024-11-05', updated_at: twoDaysAgo,
    notes: 'Respondió consultando por precio. Especializado en derecho laboral.',
  },
  {
    id: '3', name: 'Dra. Valeria Sánchez', business_name: 'Clínica Norte Pilar', niche: 'Clínicas',
    city: 'Pilar', instagram: '@clinicapilar', whatsapp: '+5491156723489',
    website: 'clinicapilar.com.ar', status: 'meeting', interest_level: 5, score: 94,
    last_contacted_at: yesterday, next_followup_at: in2days,
    created_at: '2024-10-28', updated_at: yesterday,
    notes: 'Reunión confirmada el martes. Maneja 3 especialidades y quiere conseguir más pacientes por Google.',
  },
  {
    id: '4', name: 'Kenji Yamamoto', business_name: 'Rincón Sushi', niche: 'Restaurantes',
    city: 'Tigre', instagram: '@rinconsushi_tigre', whatsapp: '+5491143217654',
    website: '', status: 'proposal', interest_level: 4, score: 82,
    last_contacted_at: yesterday, next_followup_at: in3days,
    created_at: '2024-11-10', updated_at: yesterday,
    notes: 'Le mandé propuesta. Tiene un local muy lindo pero sin estrategia en redes. Le copó la idea de los reels de preparación.',
  },
  {
    id: '5', name: 'Sebastián Molina', business_name: 'Móvil Store', niche: 'Locales de celulares',
    city: 'Caseros', instagram: '@movilstore_caseros', whatsapp: '+5491167234890',
    website: '', status: 'contacted', interest_level: 3, score: 55,
    last_contacted_at: threeDaysAgo, next_followup_at: today,
    created_at: '2024-11-15', updated_at: threeDaysAgo,
    notes: 'Primer contacto enviado. Tiene dos locales. Vio el mensaje pero no respondió todavía.',
  },
  {
    id: '6', name: 'Marcelo Díaz', business_name: 'Inmobiliaria Delta', niche: 'Inmobiliarias',
    city: 'Tigre', instagram: '@inmobiliaria_delta', whatsapp: '+5491134521876',
    website: 'inmobileriadelta.com.ar', status: 'won', interest_level: 5, score: 97,
    last_contacted_at: '2024-11-01', next_followup_at: null,
    created_at: '2024-10-15', updated_at: '2024-11-01',
    notes: 'CERRADO. Arrancamos el 1ro. Contrato firmado por 3 meses. Pago por transferencia.',
  },
  {
    id: '7', name: 'Luciana Bianco', business_name: 'Bella Estética', niche: 'Estéticas',
    city: 'San Martín', instagram: '@bellastetica_sm', whatsapp: '+5491156789012',
    website: '', status: 'interested', interest_level: 4, score: 78,
    last_contacted_at: yesterday, next_followup_at: in3days,
    created_at: '2024-11-12', updated_at: yesterday,
    notes: 'Muy receptiva. Tiene el local hace 5 años y quiere crecer. Agenda medio floja en invierno.',
  },
  {
    id: '8', name: 'Diego Herrera', business_name: 'Urban Fit Gym', niche: 'Estéticas',
    city: 'CABA', instagram: '@urbanfit_bsas', whatsapp: '+5491189012345',
    website: 'urbanfit.com.ar', status: 'contacted', interest_level: 2, score: 40,
    last_contacted_at: twoDaysAgo, next_followup_at: today,
    created_at: '2024-11-18', updated_at: twoDaysAgo,
    notes: 'No respondió todavía. Tiene buen local en Palermo. Perfil de Instagram activo.',
  },
  {
    id: '9', name: 'Carlos Rivero', business_name: 'Corralón El Constructor', niche: 'Corralones',
    city: 'La Plata', instagram: '@corralon_constructor', whatsapp: '+5491156234789',
    website: '', status: 'new', interest_level: 2, score: 30,
    last_contacted_at: null, next_followup_at: today,
    created_at: '2024-11-20', updated_at: '2024-11-20',
    notes: '',
  },
  {
    id: '10', name: 'Alejandra Torino', business_name: 'Moda Alejandra', niche: 'Indumentaria',
    city: 'CABA', instagram: '@modaalejandra', whatsapp: '+5491145678901',
    website: 'modaalejandra.com.ar', status: 'replied', interest_level: 3, score: 63,
    last_contacted_at: threeDaysAgo, next_followup_at: today,
    created_at: '2024-11-08', updated_at: threeDaysAgo,
    notes: 'Respondió con entusiasmo. Quiere saber más. Tiene más de 5k seguidores.',
  },
  {
    id: '11', name: 'Hernán Gutiérrez', business_name: 'AutoCenter Pilar', niche: 'Concesionarias',
    city: 'Pilar', instagram: '@autocenter_pilar', whatsapp: '+5491167890123',
    website: 'autocenterpilar.com.ar', status: 'interested', interest_level: 4, score: 80,
    last_contacted_at: yesterday, next_followup_at: in2days,
    created_at: '2024-11-01', updated_at: yesterday,
    notes: 'Maneja 20 unidades por mes. Quiere más leads online. Buena conversación.',
  },
  {
    id: '12', name: 'Patricia Russo', business_name: 'Clínica Estética Russo', niche: 'Clínicas',
    city: 'Rosario', instagram: '@clinica_russo', whatsapp: '+5493416789012',
    website: '', status: 'contacted', interest_level: 3, score: 52,
    last_contacted_at: twoDaysAgo, next_followup_at: in3days,
    created_at: '2024-11-14', updated_at: twoDaysAgo,
    notes: 'Primera contacto enviado. Especializada en cirugía estética.',
  },
  {
    id: '13', name: 'Jorge Mármol', business_name: 'Piedras del Sur', niche: 'Mármoles y Granitos',
    city: 'Córdoba', instagram: '@piedrascordoba', whatsapp: '+5493516789012',
    website: 'piedrasdelsur.com', status: 'new', interest_level: 1, score: 25,
    last_contacted_at: null, next_followup_at: in2days,
    created_at: '2024-11-21', updated_at: '2024-11-21',
    notes: '',
  },
  {
    id: '14', name: 'Florencia Paz', business_name: 'Paz & Abogados', niche: 'Estudios jurídicos',
    city: 'CABA', instagram: '', whatsapp: '+5491134567890',
    website: 'pazabogados.com.ar', status: 'proposal', interest_level: 5, score: 91,
    last_contacted_at: yesterday, next_followup_at: in3days,
    created_at: '2024-10-20', updated_at: yesterday,
    notes: 'Lista para cerrar. Propuesta enviada ayer. Pidió que le mande el contrato.',
  },
  {
    id: '15', name: 'Néstor Álvarez', business_name: 'Parrilla Don Néstor', niche: 'Restaurantes',
    city: 'San Martín', instagram: '@parrilla_donnestor', whatsapp: '+5491156781234',
    website: '', status: 'lost', interest_level: 2, score: 20,
    last_contacted_at: '2024-11-05', next_followup_at: null,
    created_at: '2024-10-25', updated_at: '2024-11-05',
    notes: 'Dijo que no era el momento. Tiene mucho trabajo y no puede ocuparse.',
  },
  {
    id: '16', name: 'Romina Castro', business_name: 'TrendSet Ropa', niche: 'Indumentaria',
    city: 'CABA', instagram: '@trendset_ropa', whatsapp: '+5491178901234',
    website: '', status: 'interested', interest_level: 4, score: 76,
    last_contacted_at: twoDaysAgo, next_followup_at: in2days,
    created_at: '2024-11-09', updated_at: twoDaysAgo,
    notes: 'Quiere que le ayudemos a vender más por Instagram. Tiene local en Once y venta online.',
  },
  {
    id: '17', name: 'Gustavo Ferreyra', business_name: 'Corralón Ferreyra Hnos', niche: 'Corralones',
    city: 'Escobar', instagram: '@corralon_ferreyra', whatsapp: '+5491145689012',
    website: '', status: 'replied', interest_level: 3, score: 58,
    last_contacted_at: threeDaysAgo, next_followup_at: today,
    created_at: '2024-11-11', updated_at: threeDaysAgo,
    notes: 'Respondió consultando precio. Dijo que tiene muchos clientes pero no llega a los nuevos del barrio.',
  },
  {
    id: '18', name: 'Vanina López', business_name: 'Beauty Room VL', niche: 'Estéticas',
    city: 'CABA', instagram: '@beautyroom_vl', whatsapp: '+5491189234567',
    website: '', status: 'won', interest_level: 5, score: 95,
    last_contacted_at: '2024-11-03', next_followup_at: null,
    created_at: '2024-10-18', updated_at: '2024-11-03',
    notes: 'CERRADO. Arrancamos hace 2 semanas. Muy buena clienta. Ya pidió la renovación.',
  },
  {
    id: '19', name: 'Darío Campos', business_name: 'Campos Automotores', niche: 'Concesionarias',
    city: 'Córdoba', instagram: '@campos_autos', whatsapp: '+5493516234789',
    website: 'camposautomotores.com.ar', status: 'contacted', interest_level: 2, score: 45,
    last_contacted_at: twoDaysAgo, next_followup_at: in3days,
    created_at: '2024-11-16', updated_at: twoDaysAgo,
    notes: 'Contacto enviado. Tiene showroom propio con 15+ autos.',
  },
  {
    id: '20', name: 'Soledad Ibáñez', business_name: 'Sushi Fusion Rosario', niche: 'Restaurantes',
    city: 'Rosario', instagram: '@sushifusion_rosario', whatsapp: '+5493416123456',
    website: '', status: 'interested', interest_level: 4, score: 72,
    last_contacted_at: yesterday, next_followup_at: nextWeek,
    created_at: '2024-11-13', updated_at: yesterday,
    notes: 'Tiene dos sucursales. Quiere hacer contenido profesional. Le interesa pero viaja mucho.',
  },
  {
    id: '21', name: 'Mario Benedetti', business_name: 'Mármoles Benedetti', niche: 'Mármoles y Granitos',
    city: 'CABA', instagram: '@marmolesbenedetti', whatsapp: '+5491112345678',
    website: 'marmolesbenedetti.com.ar', status: 'meeting', interest_level: 5, score: 89,
    last_contacted_at: yesterday, next_followup_at: in2days,
    created_at: '2024-10-30', updated_at: yesterday,
    notes: 'Reunión confirmada. Empresa familiar de 20 años. Quieren renovar imagen.',
  },
  {
    id: '22', name: 'Cecilia Toro', business_name: 'Farmacia y Droguería Toro', niche: 'Clínicas',
    city: 'La Plata', instagram: '@farmaciaToro', whatsapp: '+5491156901234',
    website: '', status: 'new', interest_level: 1, score: 28,
    last_contacted_at: null, next_followup_at: in3days,
    created_at: '2024-11-22', updated_at: '2024-11-22',
    notes: '',
  },
]

export const mockActivities: Activity[] = [
  { id: '1', lead_id: '1', type: 'message_sent', description: 'Primer contacto por Instagram. Le comenté sobre gestión de contenido para mármoles.', created_at: '2024-11-01T10:00:00Z' },
  { id: '2', lead_id: '1', type: 'reply_received', description: 'Respondió con interés. Preguntó qué tipo de contenido haríamos.', created_at: '2024-11-03T14:30:00Z' },
  { id: '3', lead_id: '1', type: 'call', description: 'Llamada de 15 minutos. Tiene obras en Nordelta. Interesado en mostrar trabajos en Instagram.', created_at: '2024-11-10T09:00:00Z' },
  { id: '4', lead_id: '1', type: 'note', description: 'Presupuesto disponible. Mencionó inversión de hasta $150k/mes. Prioridad alta.', created_at: '2024-11-15T16:00:00Z' },
  { id: '5', lead_id: '1', type: 'status_change', description: 'Pasado a Interesado. Lista la propuesta para esta semana.', created_at: yesterday + 'T11:00:00Z' },
  { id: '6', lead_id: '3', type: 'message_sent', description: 'Contacto inicial por Instagram.', created_at: '2024-10-28T09:00:00Z' },
  { id: '7', lead_id: '3', type: 'reply_received', description: 'Respondió rápido. Muy interesada en conseguir más pacientes.', created_at: '2024-10-30T15:00:00Z' },
  { id: '8', lead_id: '3', type: 'meeting', description: 'Primera reunión virtual. Tiene 3 consultorios. Quiere trabajar SEO + redes.', created_at: '2024-11-10T14:00:00Z' },
  { id: '9', lead_id: '3', type: 'status_change', description: 'Reunión confirmada para el martes.', created_at: yesterday + 'T10:00:00Z' },
  { id: '10', lead_id: '4', type: 'message_sent', description: 'Primer contacto. Comenté sobre su sushi en Instagram.', created_at: '2024-11-10T11:00:00Z' },
  { id: '11', lead_id: '4', type: 'reply_received', description: 'Respondió interesado. Tiene el local hace 3 años y quiere crecer.', created_at: '2024-11-12T19:00:00Z' },
  { id: '12', lead_id: '4', type: 'call', description: 'Videollamada de 20 min. Le copó la idea de reels de preparación.', created_at: yesterday + 'T10:00:00Z' },
  { id: '13', lead_id: '4', type: 'status_change', description: 'Propuesta enviada por WhatsApp.', created_at: yesterday + 'T16:00:00Z' },
]

export const mockCampaigns: Campaign[] = [
  {
    id: '1', name: 'Mármoles GBA Norte', niche: 'Mármoles y Granitos',
    description: 'Empresas de mármol y granito en zona norte del GBA',
    status: 'active', start_date: '2024-11-01', end_date: null,
    leads_count: 18, messages_sent: 54, replies: 19, meetings: 5, closes: 2,
    created_at: '2024-11-01',
  },
  {
    id: '2', name: 'Clínicas Pilar-Escobar', niche: 'Clínicas',
    description: 'Clínicas y consultorios en corredor Pilar-Escobar',
    status: 'active', start_date: '2024-11-05', end_date: null,
    leads_count: 24, messages_sent: 72, replies: 24, meetings: 7, closes: 3,
    created_at: '2024-11-05',
  },
  {
    id: '3', name: 'Restaurantes Tigre', niche: 'Restaurantes',
    description: 'Locales gastronómicos en Tigre y Delta',
    status: 'paused', start_date: '2024-10-01', end_date: null,
    leads_count: 35, messages_sent: 105, replies: 32, meetings: 8, closes: 4,
    created_at: '2024-10-01',
  },
  {
    id: '4', name: 'Estudios Jurídicos CABA', niche: 'Estudios jurídicos',
    description: 'Estudios de abogados en CABA y zona norte',
    status: 'active', start_date: '2024-11-10', end_date: null,
    leads_count: 20, messages_sent: 60, replies: 15, meetings: 4, closes: 1,
    created_at: '2024-11-10',
  },
  {
    id: '5', name: 'Estéticas San Martín', niche: 'Estéticas',
    description: 'Centros estéticos en San Martín y alrededores',
    status: 'completed', start_date: '2024-09-01', end_date: '2024-10-31',
    leads_count: 42, messages_sent: 126, replies: 48, meetings: 12, closes: 5,
    created_at: '2024-09-01',
  },
]

export const mockTemplates: MessageTemplate[] = [
  // ═══ RESTAURANTES ═══
  {
    id: 'r1', name: 'Restaurantes — Primer contacto', niche: 'Restaurantes', type: 'initial',
    content: `Hola [Nombre]! Vi el perfil de [Negocio] y tienen muy buena pinta, en serio 🍽️

Te hago una consulta rápida: ¿ya tienen alguien que les lleve las redes o manejan todo ustedes?`,
    created_at: '2024-11-01',
  },
  {
    id: 'r2', name: 'Restaurantes — Seguimiento', niche: 'Restaurantes', type: 'followup',
    content: `Hola [Nombre], ¿cómo van? 👋

Te escribo de nuevo por si se perdió el mensaje. Tengo un par de ideas para [Negocio] que creo que te pueden interesar.

¿Cuándo tenés 10 minutos para hablar?`,
    created_at: '2024-11-01',
  },
  {
    id: 'r3', name: 'Restaurantes — Reenganche', niche: 'Restaurantes', type: 'reenganche',
    content: `Hola [Nombre]! Hace unos meses habíamos hablado un poco 😊

Vi que [Negocio] sigue activo y se nota la buena propuesta que tienen.

¿Sigue siendo algo que les puede interesar o ya lo tienen cubierto?`,
    created_at: '2024-11-01',
  },
  {
    id: 'r4', name: 'Restaurantes — Cierre', niche: 'Restaurantes', type: 'closing',
    content: `[Nombre], cerrando la semana y quería saber si le damos para adelante con lo que charlamos 🙌

Si te parece bien, esta semana lo empezamos. Solo necesito que me confirmes y coordinamos todo.

¿Qué te parece?`,
    created_at: '2024-11-01',
  },
  // ═══ CLÍNICAS ═══
  {
    id: 'c1', name: 'Clínicas — Primer contacto', niche: 'Clínicas', type: 'initial',
    content: `Hola [Nombre]! Vi la clínica en Google y tienen muy buenas referencias 👩‍⚕️

¿Están recibiendo consultas nuevas por redes o las derivaciones vienen más por médicos conocidos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'c2', name: 'Clínicas — Seguimiento', niche: 'Clínicas', type: 'followup',
    content: `Hola [Nombre], espero que estén bien por la clínica.

No quiero interrumpir el día, pero armé un análisis rápido de la presencia online de [Negocio] con algunas observaciones concretas.

¿Les mando lo que vi?`,
    created_at: '2024-11-01',
  },
  {
    id: 'c3', name: 'Clínicas — Reenganche', niche: 'Clínicas', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo te había comentado sobre lo que hacemos para clínicas.

Desde entonces conseguimos muy buenos resultados con otros consultorios de la zona.

¿Sigue siendo algo que les puede servir o ya lo resolvieron?`,
    created_at: '2024-11-01',
  },
  {
    id: 'c4', name: 'Clínicas — Cierre', niche: 'Clínicas', type: 'closing',
    content: `[Nombre], hablamos varias veces y quedamos en que lo pensaban 📋

Puedo tener todo listo para arrancar el lunes. El objetivo es simple: más pacientes nuevos por mes, sin depender de derivaciones.

¿Avanzamos?`,
    created_at: '2024-11-01',
  },
  // ═══ INMOBILIARIAS ═══
  {
    id: 'i1', name: 'Inmobiliarias — Primer contacto', niche: 'Inmobiliarias', type: 'initial',
    content: `Hola [Nombre]! Vi que trabajan en la zona y tienen propiedades muy interesantes 🏠

¿Los contactan más por los portales o también les llegan consultas directas por Instagram?`,
    created_at: '2024-11-01',
  },
  {
    id: 'i2', name: 'Inmobiliarias — Seguimiento', niche: 'Inmobiliarias', type: 'followup',
    content: `Hola [Nombre], ¿cómo va la temporada?

Te escribo por si no llegó el mensaje anterior. Tengo una idea puntual para que [Negocio] genere consultas propias sin depender de los portales.

¿Cuándo tienen un momento?`,
    created_at: '2024-11-01',
  },
  {
    id: 'i3', name: 'Inmobiliarias — Reenganche', niche: 'Inmobiliarias', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo habíamos hablado 👋

El mercado inmobiliario cambió bastante y lo que funciona en redes también.

¿Arrancaron a trabajar el digital o sigue todo igual?`,
    created_at: '2024-11-01',
  },
  {
    id: 'i4', name: 'Inmobiliarias — Cierre', niche: 'Inmobiliarias', type: 'closing',
    content: `[Nombre], esto es lo que te propongo para empezar 🏡

Sin compromiso largo. El primer mes lo usamos para ver resultados concretos.

¿Arrancamos la semana que viene?`,
    created_at: '2024-11-01',
  },
  // ═══ CONCESIONARIAS ═══
  {
    id: 'co1', name: 'Concesionarias — Primer contacto', niche: 'Concesionarias', type: 'initial',
    content: `Hola [Nombre]! Vi el perfil de [Negocio] y tienen un catálogo muy completo 🚗

¿Los clientes los consultan más por Instagram o prefieren ir directo al local cuando les interesa un auto?`,
    created_at: '2024-11-01',
  },
  {
    id: 'co2', name: 'Concesionarias — Seguimiento', niche: 'Concesionarias', type: 'followup',
    content: `Hola [Nombre], ¿cómo van las ventas?

Te mando esto por si se pasó el mensaje anterior. Estoy trabajando con algunas concesionarias de la zona y los resultados en Instagram fueron muy buenos.

¿Puedo contarte en 5 minutos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'co3', name: 'Concesionarias — Reenganche', niche: 'Concesionarias', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo habíamos hablado sobre las redes de [Negocio] 🚗

El mercado del usado está muy movido y quien tiene buena presencia online se lleva la consulta.

¿Vale la pena que retomemos la charla?`,
    created_at: '2024-11-01',
  },
  {
    id: 'co4', name: 'Concesionarias — Cierre', niche: 'Concesionarias', type: 'closing',
    content: `[Nombre], te mando la propuesta que charlamos 📋

Incluye gestión de Instagram, campañas de autos específicos y seguimiento semanal.

¿Arrancamos esta semana? Solo necesito el OK de tu parte.`,
    created_at: '2024-11-01',
  },
  // ═══ ESTUDIOS JURÍDICOS ═══
  {
    id: 'j1', name: 'Estudios jurídicos — Primer contacto', niche: 'Estudios jurídicos', type: 'initial',
    content: `Hola [Nombre]! Vi el estudio en LinkedIn y tienen muy buena trayectoria 👔

¿Están recibiendo consultas nuevas por internet o todos los casos les llegan por referidos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'j2', name: 'Estudios jurídicos — Seguimiento', niche: 'Estudios jurídicos', type: 'followup',
    content: `Hola [Nombre], espero que estén bien.

Quería saber si tuvieron oportunidad de ver el mensaje anterior.

Tengo una propuesta concreta para posicionar a [Negocio] online. ¿Le mando el detalle?`,
    created_at: '2024-11-01',
  },
  {
    id: 'j3', name: 'Estudios jurídicos — Reenganche', niche: 'Estudios jurídicos', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo te había comentado sobre presencia digital para estudios jurídicos.

Vi que en el rubro cada vez más clientes buscan abogados en Google antes de llamar.

¿Sigue siendo algo que les puede interesar?`,
    created_at: '2024-11-01',
  },
  {
    id: 'j4', name: 'Estudios jurídicos — Cierre', niche: 'Estudios jurídicos', type: 'closing',
    content: `[Nombre], quedamos en que lo pensaban 🤝

Si quieren arrancar este mes, puedo tener todo activo en 48 horas.

¿Avanzamos?`,
    created_at: '2024-11-01',
  },
  // ═══ MÁRMOLES Y GRANITOS ═══
  {
    id: 'm1', name: 'Mármoles — Primer contacto', niche: 'Mármoles y Granitos', type: 'initial',
    content: `Hola [Nombre]! Vi algunos trabajos que mostraron y están muy buenos de verdad 🪨

¿Trabajan también con particulares que están refaccionando o principalmente con constructoras?`,
    created_at: '2024-11-01',
  },
  {
    id: 'm2', name: 'Mármoles — Seguimiento', niche: 'Mármoles y Granitos', type: 'followup',
    content: `Hola [Nombre], ¿cómo van las obras?

Le mando esto por si no llegó el mensaje. Tengo claro cómo mostrar el trabajo de [Negocio] en Instagram para que lleguen más clientes nuevos.

¿Esta semana tienen un momento?`,
    created_at: '2024-11-01',
  },
  {
    id: 'm3', name: 'Mármoles — Reenganche', niche: 'Mármoles y Granitos', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo habíamos charlado sobre mostrar mejor los trabajos de [Negocio] 🏗️

Vi que siguen mostrando obras muy buenas. Con una pequeña estrategia esas fotos podrían traer muchos más clientes.

¿Vale la pena que retomemos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'm4', name: 'Mármoles — Cierre', niche: 'Mármoles y Granitos', type: 'closing',
    content: `[Nombre], por lo que charlamos creo que hay mucho potencial en [Negocio] 💪

Propongo arrancar con un plan chico para ver resultados rápido.

¿Le damos?`,
    created_at: '2024-11-01',
  },
  // ═══ CORRALONES ═══
  {
    id: 'cr1', name: 'Corralones — Primer contacto', niche: 'Corralones', type: 'initial',
    content: `Buenas [Nombre]! Vi el corralón y tienen muy buenos materiales 🧱

¿Los clientes cuando necesitan cotización los llaman directamente o tienen forma de mandar el pedido por WhatsApp?`,
    created_at: '2024-11-01',
  },
  {
    id: 'cr2', name: 'Corralones — Seguimiento', niche: 'Corralones', type: 'followup',
    content: `Buenas [Nombre], ¿cómo va todo?

Le escribo por si no llegó el mensaje anterior. Tengo una idea para que [Negocio] reciba más consultas sin mucho trabajo extra.

¿Cuándo tiene un momento para hablar?`,
    created_at: '2024-11-01',
  },
  {
    id: 'cr3', name: 'Corralones — Reenganche', niche: 'Corralones', type: 'reenganche',
    content: `Buenas [Nombre]! Hace un tiempo habíamos hablado 👋

Vi que el corralón sigue muy activo. Con WhatsApp Business bien configurado y una presencia básica en redes se pueden sumar bastantes clientes nuevos.

¿Sigue siendo algo que le puede servir?`,
    created_at: '2024-11-01',
  },
  {
    id: 'cr4', name: 'Corralones — Cierre', niche: 'Corralones', type: 'closing',
    content: `[Nombre], lo que hablamos es muy sencillo de arrancar 🧱

En una semana tienen el WhatsApp Business configurado y la presencia básica funcionando.

¿Arrancamos esta semana?`,
    created_at: '2024-11-01',
  },
  // ═══ LOCALES DE CELULARES ═══
  {
    id: 'ce1', name: 'Celulares — Primer contacto', niche: 'Locales de celulares', type: 'initial',
    content: `Hola [Nombre]! Vi el local y tienen muy buenas reseñas 📱

¿Están activos en Instagram o reciben más consultas por WhatsApp cuando la gente quiere saber precios?`,
    created_at: '2024-11-01',
  },
  {
    id: 'ce2', name: 'Celulares — Seguimiento', niche: 'Locales de celulares', type: 'followup',
    content: `Hola [Nombre], ¿cómo va el local?

Te escribo por si no llegó el mensaje. Los locales de celulares que trabajan bien Instagram se vuelven el referente de la zona, literalmente.

¿Cuándo tienen 10 minutos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'ce3', name: 'Celulares — Reenganche', niche: 'Locales de celulares', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo habíamos charlado sobre el Instagram de [Negocio] 📱

El mercado de celulares está muy competitivo y quien construye comunidad online se destaca del resto.

¿Vale la pena que retomemos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'ce4', name: 'Celulares — Cierre', niche: 'Locales de celulares', type: 'closing',
    content: `[Nombre], te mando esto para cerrar 📋

En un mes tenés más consultas y más clientes fidelizados. El trabajo lo hago yo, vos te enfocás en el local.

¿Arrancamos esta semana?`,
    created_at: '2024-11-01',
  },
  // ═══ ESTÉTICAS ═══
  {
    id: 'e1', name: 'Estéticas — Primer contacto', niche: 'Estéticas', type: 'initial',
    content: `Hola [Nombre]! Vi el centro y los resultados son increíbles ✨

¿Cómo manejan los turnos? ¿La gente les escribe por Instagram o tienen sistema de reserva online?`,
    created_at: '2024-11-01',
  },
  {
    id: 'e2', name: 'Estéticas — Seguimiento', niche: 'Estéticas', type: 'followup',
    content: `Hola [Nombre], ¿cómo va la agenda?

Te escribo de nuevo por si se perdió el mensaje. Tengo ideas concretas para llenar los turnos en las semanas más flojas.

¿Cuándo podemos hablar unos minutos?`,
    created_at: '2024-11-01',
  },
  {
    id: 'e3', name: 'Estéticas — Reenganche', niche: 'Estéticas', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo habíamos hablado sobre [Negocio] ✨

Vi que siguen mostrando muy buenos resultados. Con una estrategia más ordenada en Instagram esos trabajos podrían traer muchos más turnos nuevos.

¿Sigue siendo algo que te puede servir?`,
    created_at: '2024-11-01',
  },
  {
    id: 'e4', name: 'Estéticas — Cierre', niche: 'Estéticas', type: 'closing',
    content: `[Nombre], para arrancar solo necesito que me confirmes 💆‍♀️

El objetivo es simple: más turnos, menos tiempo perdido en redes.

¿Le damos esta semana?`,
    created_at: '2024-11-01',
  },
  // ═══ INDUMENTARIA ═══
  {
    id: 'in1', name: 'Indumentaria — Primer contacto', niche: 'Indumentaria', type: 'initial',
    content: `Hola [Nombre]! Vi la ropa que tienen y los modelos están muy buenos 👗

¿Venden solo en el local o también hacen envíos? Quería consultarte algo rápido.`,
    created_at: '2024-11-01',
  },
  {
    id: 'in2', name: 'Indumentaria — Seguimiento', niche: 'Indumentaria', type: 'followup',
    content: `Hola [Nombre], ¿cómo va la temporada?

Te mando esto por si se perdió el mensaje anterior. Tengo ideas para que [Negocio] venda todos los días, no solo cuando la gente pasa por el local.

¿Cuándo podemos hablar?`,
    created_at: '2024-11-01',
  },
  {
    id: 'in3', name: 'Indumentaria — Reenganche', niche: 'Indumentaria', type: 'reenganche',
    content: `Hola [Nombre]! Hace un tiempo habíamos hablado sobre el Instagram de [Negocio] 👗

Vi que siguen activos y con muy buena ropa. Hay mucho que se puede hacer para que esos seguidores compren seguido.

¿Sigue siendo algo que te puede interesar?`,
    created_at: '2024-11-01',
  },
  {
    id: 'in4', name: 'Indumentaria — Cierre', niche: 'Indumentaria', type: 'closing',
    content: `[Nombre], lo que te propuse es directo 💪

En un mes tenés contenido profesional, más alcance y clientes que compran sin que los tengas que convencer.

¿Arrancamos?`,
    created_at: '2024-11-01',
  },
]

export const mockDailyMetrics: DailyMetrics = {
  messages_sent: 18,
  responses: 7,
  meetings: 2,
  closes: 1,
  proposals: 3,
  goal_messages: 30,
  goal_meetings: 3,
}

export const mockAnalyticsData = {
  weekly: [
    { day: 'Lun', mensajes: 32, respuestas: 11, reuniones: 2 },
    { day: 'Mar', mensajes: 28, respuestas: 9, reuniones: 3 },
    { day: 'Mié', mensajes: 35, respuestas: 14, reuniones: 1 },
    { day: 'Jue', mensajes: 41, respuestas: 16, reuniones: 4 },
    { day: 'Vie', mensajes: 29, respuestas: 10, reuniones: 2 },
    { day: 'Sáb', mensajes: 15, respuestas: 5, reuniones: 1 },
    { day: 'Dom', mensajes: 8, respuestas: 2, reuniones: 0 },
  ],
  monthly: [
    { month: 'Ago', mensajes: 520, cierres: 6 },
    { month: 'Sep', mensajes: 680, cierres: 9 },
    { month: 'Oct', mensajes: 810, cierres: 13 },
    { month: 'Nov', mensajes: 740, cierres: 11 },
    { month: 'Dic', mensajes: 420, cierres: 7 },
  ],
  rubroRendimiento: [
    { rubro: 'Mármoles', leads: 18, cierres: 4, tasa: 22.2 },
    { rubro: 'Clínicas', leads: 24, cierres: 5, tasa: 20.8 },
    { rubro: 'Estéticas', leads: 42, cierres: 8, tasa: 19.0 },
    { rubro: 'Restaurantes', leads: 35, cierres: 6, tasa: 17.1 },
    { rubro: 'Inmobiliarias', leads: 20, cierres: 3, tasa: 15.0 },
    { rubro: 'Jurídicos', leads: 20, cierres: 2, tasa: 10.0 },
  ],
}
