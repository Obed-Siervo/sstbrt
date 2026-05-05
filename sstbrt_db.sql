Create Database sstbrt_db;
Use sstbrt_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

UPDATE users
SET role = 'admin'
WHERE email = 'adminsstbrt@gmail.com';

select *from users;

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from courses;
CREATE TABLE levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  level_number INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  type ENUM('video','pdf') NOT NULL,
  content_url TEXT NOT NULL,
  order_number INT NOT NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  UNIQUE(user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_exams_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE CASCADE
);

CREATE TABLE questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('a','b','c','d') NOT NULL,

  CONSTRAINT fk_questions_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id)
    ON DELETE CASCADE
);

CREATE TABLE results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exam_id INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_results_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_results_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id)
    ON DELETE CASCADE
);

CREATE TABLE activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
SELECT * FROM activity_log;

SHOW CREATE TABLE exams;
SHOW CREATE TABLE questions;
SHOW CREATE TABLE results;

select * from courses;
INSERT INTO exams (course_id, title) VALUES
(1, 'Examen Final de Secretaría y Servicio al Cliente'),
(2, 'Examen Final de Estilista en Belleza'),
(3, 'Examen Final de Cajero Bancario'),
(4, 'Examen Final de Uñas Acrílicas'),
(5, 'Examen Final de Auxiliar en Enfermería'),
(6, 'Examen Final de Barbero Profesional'),
(7, 'Examen Final de Auxiliar en Farmacia'),
(8, 'Examen Final de Informática Básica'),
(9, 'Examen Final de Estilismo en Cejas y Pestañas'),
(10, 'Examen Final de Facial y Maquillaje'),
(11, 'Examen Final de Inglés Básico'),
(12, 'Examen Final de Reparación y Mantenimiento de Celulares');

INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(1,'¿Cuál es la principal función de una secretaria?','Cocinar','Organizar y asistir','Vender productos','Reparar equipos','b'),
(1,'¿Qué demuestra profesionalismo?','Llegar tarde','Ser grosero','Puntualidad','Ignorar clientes','c'),
(1,'¿Cómo tratar a un cliente molesto?','Ignorarlo','Responder mal','Escuchar y calmar','Gritar','c'),
(1,'¿Qué hacer antes de transferir una llamada?','Colgar','Avisar','Ignorar','Reír','b'),
(1,'¿Qué es mala práctica?','Saludar','Ser amable','Interrumpir','Escuchar','c'),
(1,'¿Qué es atención al cliente?','Venta','Soporte','Ayuda al cliente','Publicidad','c'),
(1,'¿Qué actitud es correcta?','Negativa','Positiva','Agresiva','Pasiva','b'),
(1,'¿Qué es comunicación efectiva?','Gritar','Hablar claro','Ignorar','Mentir','b'),
(1,'¿Qué hacer con información confidencial?','Compartir','Proteger','Publicar','Olvidar','b'),
(1,'¿Qué es ética laboral?','Hacer trampa','Valores','Mentir','Faltar','b'),
(1,'¿Qué herramienta usa secretaria?','Agenda','Martillo','Sierra','Taladro','a'),
(1,'¿Cómo contestar el teléfono?','Mal','Educado','Gritando','Rápido','b'),
(1,'¿Qué es puntualidad?','Llegar tarde','A tiempo','Antes','Nunca','b'),
(1,'¿Qué es mala atención?','Ayudar','Ignorar','Resolver','Escuchar','b'),
(1,'Caso: cliente enojado ¿qué haces?','Pelear','Escuchar','Ignorar','Reír','b');


