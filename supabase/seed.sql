-- Seed data para Opus Prospect CRM
-- Rubros y plantillas iniciales en español argentino

-- Insertar Rubros
insert into rubros (nombre, descripcion, problema_comun, oportunidad, tipo_cliente, mensaje_sugerido)
values 
('Restaurantes', 'Gastronomía local, parrillas y restós', 'Poca recurrencia de clientes en días de semana', 'Sistema de fidelización por WhatsApp', 'Dueños de locales gastronómicos', 'Hola! Vi que tienen una parrilla increíble. ¿Están haciendo algo para que los clientes vuelvan más seguido?'),
('Clínicas', 'Centros médicos y consultorios privados', 'Mucho ausentismo en turnos agendados', 'Automatización de recordatorios de turnos', 'Directores médicos o administradores', 'Hola, un gusto. Notamos que muchas clínicas pierden plata por turnos cancelados. ¿Les interesaría automatizar los recordatorios?'),
('Inmobiliarias', 'Venta y alquiler de propiedades', 'Demora en responder consultas de portales', 'Respuesta inmediata automatizada', 'Dueños de inmobiliarias', 'Hola! Vi que tienen propiedades muy buenas. ¿Cómo están manejando las consultas que les llegan fuera de hora?'),
('Concesionarias', 'Venta de autos usados y 0km', 'Lead tracking deficiente', 'Seguimiento por etapas del embudo', 'Gerentes de ventas', 'Buenas! ¿Cómo va? Vi sus publicaciones en Marketplace. ¿Tienen un sistema para no perderle el rastro a los interesados?'),
('Estudios Jurídicos', 'Abogados y consultoría legal', 'Dificultad para filtrar consultas irrelevantes', 'Chatbot de calificación previa', 'Abogados socios', 'Hola doctor/a. Sabemos que su tiempo vale oro. ¿Les serviría filtrar los casos antes de agendar la primera reunión?'),
('Mármoles', 'Marmolerías y mesadas', 'Presupuestos que se enfrían rápido', 'Retargeting de presupuestos enviados', 'Dueños de marmolerías', 'Hola! Vi sus trabajos en granito, muy buenos. ¿Tienen alguna estrategia para cerrar los presupuestos que quedan colgados?'),
('Corralones', 'Materiales de construcción', 'Competencia por precio en productos genéricos', 'Venta consultiva de paquetes de obra', 'Dueños de corralones', 'Buenas! ¿Cómo están? Notamos que el rubro construcción está movido. ¿Están haciendo seguimiento a los arquitectos de la zona?'),
('Locales de Celulares', 'Venta de accesorios y equipos', 'Stock inmovilizado de modelos anteriores', 'Promociones segmentadas a clientes actuales', 'Dueños de locales', 'Hola! Vi que tienen el nuevo iPhone. ¿Están avisándole a sus clientes actuales cuando entran novedades?'),
('Estéticas', 'Centros de belleza y spa', 'Agendas vacías en horarios marginales', 'Ofertas relámpago por WhatsApp', 'Dueñas de centros de estética', 'Hola! ¿Cómo va? Notamos que tienen un centro de estética muy lindo. ¿Cómo hacen para llenar los baches en la agenda?'),
('Indumentaria', 'Locales de ropa y showrooms', 'Baja conversión de consultas por Instagram', 'Catálogo interactivo por WhatsApp', 'Dueños de marcas de ropa', 'Hola! Me encantó la nueva colección. ¿Cómo están manejando el cierre de ventas cuando les preguntan precio por privado?');

-- Plantillas de ejemplo (user_id puede ser null para plantillas globales o asignarse luego)
insert into plantillas (tipo, titulo, contenido)
values
('initial', 'Contacto Frío - General', 'Hola {{nombre}}! Vi lo que hacen en {{negocio}} y me pareció excelente. Me gustaría comentarte una idea para potenciar sus ventas. ¿Te parece si charlamos brevemente?'),
('followup', 'Seguimiento 48hs', 'Hola {{nombre}}, ¿pudiste ver lo que te envié el otro día? Me gustaría saber qué te pareció. Un abrazo!'),
('reenganche', 'Revivir prospecto', 'Hola {{nombre}}, hace un tiempo hablamos pero quedó ahí. Justo lanzamos algo que le viene de diez a los negocios del rubro {{rubro}}. ¿Querés que te pase info?'),
('closing', 'Cierre de propuesta', 'Hola {{nombre}}! Ya tengo todo listo para arrancar con {{negocio}}. ¿Querés que coordinemos una llamada para pulir los últimos detalles y empezar?');