INSERT INTO questions  (exam_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(2,'¿Qué hace un estilista?','Cortar cabello','Cocinar','Pintar casas','Reparar','a'),
(2,'¿Qué herramienta es básica?','Tijeras','Martillo','Sierra','Taladro','a'),
(2,'¿Qué es higiene?','Suciedad','Limpieza','Desorden','Caos','b'),
(2,'¿Qué usar para teñir?','Agua','Tinte','Aceite','Sal','b'),
(2,'¿Qué es peinado?','Corte','Estilo cabello','Lavado','Secado','b'),
(2,'¿Qué hacer antes de cortar?','Preguntar','Cortar','Ignorar','Salir','a'),
(2,'¿Qué es cuidado capilar?','Limpieza cabello','Comida','Ropa','Zapatos','a'),
(2,'¿Qué producto usar?','Champú','Gasolina','Aceite','Sal','a'),
(2,'¿Qué es secado?','Mojar','Quitar agua','Cortar','Peinar','b'),
(2,'¿Qué es estilo?','Moda','Corte','Color','Todo','d'),
(2,'¿Qué evitar?','Suciedad','Orden','Higiene','Cuidado','a'),
(2,'¿Qué es cliente?','Persona','Objeto','Lugar','Animal','a'),
(2,'¿Qué hacer con cliente?','Ignorar','Atender','Gritar','Salir','b'),
(2,'¿Qué es profesionalismo?','Mal trato','Buen trato','Ignorar','Gritar','b'),
(2,'Caso: cliente quiere cambio ¿qué haces?','Negar','Escuchar','Ignorar','Reír','b');


INSERT INTO questions  (exam_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(3,'¿Qué hace un cajero?','Cobra','Construye','Cocina','Repara','a'),
(3,'¿Qué es dinero?','Valor','Comida','Ropa','Nada','a'),
(3,'¿Qué es depósito?','Retiro','Guardar dinero','Perder','Gastar','b'),
(3,'¿Qué es retiro?','Guardar','Sacar dinero','Perder','Ganar','b'),
(3,'¿Qué es cuenta bancaria?','Caja','Lugar dinero','Bolsa','Nada','b'),
(3,'¿Qué es cliente?','Persona','Objeto','Lugar','Animal','a'),
(3,'¿Qué es seguridad?','Riesgo','Protección','Peligro','Caos','b'),
(3,'¿Qué es fraude?','Legal','Engaño','Pago','Compra','b'),
(3,'¿Qué hacer con dinero falso?','Aceptar','Reportar','Guardar','Usar','b'),
(3,'¿Qué es saldo?','Cantidad dinero','Nada','Todo','Cero','a'),
(3,'¿Qué es transacción?','Movimiento dinero','Nada','Compra','Venta','a'),
(3,'¿Qué es banco?','Empresa','Escuela','Casa','Hospital','a'),
(3,'¿Qué es ahorro?','Gastar','Guardar','Perder','Nada','b'),
(3,'¿Qué es atención?','Ignorar','Ayudar','Gritar','Salir','b'),
(3,'Caso: cliente molesto ¿qué haces?','Pelear','Ayudar','Ignorar','Reír','b');


INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(4,'¿Qué son las uñas acrílicas?','Extensión uñas','Comida','Ropa','Zapatos','a'),
(4,'¿Qué material se usa?','Acrílico','Agua','Sal','Aceite','a'),
(4,'¿Qué es higiene?','Suciedad','Limpieza','Caos','Desorden','b'),
(4,'¿Qué hacer antes de aplicar?','Limpiar uñas','Ignorar','Cortar','Salir','a'),
(4,'¿Qué herramienta usar?','Lima','Martillo','Taladro','Sierra','a'),
(4,'¿Qué es limado?','Pulir','Cortar','Pegar','Romper','a'),
(4,'¿Qué es esmalte?','Color uñas','Agua','Sal','Aceite','a'),
(4,'¿Qué evitar?','Suciedad','Orden','Higiene','Cuidado','a'),
(4,'¿Qué es cliente?','Persona','Objeto','Lugar','Animal','a'),
(4,'¿Qué es diseño?','Decoración','Corte','Pegado','Nada','a'),
(4,'¿Qué es secado?','Quitar agua','Mojar','Cortar','Romper','a'),
(4,'¿Qué es cuidado?','Mantener','Romper','Ignorar','Tirar','a'),
(4,'¿Qué es profesionalismo?','Mal trato','Buen trato','Ignorar','Gritar','b'),
(4,'¿Qué es mantenimiento?','Cuidar uñas','Romper','Ignorar','Nada','a'),
(4,'Caso: uña dañada ¿qué haces?','Ignorar','Reparar','Romper','Reír','b');


INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(5,'¿Qué hace un auxiliar?','Ayuda médica','Construye','Cocina','Repara','a'),
(5,'¿Qué es paciente?','Persona enferma','Objeto','Lugar','Animal','a'),
(5,'¿Qué es higiene?','Suciedad','Limpieza','Caos','Desorden','b'),
(5,'¿Qué es temperatura?','Medida calor','Comida','Ropa','Nada','a'),
(5,'¿Qué es presión?','Fuerza sangre','Nada','Todo','Cero','a'),
(5,'¿Qué es pulso?','Latido','Nada','Todo','Cero','a'),
(5,'¿Qué es hospital?','Centro salud','Casa','Escuela','Banco','a'),
(5,'¿Qué es medicamento?','Tratamiento','Comida','Agua','Nada','a'),
(5,'¿Qué hacer con paciente?','Ignorar','Atender','Gritar','Salir','b'),
(5,'¿Qué es emergencia?','Urgente','Nada','Todo','Cero','a'),
(5,'¿Qué es cuidado?','Atención','Ignorar','Romper','Nada','a'),
(5,'¿Qué es ética?','Valores','Mentir','Ignorar','Faltar','a'),
(5,'¿Qué es salud?','Bienestar','Nada','Todo','Cero','a'),
(5,'¿Qué es enfermería?','Atención médica','Construcción','Cocina','Reparación','a'),
(5,'Caso: paciente mal ¿qué haces?','Ignorar','Ayudar','Reír','Salir','b');


INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(6,'¿Qué hace un barbero?','Cortar cabello','Cocinar','Pintar','Reparar','a'),
(6,'¿Qué herramienta usar?','Máquina','Martillo','Taladro','Sierra','a'),
(6,'¿Qué es higiene?','Suciedad','Limpieza','Caos','Desorden','b'),
(6,'¿Qué es corte?','Estilo cabello','Comida','Ropa','Nada','a'),
(6,'¿Qué es barba?','Vello facial','Nada','Todo','Cero','a'),
(6,'¿Qué es cliente?','Persona','Objeto','Lugar','Animal','a'),
(6,'¿Qué hacer antes?','Preguntar','Cortar','Ignorar','Salir','a'),
(6,'¿Qué es estilo?','Diseño','Nada','Todo','Cero','a'),
(6,'¿Qué es cuidado?','Mantener','Romper','Ignorar','Nada','a'),
(6,'¿Qué es profesionalismo?','Mal trato','Buen trato','Ignorar','Gritar','b'),
(6,'¿Qué es afeitado?','Quitar barba','Nada','Todo','Cero','a'),
(6,'¿Qué evitar?','Suciedad','Orden','Higiene','Cuidado','a'),
(6,'¿Qué es cliente satisfecho?','Feliz','Molesto','Triste','Nada','a'),
(6,'¿Qué es herramienta?','Objeto trabajo','Nada','Todo','Cero','a'),
(6,'Caso: cliente indeciso ¿qué haces?','Ignorar','Asesorar','Reír','Salir','b');

INSERT INTO questions 
(exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
(7,'¿Qué hace un auxiliar de farmacia?','Dispensa medicamentos','Construye casas','Cocina','Repara autos','a'),
(7,'¿Qué es un medicamento?','Sustancia para tratar','Comida','Ropa','Herramienta','a'),
(7,'¿Qué es receta médica?','Orden del doctor','Factura','Ticket','Contrato','a'),
(7,'¿Qué significa dosis?','Cantidad indicada','Color','Precio','Marca','a'),
(7,'¿Qué es farmacia?','Lugar de medicamentos','Escuela','Banco','Hospital','a'),
(7,'¿Qué es higiene?','Limpieza','Suciedad','Desorden','Caos','a'),
(7,'¿Qué hacer con medicamentos vencidos?','Desechar correctamente','Vender','Usar','Guardar','a'),
(7,'¿Qué es cliente?','Persona','Objeto','Animal','Lugar','a'),
(7,'¿Qué es almacenamiento?','Guardar correctamente','Romper','Botar','Ignorar','a'),
(7,'¿Qué es inventario?','Control productos','Eliminar datos','Vender','Nada','a'),
(7,'¿Qué es farmacia clínica?','Uso correcto medicamentos','Cocina','Ventas','Nada','a'),
(7,'¿Qué es temperatura controlada?','Cuidado ambiente','Nada','Todo','Cero','a'),
(7,'¿Qué es atención al cliente?','Buen trato','Ignorar','Gritar','Mal servicio','a'),
(7,'¿Qué es seguridad?','Evitar riesgos','Provocar daño','Ignorar','Nada','a'),
(7,'Caso: cliente sin receta ¿qué haces?','Vender igual','No vender','Ignorar','Gritar','b');

INSERT INTO questions 
(exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
(8,'¿Qué es una computadora?','Máquina procesar datos','Teléfono','TV','Radio','a'),
(8,'¿Qué es CPU?','Procesador','Pantalla','Teclado','Mouse','a'),
(8,'¿Qué es monitor?','Pantalla','CPU','Mouse','Teclado','a'),
(8,'¿Qué es teclado?','Entrada datos','Salida datos','Procesador','Nada','a'),
(8,'¿Qué es mouse?','Dispositivo control','Pantalla','CPU','Teclado','a'),
(8,'¿Qué es software?','Programas','Hardware','Pantalla','Nada','a'),
(8,'¿Qué es hardware?','Partes físicas','Programas','Datos','Nada','a'),
(8,'¿Qué es internet?','Red global','PC','Cable','Router','a'),
(8,'¿Qué es archivo?','Documento','Programa','Pantalla','Nada','a'),
(8,'¿Qué es carpeta?','Organizar archivos','Eliminar','Copiar','Nada','a'),
(8,'¿Qué hace copiar?','Duplicar','Eliminar','Mover','Nada','a'),
(8,'¿Qué hace pegar?','Colocar copia','Eliminar','Mover','Nada','a'),
(8,'¿Qué es navegador?','Explorar web','CPU','Archivo','Nada','a'),
(8,'¿Qué es correo electrónico?','Mensaje digital','Llamada','Carta','Nada','a'),
(8,'Caso: PC lenta ¿qué haces?','Optimizar','Romper','Apagar','Ignorar','a');

INSERT INTO questions 
(exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
(9,'¿Qué son extensiones?','Aplicación estética','Comida','Ropa','Zapatos','a'),
(9,'¿Qué se aplica?','Pestañas','Cabello','Uñas','Piel','a'),
(9,'¿Qué es higiene?','Limpieza','Suciedad','Caos','Nada','a'),
(9,'¿Qué usar?','Pegamento especial','Agua','Aceite','Sal','a'),
(9,'¿Qué es cliente?','Persona','Objeto','Lugar','Animal','a'),
(9,'¿Qué es diseño?','Estilo','Nada','Todo','Cero','a'),
(9,'¿Qué evitar?','Suciedad','Orden','Higiene','Nada','a'),
(9,'¿Qué es cuidado?','Mantener','Romper','Ignorar','Nada','a'),
(9,'¿Qué es técnica?','Método','Nada','Todo','Cero','a'),
(9,'¿Qué es seguridad?','Evitar daño','Provocar daño','Nada','Todo','a'),
(9,'¿Qué es profesionalismo?','Buen trato','Mal trato','Ignorar','Nada','a'),
(9,'¿Qué es limpieza previa?','Preparar zona','Ignorar','Romper','Nada','a'),
(9,'¿Qué es retoque?','Mantenimiento','Eliminar','Ignorar','Nada','a'),
(9,'¿Qué es cliente satisfecho?','Feliz','Molesto','Triste','Nada','a'),
(9,'Caso: cliente incómodo ¿qué haces?','Ignorar','Ajustar','Reír','Salir','b');


INSERT INTO questions 
(exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
(10,'¿Qué es maquillaje?','Aplicar productos rostro','Comer','Dormir','Ejercicio','a'),
(10,'¿Qué es limpieza facial?','Eliminar impurezas','Ensuciar','Romper','Nada','a'),
(10,'¿Qué es base?','Producto piel','Cabello','Uñas','Ropa','a'),
(10,'¿Qué es corrector?','Cubrir imperfecciones','Pintar uñas','Cortar cabello','Nada','a'),
(10,'¿Qué es polvo?','Sellar maquillaje','Limpiar','Cortar','Nada','a'),
(10,'¿Qué es brocha?','Herramienta aplicar','Comida','Ropa','Nada','a'),
(10,'¿Qué es piel grasa?','Exceso aceite','Seca','Normal','Nada','a'),
(10,'¿Qué es piel seca?','Falta hidratación','Aceite','Normal','Nada','a'),
(10,'¿Qué es hidratación?','Cuidar piel','Romper','Ignorar','Nada','a'),
(10,'¿Qué es cliente?','Persona','Objeto','Animal','Lugar','a'),
(10,'¿Qué es higiene?','Limpieza','Suciedad','Caos','Nada','a'),
(10,'¿Qué es técnica?','Método','Nada','Todo','Cero','a'),
(10,'¿Qué es profesionalismo?','Buen trato','Mal trato','Ignorar','Nada','a'),
(10,'¿Qué es desmaquillar?','Quitar maquillaje','Aplicar','Romper','Nada','a'),
(10,'Caso: piel sensible ¿qué haces?','Ignorar','Usar productos suaves','Reír','Salir','b');


INSERT INTO questions 
(exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
(11,'¿Qué significa Hello?','Hola','Adiós','Gracias','Nada','a'),
(11,'¿Qué significa Goodbye?','Adiós','Hola','Gracias','Nada','a'),
(11,'¿Qué significa Please?','Por favor','Gracias','Hola','Nada','a'),
(11,'¿Qué significa Thank you?','Gracias','Hola','Adiós','Nada','a'),
(11,'¿Qué significa Yes?','Sí','No','Hola','Nada','a'),
(11,'¿Qué significa No?','No','Sí','Hola','Nada','a'),
(11,'¿Qué significa House?','Casa','Perro','Carro','Nada','a'),
(11,'¿Qué significa Dog?','Perro','Gato','Casa','Nada','a'),
(11,'¿Qué significa Cat?','Gato','Perro','Casa','Nada','a'),
(11,'¿Qué significa Water?','Agua','Comida','Casa','Nada','a'),
(11,'¿Qué significa Food?','Comida','Agua','Casa','Nada','a'),
(11,'¿Qué significa Book?','Libro','Mesa','Silla','Nada','a'),
(11,'¿Qué significa School?','Escuela','Casa','Trabajo','Nada','a'),
(11,'¿Qué significa Teacher?','Profesor','Alumno','Doctor','Nada','a'),
(11,'Caso: alguien dice Hello ¿respondes?','Goodbye','Hello','Nada','Salir','b');

INSERT INTO questions 
(exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
(12,'¿Qué es un móvil?','Teléfono','TV','Radio','PC','a'),
(12,'¿Qué es pantalla?','Display','Batería','Chip','Nada','a'),
(12,'¿Qué es batería?','Energía','Pantalla','Chip','Nada','a'),
(12,'¿Qué es hardware?','Parte física','Software','Datos','Nada','a'),
(12,'¿Qué es software?','Sistema','Pantalla','Batería','Nada','a'),
(12,'¿Qué es reparación?','Arreglar','Romper','Ignorar','Nada','a'),
(12,'¿Qué herramienta usar?','Destornillador','Martillo','Sierra','Nada','a'),
(12,'¿Qué es diagnóstico?','Detectar problema','Romper','Ignorar','Nada','a'),
(12,'¿Qué es cliente?','Persona','Objeto','Lugar','Animal','a'),
(12,'¿Qué es seguridad?','Evitar riesgos','Provocar daño','Nada','Todo','a'),
(12,'¿Qué es pantalla rota?','Daño display','Nada','Todo','Cero','a'),
(12,'¿Qué es cambio batería?','Reemplazo','Romper','Ignorar','Nada','a'),
(12,'¿Qué es técnico?','Especialista','Cliente','Objeto','Nada','a'),
(12,'¿Qué es mantenimiento?','Cuidado','Romper','Ignorar','Nada','a'),
(12,'Caso: móvil no enciende ¿qué haces?','Ignorar','Diagnosticar','Reír','Salir','b');



CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  certificate_code VARCHAR(100) UNIQUE NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
SELECT * FROM certificates;
SHOW TABLES;

INSERT INTO users (name, email, password)
VALUES ('Obed', 'test@test.com', '123456');

INSERT INTO courses (title, description)
VALUES ('Computo Basico', 'Curso inicial');

INSERT INTO levels (course_id, level_number)
VALUES (1, 1);

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES (1, 'Introduccion', 'video', 'https://youtube.com/test', 1);

INSERT INTO enrollments (user_id, course_id)
VALUES (1, 1);

INSERT INTO progress (user_id, lesson_id, completed)
VALUES (1, 1, TRUE);

INSERT INTO exams (level_id, title)
VALUES (1, 'Examen Nivel 1');


INSERT INTO questions (exam_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES (1, '¿Que es una computadora?', 'Maquina', 'Animal', 'Comida', 'Nada', 'A');

INSERT INTO results (user_id, exam_id, score, passed)
VALUES (1, 1, 8.5, TRUE);

INSERT INTO certificates (user_id, course_id, certificate_code)
VALUES (1, 1, 'SSTBRT-2026-0001');


SELECT u.name, c.title, cert.certificate_code
FROM certificates cert
JOIN users u ON cert.user_id = u.id
JOIN courses c ON cert.course_id = c.id;

ALTER TABLE users
ADD COLUMN role ENUM('admin','user') DEFAULT 'user';

UPDATE users 
SET role = 'admin' 
WHERE email = 'test@test.com';


INSERT INTO courses (title, description) VALUES
('Secretaria y Servicio al Cliente', 'Formación en atención al cliente y gestión administrativa'),
('Estilista en Belleza', 'Técnicas de estilismo y cuidado personal'),
('Cajero Bancario', 'Operaciones bancarias y atención financiera'),
('Uñas Acrílicas', 'Aplicación y diseño de uñas acrílicas'),
('Auxiliar en Enfermería', 'Fundamentos del cuidado de pacientes'),
('Barbería Profesional', 'Técnicas modernas de barbería'),
('Auxiliar en Farmacia', 'Gestión de medicamentos y atención al cliente'),
('Informática Básica', 'Uso básico de computadoras'),
('Estilismo en Cejas y Pestañas', 'Diseño y cuidado estético'),
('Facial y Maquillaje', 'Cuidado facial y técnicas de maquillaje'),
('Ingles Básico', 'Fundamentos del idioma inglés'),
('Reparación y Mantenimiento de Celulares', 'Diagnóstico y reparación de móviles');

ALTER TABLE courses ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE levels ADD COLUMN title VARCHAR(100);

SELECT * FROM users;
SELECT * FROM courses;
SELECT name, email, role FROM users;

DELETE FROM courses WHERE title = 'Computo Basico';
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
SELECT email, role FROM users;

SET SQL_SAFE_UPDATES = 0;

DELETE FROM progress;
DELETE FROM results;
DELETE FROM questions;
DELETE FROM exams;
DELETE FROM lessons;
DELETE FROM levels;
DELETE FROM enrollments;
DELETE FROM certificates;
DELETE FROM courses;
SET SQL_SAFE_UPDATES = 1;

DELETE FROM courses;
ALTER TABLE courses AUTO_INCREMENT = 1;

SELECT id, course_id, title FROM levels;
DELETE FROM levels;
ALTER TABLE levels AUTO_INCREMENT = 1;

ALTER TABLE lessons
ADD UNIQUE (level_id, order_number);

SELECT id, level_id, title FROM lessons;

SELECT * FROM levels;
SELECT * FROM lessons;
SELECT * FROM exams;
SELECT * FROM questions;
SELECT * FROM certificates;
SELECT * FROM courses;


# Si a partir de aqui hay algo, esto es nuevo para otra pc menos la de CEPVA.


INSERT INTO enrollments (user_id, course_id)
VALUES (4, 1);
ALTER TABLE courses ADD COLUMN image VARCHAR(255) NULL;

UPDATE courses SET image = 'secretaria.jpg' WHERE title = 'Secretaria y Servicio al Cliente';
UPDATE courses SET image = 'estilista.jpg' WHERE title = 'Estilista en Belleza';
UPDATE courses SET image = 'cajero.jpg' WHERE title = 'Cajero Bancario';
UPDATE courses SET image = 'unas.jpg' WHERE title = 'Uñas Acrílicas';
UPDATE courses SET image = 'enfermeria.jpg' WHERE title = 'Auxiliar en Enfermería';
UPDATE courses SET image = 'barberia.jpg' WHERE title = 'Barbería Profesional';
UPDATE courses SET image = 'farmacia.jpg' WHERE title = 'Auxiliar en Farmacia';
UPDATE courses SET image = 'informatica.jpg' WHERE title = 'Informática Básica';
UPDATE courses SET image = 'cejas.jpg' WHERE title = 'Estilismo en Cejas y Pestañas';
UPDATE courses SET image = 'facial.jpg' WHERE title = 'Facial y Maquillaje';
UPDATE courses SET image = 'ingles.jpg' WHERE title = 'Ingles Básico';
UPDATE courses SET image = 'celulares.jpg' WHERE title = 'Reparación y Mantenimiento de Celulares';

SELECT * FROM courses;

# a partir de aqui es nuevo para todas las pc menos la de mami :)

#done
INSERT INTO levels (course_id, level_number, title) VALUES
(1, 1, 'Fundamentos del Rol'),
(1, 2, 'Comunicación Profesional'),
(1, 3, 'Atención al Cliente'),
(1, 4, 'Gestión Administrativa');

INSERT INTO levels (course_id, level_number, title)
VALUES (1, 5, 'Etica Profesional y Confidecialidad');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 1
-- ============================================
(1, 'Introducción al Rol de Secretaría', 'video', 'https://youtu.be/egqcVcjeL38?si=DmwHpqYq54DHIZ4s', 1),
(1, 'Funciones Clave de una Secretaria Bancaria', 'pdf', '/docs/secretaria-funciones.pdf', 2),
(1, 'Presentación Profesional y Comunicación', 'pdf', '/docs/presentacion-profesional.pdf', 3),

-- ============================================
-- NIVEL 2
-- ============================================
(2, 'Atención al Cliente en Entorno Bancario', 'video', 'https://youtu.be/It8ewYUbVAo?si=9-ewZTprHswcFHdK', 1),
(2, 'Protocolo de Servicio al Cliente', 'video', 'https://youtu.be/M0WqQBa3sRI?si=PX-j05t-yj9CQm2Q', 2),
(2, 'Manejo de Clientes y Objeciones', 'pdf', '/docs/manejo-clientes.pdf', 3),

-- ============================================
-- NIVEL 3
-- ============================================
(3, 'Gestión de Agenda y Organización', 'pdf', '/docs/agenda.pdf', 1),
(3, 'Control de Citas y Reuniones', 'video', 'https://www.youtube.com/live/i6vjNKR8cn8?si=wkc5gKoDUhn-Q5kx', 2),
(3, 'Organización Administrativa Eficiente', 'video', 'https://youtu.be/6MdyL_0qK0Y?si=5e-C-vvMfFt3NaOc', 3),

-- ============================================
-- NIVEL 4
-- ============================================
(4, 'Documentación y Archivo Bancario', 'pdf', '/docs/documentacion.pdf', 1),
(4, 'Gestión Documental y Archivo', 'video', 'https://youtu.be/urhSDBpzw6Y?si=Ch5UpHKAc92M8ROJ', 2),
(4, 'Buenas Prácticas en Manejo de Información', 'video', 'https://youtu.be/v1qiK65r9j4?si=uuGfYWYfGaacN8S1', 3),

-- ============================================
-- NIVEL 5
-- ============================================
(5, 'Ética Profesional y Confidencialidad', 'video', 'https://youtu.be/wTC6pXVciRY?si=PiCUaLOgE9ctr-os', 1),
(5, 'Confidencialidad en el Sector Bancario', 'pdf', '/docs/confidencialidad-bancaria.pdf', 2),
(5, 'Buenas Prácticas Éticas en Atención y Gestión', 'video', 'https://youtu.be/EkfiWMLBVjU?si=EyZBju7KEx54BlUq', 3);
#done


#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(2, 1, 'Fundamentos de la Peluquería'),
(2, 2, 'Colorimetría y Tintura'),
(2, 3, 'Técnicas de Corte y Estilo'),
(2, 4, 'Tratamientos Capilares y Ética');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 6: Fundamentos de la Peluquería
-- ============================================
(6, 'Herramientas y Seguridad e Higiene', 'video', 'https://youtu.be/r0b8PMsvW6M?si=e0vnYBk0_atRHSyZ', 1),
(6, 'Anatomía del Cabello y Cuero Cabelludo', 'video', 'https://youtu.be/YwTq6OJGU7o?si=7in4nAdMzXOw6fyg', 2),
(6, 'Técnicas de Lavado', 'video', 'https://youtu.be/2ho1OJEYiHc?si=dfLSU65QHKQ8Gso8', 3),
(6, 'Masaje Capilar', 'video', 'https://youtu.be/cl0BZGv3tOE?si=mhs1B0c7DOf-kLse', 4),

-- ============================================
-- NIVEL 7: Colorimetría y Tintura
-- ============================================
(7, 'Teoría del Color y Círculo Cromático', 'pdf', '/docs/teoriadelcolor.pdf', 1),
(7, 'Mezcla y Aplicación de Tintes', 'video', 'https://youtu.be/HwKrY1e8SPc?si=7XG1GvwutqAj16Tm', 2),
(7, 'Guía de Tiempos de Exposición y Oxidantes', 'pdf', '/docs/guia-color.pdf', 3),

-- ============================================
-- NIVEL 8: Técnicas de Corte y Estilo
-- ============================================
(8, 'Fundamentos Básico de Corte', 'video', 'https://youtu.be/GYGnnzTI24g?si=SxDj2n-aHRXegqSM', 1),
(8, '¿Cómo hacer Brushing?', 'video', 'https://youtu.be/v0FY86rGVmw?si=g_56Hpoy7ueVNL10', 2),
(8, 'Manual de Estilismo según el Rostro', 'pdf', '/docs/visagismo.pdf', 3),

-- ============================================
-- NIVEL 9: Tratamientos Capilares y Ética
-- ============================================
(9, 'Tratamientos Capilares', 'video', 'https://youtu.be/ctzdqjao6Io?si=8mfxKVigyXMIu6OT', 1),
(9, 'Ética Profesional y Atención en el Salón', 'video', 'https://youtu.be/XFLIGKqa6Kk?si=5m82w6ibecue2lL6', 2),
(9, 'Tendencias Modernas y Finalización', 'pdf', '/docs/tendenciasmodernas.pdf', 3);
#DONE


#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(3, 1, 'Fundamentos y Ética del Cajero'),
(3, 2, 'Manejo de Efectivo y Títulos Valores'),
(3, 3, 'Operaciones y Transacciones'),
(3, 4, 'Seguridad y Prevención de Fraudes'),
(3, 5, 'Calidad de Servicio en Ventanilla');


INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 10: Fundamentos y Ética
-- ============================================
(10, 'Rol y Responsabilidades del Cajero', 'video', 'https://youtu.be/m26mbB7c1a4?si=c4R-DP0Q51Apq8Yx', 1),
(10, 'Ética Profesional y Secreto Bancario', 'video', 'https://youtu.be/D0C3Y1LZUiA?si=LwU6j6chyWVwDRpI', 2),
(10, 'Organización del Puesto de Trabajo', 'pdf', '/docs/organizacion.pdf', 3),

-- ============================================
-- NIVEL 11: Manejo de Efectivo
-- ============================================
(11, 'Identificación de Billetes y Monedas', 'video', 'https://youtu.be/_bJcgaZG3UY?si=_c1J8miIq8Sioy7x', 1),
(11, 'Gestión de Títulos Valores y Cheques', 'pdf', '/docs/titulos-valores.pdf', 2),
(11, 'Uso de Contadoras de Billetes', 'video', 'https://youtu.be/n1SOd6tYgtI?si=Lyy-s3bh-GVu8M0i', 3),

-- ============================================
-- NIVEL 12: Operaciones y Transacciones
-- ============================================
(12, 'Depósitos sin tarjeta', 'video', 'https://youtu.be/mCMyjN7JNkA?si=kwWTfVwFR2c0phgb', 1),
(12, 'Procedimientos de Arqueo de Caja', 'video', 'https://youtu.be/Gg461lIwdQg?si=c8GOQ76amCqvehpE', 2),
(12, 'Apertura y Cierre de Caja', 'video', 'https://youtu.be/MTxBA-UNi2E?si=ZaqYQY-SQgZgKJCT', 3),

-- ============================================
-- NIVEL 13: Seguridad y Prevención
-- ============================================
(13, 'Prevención de Lavado de Activos', 'pdf', '/docs/lavadoactivos.pdf', 1),
(13, 'Protocolo ante Asaltos o Siniestros', 'pdf', '/docs/protocoloasalto.pdf', 2),
(13, 'Detección de Documentación Falsa', 'video', 'https://youtu.be/cfJRQQ2RcCI?si=E5yQJKYu-jGzvxow', 3),

-- ============================================
-- NIVEL 14: Calidad de Servicio
-- ============================================
(14, 'Trabajo Bajo Presión', 'video', 'https://youtu.be/tlji4KmVgtY?si=xr7I3BiUGOhg3ou3', 1),
(14, 'Manejo de Filas y Tiempos de Espera', 'pdf', '/docs/manejodefilas.pdf', 2),
(14, 'Cierre de Jornada y Reportes Finales', 'pdf', '/docs/cierrejornada.pdf', 3);
#DONE


#DONE
select * from lessons;
INSERT INTO levels (course_id, level_number, title) VALUES
(4, 1, 'Introducción y Preparación de la Uña'),
(4, 2, 'Manejo del Producto y Perleo'),
(4, 3, 'Técnicas de Esculpido y Tips'),
(4, 4, 'Limado Técnico y Estructura'),
(4, 5, 'Decoración y Mantenimiento');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 20: Introducción y Preparación
-- ============================================
(20, 'Anatomía de la Uña', 'video', 'https://youtu.be/X2zMhh3DxME?si=3uKc0WNL5R7DSNDr', 1),
(20, 'Herramientas: Manicure y Pedicure', 'video', 'https://youtu.be/iA60qBfc7EQ?si=v_4KGQRa3cn-Z36y', 2),
(20, 'Preparación de la Placa Ungueal', 'video', 'https://youtu.be/RG-motT1-LI?si=mLJuaNRDmgIZpl2w', 3),

-- ============================================
-- NIVEL 21: Manejo del Producto
-- ============================================
(21, 'Control del Monómero y Polímero', 'pdf', '/docs/monomeropolimero.pdf', 1),
(21, 'Técnica de la Perla Perfecta', 'video', 'https://youtu.be/T3KVZ5QUusg?si=Lf13wOtMqQf2MYr7', 2),
(21, 'Química de los Productos en la Manicura', 'video', 'https://youtu.be/Z0stE7OpmBg?si=iEaQFIPbKYXOTkEb', 3),

-- ============================================
-- NIVEL 22: Esculpido y Tips
-- ============================================
(22, 'Aplicación de Tips y Corte', 'video', 'https://youtu.be/Z3XbA6Vu2c4?si=c-588ClrByvFeVR0', 1),
(22, 'Colocación de Moldes para Esculpido', 'video', 'https://youtu.be/L50WuPESDVo?si=rfoppAvfuicCtHjF', 2),
(22, 'Estructura Square y Coffin, Classic Almond', 'video', 'https://youtu.be/YseRChVoKag?si=Zsh2wzIA_-CNsYPk', 3),

-- ============================================
-- NIVEL 23: Limado Técnico
-- ============================================
(23, 'Forma Correcta del Limado', 'video', 'https://youtu.be/ivEjPUVX18E?si=Oo2ZUZzV1xG6_t5-', 1),
(23, 'Sellado de Cutícula (Detallado)', 'video', 'https://youtu.be/47Dpzj0LWKw?si=3qicT8hie8nNOMci', 2),
(23, 'Arquitectura: Ápice y Balance', 'pdf', '/docs/arquitecturaunas.pdf', 3),

-- ============================================
-- NIVEL 24: Decoración y Retiro
-- ============================================
(24, 'Técnica de Baby Boomer con Glitters', 'video', 'https://youtu.be/huz2WauT8g0?si=i6u61BO8D-ffeGTS', 1),
(24, 'Retiro Seguro de Uñas', 'video', 'https://youtu.be/tdXZN079hpE?si=NIswYpQ3T2vCDOFA', 2),
(24, 'Costos y Atención al Cliente', 'pdf', '/docs/negociounas.pdf', 3);
#DONE



select * from levels;

#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(5, 1, 'Fundamentos y Ética de la Enfermería'),
(5, 2, 'Signos Vitales y Primeros Auxilios'),
(5, 3, 'Higiene y Cuidado del Paciente'),
(5, 4, 'Administración de Medicamentos'),
(5, 5, 'Enfermería Quirúrgica y Urgencias');


INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 25: Fundamentos y Ética
-- ============================================
(25, 'Historia y Rol del Auxiliar de Enfermería', 'pdf', '/docs/auxiliarenfermeria.pdf', 1),
(25, 'Ética, Bioética y Derechos del Paciente', 'pdf', '/docs/eticaenfermeria.pdf', 2),
(25, 'Terminología Médica Básica', 'video', 'https://youtu.be/KNm4dPIBFZ0?si=vzk7UqA5N4GvzVLW', 3),

-- ============================================
-- NIVEL 26: Signos Vitales y Primeros Auxilios
-- ============================================
(26, 'Técnicas de Medición de Signos Vitales', 'video', 'https://youtu.be/8NAU6Jl2Ib4?si=lMVILjaFs7sucvXS', 1),
(26, 'Protocolo de Reanimación Cardiopulmonar (RCP)', 'video', 'https://youtu.be/FEayzgNGGBQ?si=sIoDRxCa-VVV4I_C', 2),
(26, 'Manual de Primeros Auxilios en Accidentes', 'pdf', '/docs/primerosauxilios.pdf', 3),

-- ============================================
-- NIVEL 27: Higiene y Cuidado del Paciente
-- ============================================
(27, 'Tendido de Camas', 'video', 'https://youtu.be/uoEvPvZ624Q?si=k_UHpZsBrMykaSUI', 1),
(27, 'Mecánica Corporal', 'video', 'https://youtu.be/ZVImnK_zkoc?si=qD0msbWtTtLiAWH7', 2),
(27, 'Prevención de Úlceras por Presión', 'video', 'https://youtu.be/qcO5Qe9Ttdg?si=eLEHd7Lo2_GXaJT0', 3),

-- ============================================
-- NIVEL 28: Administración de Medicamentos
-- ============================================
(28, 'Los 10 Correctos en la Administración', 'video', 'https://youtu.be/I6uHzOcQhu0?si=Ex8pqXgsldO-ZIzv', 1),
(28, 'Vías de Administración: Oral, Intramuscular y SC', 'video', 'https://youtu.be/IS4Wgx2M5TA?si=5DuPnc6XrZeCKm7m', 2),
(28, 'Farmacología Básica para Auxiliares', 'video', 'https://youtu.be/Sws7oZ7P1LU?si=SOBHQ8AdGqn36KQV', 3),

-- ============================================
-- NIVEL 29: Enfermería Quirúrgica y Urgencias
-- ============================================
(29, 'Cuidados Pre y Post Operatorios', 'video', 'https://youtu.be/APaeadYjQ9c?si=ryTo6A-uq-tcZi27', 1),
(29, 'Manejo de Heridas', 'video', 'https://youtu.be/ad3MxT9vzn4?si=FRN8Ta3yxzCkE1se', 2),
(29, 'Bioseguridad y Manejo de Residuos Hospitalarios', 'pdf', '/docs/bioseguridad.pdf', 3);
#DONE



#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(6, 1, 'Herramientas y Fundamentos de Barbería'),
(6, 2, 'Técnicas de Corte Clásico y Moderno'),
(6, 3, 'Diseño de Barba y Afeitado Tradicional'),
(6, 4, 'Desvanecidos (Fades) y Texturizado'),
(6, 5, 'Gestión de la Barbería y Ética');

SELECT * FROM courses;

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 35: Herramientas y Fundamentos
-- ============================================
(35, 'Tipos y Medidas de Peinetas', 'video', 'https://youtu.be/SmBKPt_ZRQY?si=ouBk8ZWvgz_iQ4o1', 1),
(35, 'Higiene, Desinfección y Ergonomía', 'pdf', '/docs/bioseguridadbarbera.pdf', 2),
(35, 'Morfología del Rostro y Craneometría', 'video', 'https://youtu.be/BE06c_xAyjM?si=VoYlKHrnFqLpGNwm', 3),

-- ============================================
-- NIVEL 36: Corte Clásico y Moderno
-- ============================================
(36, 'Corte con Tijera: Técnica sobre Peine', 'video', 'https://youtu.be/NMP33-jHC9w?si=hS_32eD3uBkW6JQi', 1),
(36, 'Divisiones y Secciones del Cabello', 'video', 'https://youtu.be/HKF-5cYf7iY?si=4Lxwwp2bmA7MO2Rx', 2),
(36, 'Corte Escolar', 'video', 'https://youtu.be/m1k-jE0xBzg?si=xtHOtnfnna4r2znA', 3),

-- ============================================
-- NIVEL 37: Barba y Afeitado
-- ============================================
(37, 'Ritual de Toalla Caliente y Preparación', 'video', 'https://youtu.be/HFOO4IQ3LGY?si=sMKYDFOTj2bSjqFH', 1),
(37, 'Perfilado de Barba con Navaja (Shavette)', 'video', 'https://youtu.be/TlefhEsdJgo?si=pQbr0vxZpLWOVqXm', 2),
(37, 'Manual de Productos: Aftershaves y Aceites', 'pdf', '/docs/cuidadobarba.pdf', 3),

-- ============================================
-- NIVEL 38: Desvanecidos (Fades)
-- ============================================
(38, 'Técnica de Low, Mid y High Fade', 'video', 'https://youtu.be/X5V7gd9y3dg?si=LJQB_L3IOHCN0BQN', 1),
(38, 'Borrado de Líneas', 'video', 'https://youtu.be/pDaboxiK31I?si=n77tD6DvGlpFN1Qu', 2),
(38, 'Texturizado y Uso de Tijera de Entresacar', 'pdf', '/docs/texturizadocapilar.pdf', 3),

-- ============================================
-- NIVEL 39: Gestión y Ética
-- ============================================
(39, 'Fidelizar Clientes', 'video', 'https://youtu.be/TP8Q0y1aTSY?si=61zw0uA4sz6K46DF', 1),
(39, 'Ajuste de Cuchillas', 'video', 'https://youtu.be/_iSmingJQdI?si=CcRckxHIHnToZao7', 2),
(39, 'Costos, Precios y Ética en el Salón', 'pdf', '/docs/negociobarbero.pdf', 3);
#DONE



select * from levels;

#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(7, 1, 'Farmacología y Clasificación de Medicamentos'),
(7, 2, 'Gestión de Inventario y Almacenamiento'),
(7, 3, 'Dispensación y Receta Médica'),
(7, 4, 'Normativa, Ética y Seguridad');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 40: Farmacología y Clasificación
-- ============================================
(40, 'Conceptos de Fármaco, Droga y Medicamento', 'video', 'https://youtu.be/Yr2EZKl7dq8?si=Kgct0Ighq9-05j3Y', 1),
(40, 'Vías de Administración y Formas Farmacéuticas', 'video', 'https://youtu.be/mzkr99q1jZ0?si=rH5KBlCewT35mlQZ', 2),
(40, 'Clasificación por Acción Terapéutica', 'video', 'https://youtu.be/WtoP7KrrqBI?si=foov9rhxw1qHDiz_', 3),

-- ============================================
-- NIVEL 41: Gestión de Inventario
-- ============================================
(41, 'Recepción Técnica de Medicamentos', 'video', 'https://youtu.be/gF1XV1Q19YU?si=82KZ9xpwQ8DCi8AO', 1),
(41, 'Almacenamiento y Cadena de Frío', 'pdf', '/docs/almacenamientofarma.pdf', 2),
(41, 'Semaforización de Medicamentos', 'video', 'https://youtu.be/zOZ1yLlJBJ4?si=l2VV09WjXp-kmt1j', 3),

-- ============================================
-- NIVEL 42: Dispensación y Receta
-- ============================================
(42, 'Interpretación de la Receta Médica', 'video', 'https://youtu.be/X66H0-sdaKA?si=g1lZFHjTYub14Oh2', 1),
(42, 'Atención al Cliente y Dispensación Informada', 'pdf', '/docs/atencionfarma.pdf', 2),
(42, 'Manual de Buenas Prácticas de Dispensación', 'pdf', '/docs/manualdispensacion.pdf', 3),

-- ============================================
-- NIVEL 43: Normativa y Seguridad
-- ============================================
(43, 'Medicamentos Controlados', 'video', 'https://youtu.be/IJey5H51wzI?si=fuaqSx6Yv-fQ3OeQ', 1),
(43, 'Farmacovigilancia', 'video', 'https://youtu.be/nodS8woWusM?si=zMorvdsrA_M_0FzD', 2),
(43, 'Ética Profesional y Normativa Vigente', 'pdf', '/docs/legislacionfarma.pdf', 3);
#DONE



select * from courses;
#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(8, 1, 'Introducción: Hardware y Software'),
(8, 2, 'Sistema Operativo y Archivos'),
(8, 3, 'Microsoft Word: Procesador de Textos'),
(8, 4, 'Microsoft Excel: Hojas de Cálculo'),
(8, 5, 'Internet, Cloud y Correo Electrónico'),
(8, 6, 'Seguridad Digital y Mantenimiento');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 44: Hardware y Software
-- ============================================
(44, 'Componentes Físicos (CPU, RAM, Disco)', 'video', 'https://youtu.be/QLYXYg9TcL8?si=YDvT5xLE_oM6c6Uy', 1),
(44, 'Sistemas Operativos vs Aplicaciones', 'video', 'https://youtu.be/6EZwTUaYWLg?si=v3f4B2jrmiCIickX', 2),
(44, 'Conexiones y Periféricos', 'video', 'https://youtu.be/unyZ8yNpBV8?si=Ep3hlSvItWlR2R2D', 3),

-- ============================================
-- NIVEL 45: Sistema Operativo
-- ============================================
(45, 'Entorno de Ventanas vs. Entorno de Escritorio', 'video', 'https://youtu.be/aGS23r1LqkY?si=dInkO0lk0zOFETuT', 1),
(45, 'Explorador de Archivos y Carpetas', 'video', 'https://youtu.be/cz1zgct2ADw?si=UaxdJOQjhkUDZKKQ', 2),
(45, 'Panel de Control y Configuración de Microsoft Windows', 'video', 'https://youtu.be/CACTqHh1mwc?si=DyQQOTiAMzGhgR-i', 3),

-- ============================================
-- NIVEL 46: Microsoft Word
-- ============================================
(46, 'Formato de Texto y Párrafos', 'video', 'https://youtu.be/JPYHALq2f2M?si=nPjQfcBjNOd0iZG0', 1),
(46, 'Inserción de Tablas e Imágenes', 'video', 'https://youtu.be/00cgkt8EolM?si=IX9SveXnoRBmayT2', 2),
(46, 'Configuración de Página e Impresión', 'pdf', '/docs/wordbasico.pdf', 3),

-- ============================================
-- NIVEL 47: Microsoft Excel
-- ============================================
(47, 'Introducción a Celdas, Filas y Columnas', 'video', 'https://youtu.be/NcMrtZRO32Y?si=D4Ke51AzwH0ZcCY1', 1),
(47, 'Fórmulas Básicas (Suma, Resta, Etc)', 'video', 'https://youtu.be/yKIPYOEpPWQ?si=6lZCeOmjJ-BxwKC7', 2),
(47, 'Manual de Funciones Esenciales', 'pdf', '/docs/excelbasico.pdf', 3),

-- ============================================
-- NIVEL 48: Internet y Cloud
-- ============================================
(48, 'Búsqueda Simple Y Avanzada', 'video', 'https://youtu.be/Fcyw0f6ybcw?si=i4Wq-7wbdbBzX9Fr', 1),
(48, 'Google Drive y Almacenamiento en la Nube', 'video', 'https://youtu.be/ICzTCPjxUjI?si=btXTHhXDeQwqbwBf', 2),
(48, 'Uso Responsable del Correo Electrónico', 'video', 'https://youtu.be/7HjDyI4SCvA?si=zuNZ0ahP4WrekK8y', 3),

-- ============================================
-- NIVEL 49: Seguridad y Mantenimiento
-- ============================================
(49, 'Malware: ¿Cómo protegernos?', 'video', 'https://youtu.be/HuasitV4lcw?si=obomp_YEPXGXpXOe', 1),
(49, 'Limpieza de Software y Copias de Seguridad', 'pdf', '/docs/limpiezasoftware.pdf', 2),
(49, 'Ataques a la Seguridad en la Red', 'video', 'https://youtu.be/x56FT_OVARQ?si=rzy-6d8o7M4TSsdV', 3);
#DONE




#DONE
select * from courses;
INSERT INTO levels (course_id, level_number, title) VALUES
(9, 1, 'Morfología del Rostro y Diseño de Cejas'),
(9, 2, 'Técnicas de Depilación y Perfilado'),
(9, 3, 'Extensiones y Lifting de Pestañas'),
(9, 4, 'Higiene, Seguridad y Ética Profesional');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 50: Morfología y Diseño
-- ============================================
(50, 'Anatomía del Ojo y Estructura de la Ceja', 'video', 'https://youtu.be/rRyXVyKVNW8?si=IuEK13IAY2U5tjo2', 1),
(50, 'Visagismo: Diseño según el Tipo de Rostro', 'video', 'https://youtu.be/Ap5UnMty7M4?si=GjsKtDAheATWpx82', 2),
(50, 'Uso del Vernier', 'video', 'https://youtu.be/Fl1MqK3VztE?si=yMWqr80irTVdU1Qm', 3),

-- ============================================
-- NIVEL 51: Depilación y Perfilado
-- ============================================
(51, 'Técnicas de Depilación con Cera', 'video', 'https://youtu.be/t9r6b7_D8Zs?si=87KwDld05WCNKybB', 1),
(51, 'Tintura de Cejas con Henna', 'video', 'https://youtu.be/tTU4nYJwWbY?si=rs06zRB3TZkjNhHA', 2),
(51, 'Protocolo de Limpieza y Preparación de la Piel', 'pdf', '/docs/preparacionperfilado.pdf', 3),

-- ============================================
-- NIVEL 52: Pestañas (Lifting y Extensiones)
-- ============================================
(52, 'Lifting de Pestañas: Paso a Paso', 'video', 'https://youtu.be/KElbabnL4WA?si=sCIw6HLdLXgzJWC9', 1),
(52, 'Introducción a las Extensiones de Pestañas (Pelo a Pelo)', 'video', 'https://youtu.be/KQPukvzU5sk?si=mTUWBBy6QpUnsTQg', 2),
(52, 'Cuidados Posteriores y Recomendaciones', 'pdf', '/docs/cuidadospestanas.pdf', 3),

-- ============================================
-- NIVEL 53: Higiene y Ética
-- ============================================
(53, 'Esterilización de Herramientas y Bioseguridad', 'video', 'https://youtu.be/6YFYz9lRD5c?si=2WW3cwWF50Fd8Ahq', 1),
(53, 'Prueba de Alergia Para Extenciones', 'video', 'https://youtu.be/XeloJDndC9o?si=3KOM45MgiEdRSq0V', 2),
(53, 'Presupuestos y Atención Profesional al Cliente', 'pdf', '/docs/negocioestetica.pdf', 3);
#DONE




#DONE
select * from levels;
INSERT INTO levels (course_id, level_number, title) VALUES
(10, 1, 'Anatomía de la Piel y Limpieza Facial'),
(10, 2, 'Tratamientos y Masaje Facial'),
(10, 3, 'Maquillaje Social y Colorimetría'),
(10, 4, 'Maquillaje de Noche, Tendencias y Ética');

INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 54: Anatomía y Limpieza
-- ============================================
(54, 'Capas de la Piel', 'video', 'https://youtu.be/C0G_RogSxV8?si=YrdCqnm5HsBja4Vf', 1),
(54, 'Protocolo de Limpieza Facial Profunda', 'video', 'https://youtu.be/ZOFvFBs_Lhg?si=px78OMxnSSJRMiGE', 2),
(54, 'Extracción de Impurezas y Exfoliación', 'pdf', '/docs/impurezas.pdf', 3),

-- ============================================
-- NIVEL 55: Tratamientos y Masaje
-- ============================================
(55, 'Tipos de Mascarillas Faciales', 'video', 'https://youtu.be/s1Mn9175_JA?si=jjzOkcmWn8aCt4PW', 1),
(55, 'Técnicas de Masaje Facial Relajante', 'video', 'https://youtu.be/DE2Yr67GkJw?si=sGd2d5k4t6MKlBcB', 2),
(55, 'Aparatología Básica en Cabina', 'pdf', '/docs/aparatologiafacial.pdf', 3),

-- ============================================
-- NIVEL 56: Maquillaje Social y Color
-- ============================================
(56, 'Teoría del Color aplicada al Maquillaje', 'video', 'https://youtu.be/lcY4Wak1oA0?si=ZA01-ZwLryFuyZwa', 1),
(56, 'Preparación de la Piel para el Maquillaje', 'video', 'https://youtu.be/y_4k2Kzf1gg?si=ef0kR2rVRNxiCJfY', 2),
(56, 'Maquillaje de Día: Natural y Glow', 'pdf', '/docs/guiamakeup.pdf', 3),

-- ============================================
-- NIVEL 57: Maquillaje de Noche y Ética
-- ============================================
(57, 'Técnicas de Smokey Eye', 'video', 'https://youtu.be/RiWGgr4RiRU?si=2A9bzczMc-2-l2xA', 1),
(57, 'Contouring en tus Labios', 'video', 'https://youtu.be/_xjP96_QJkE?si=SDlLnuNkR6LTht8c', 2),
(57, 'Higiene del Maletín y Atención al Cliente', 'pdf', '/docs/eticamakeup.pdf', 3);
#DONE




#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(11, 1, 'Alphabet, Greetings and Personal Info'),
(11, 2, 'Numbers, Colors and Common Objects'),
(11, 3, 'Basic Verbs and Daily Routine'),
(11, 4, 'Practical Expressions and Basic Conversations');


INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 58: Greetings and Info
-- ============================================
(58, 'The Alphabet and Pronunciation', 'video', 'https://youtu.be/I2SaZnEjmZw?si=AohZxzHGveLrDfIA', 1),
(58, 'Greetings and Farewells (Formal & Informal)', 'video', 'https://youtu.be/tmbjkjQGduA?si=MQybPI_moeGlcDsb', 2),
(58, 'PDF: Basic Personal Information Phrases', 'pdf', '/docs/basicinfo.pdf', 3),

-- ============================================
-- NIVEL 59: Numbers and Objects
-- ============================================
(59, 'Numbers from 1 to 100', 'video', 'https://youtu.be/dNP6L6y7ZEM?si=mGfePPSWK6cRCdxF', 1),
(59, 'Colors and Shapes in English', 'video', 'https://youtu.be/AM-Kj6mILC0?si=z-UvlhxGzhZzwWkZ', 2),
(59, 'PDF: Vocabulary - Classroom and Home Objects', 'pdf', '/docs/vocabularyobjects.pdf', 3),

-- ============================================
-- NIVEL 60: Verbs and Routine
-- ============================================
(60, 'The Verb TO BE (Present Simple)', 'video', 'https://youtu.be/wQM_JvYyyRc?si=o7vcHEo1zxY04gEH', 1),
(60, 'Action Verbs and Daily Habits', 'video', 'https://youtu.be/TOBrnsnDNEU?si=PPvI97tkrONEn9Wk', 2),
(60, 'Video: Days of the Week and Months', 'video', 'https://youtu.be/xkUYTmRDSko?si=qdtl1MTUmLhw0hU7', 3),

-- ============================================
-- NIVEL 61: Basic Conversations
-- ============================================
(61, 'Asking Simple Questions (Wh- Questions)', 'video', 'https://youtu.be/x_4AjSwTXdc?si=ncOz9D8n-ssdkJ90', 1),
(61, 'Roleplay: Ordering at an Restaurant', 'video', 'https://youtu.be/ki2m6Sr3UAU?si=oNJ6aLpzGZ__TRKc', 2),
(61, 'Video: 50 Common Phrases for Beginners', 'video', 'https://youtu.be/B7yyvbmykqE?si=usq-1d2h2hU3Cz3E', 3);
#DONE


#DONE
INSERT INTO levels (course_id, level_number, title) VALUES
(12, 1, 'Herramientas y Desarmado de Dispositivos'),
(12, 2, 'Diagnóstico de Fallas y Hardware'),
(12, 3, 'Técnicas de Soldadura y Cambio de Componentes'),
(12, 4, 'Software, Flasheo y Ética Profesional');


INSERT INTO lessons (level_id, title, type, content_url, order_number)
VALUES
-- ============================================
-- NIVEL 62: Herramientas y Desarmado
-- ============================================
(62, 'Kit de Herramientas Esenciales', 'video', 'https://youtu.be/-sO7sTWBLbk?si=L7MAsEtHaAqYAhFv', 1),
(62, 'PDF: Medidas de Seguridad y Estática (ESD)', 'pdf', '/docs/seguridadcelulares.pdf', 2),

-- ============================================
-- NIVEL 63: Diagnóstico y Hardware
-- ============================================
(63, 'Revisión de Puerto de Carga', 'video', 'https://youtu.be/nCaYumVw5kU?si=770QCBh-t0NDVHPY', 1),
(63, 'Identificación de Componentes', 'video', 'https://youtu.be/ih8TdEh-dpc?si=boBUNt4K8uGnIW-1', 2),
(63, 'PDF: Guía de Fallas Comunes y Soluciones', 'pdf', '/docs/guiafallas.pdf', 3),

-- ============================================
-- NIVEL 64: Soldadura y Cambios
-- ============================================
(64, 'Cambio de Pantallas', 'video', 'https://youtu.be/DmfNlQKx7l4?si=3GDFmWO4-bz4G-YK', 1),
(64, 'Uso del Cautín y Estación de Calor (Micro-soldadura)', 'video', 'https://youtu.be/NC2Vkf4pBKk?si=Hcnlg1DXLAVZdjvs', 2),
(64, 'PDF: Técnicas de Reballing Básico', 'pdf', '/docs/tecnicassoldadura.pdf', 3),

-- ============================================
-- NIVEL 65: Software y Ética
-- ============================================
(65, 'Reseteo de Fábrica y Hard Reset', 'video', 'https://youtu.be/LH32CMBqewM?si=PwDqMQsuWH3f7eHT', 1),
(65, 'Introducción al Flasheo de ROMs', 'video', 'https://youtu.be/jE0RcshD_ac?si=2n3MiA1KRHWP--l4', 2),
(65, 'PDF: Ética Profesional y Privacidad del Cliente', 'pdf', '/docs/eticareparacion.pdf', 3);
#DONE


