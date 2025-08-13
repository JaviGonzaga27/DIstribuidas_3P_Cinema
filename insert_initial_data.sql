-- Insertar salas por defecto
INSERT INTO "Room" ("Name") VALUES 
('Sala 1'),
('Sala 2'),
('Sala 3');

-- Insertar asientos para Sala 1 (RoomId = 1)
-- Filas A-J, asientos 1-10 cada una = 100 asientos
DO $$
DECLARE
    room_id INTEGER := 1;
    row_letter CHAR(1);
    seat_number INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        row_letter := CHR(64 + i); -- A=65, B=66, etc.
        FOR seat_number IN 1..10 LOOP
            INSERT INTO "Seats" ("Row", "Number", "RoomId", "IsDisabled") 
            VALUES (row_letter, seat_number, room_id, false);
        END LOOP;
    END LOOP;
END $$;

-- Insertar asientos para Sala 2 (RoomId = 2)
DO $$
DECLARE
    room_id INTEGER := 2;
    row_letter CHAR(1);
    seat_number INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        row_letter := CHR(64 + i); -- A=65, B=66, etc.
        FOR seat_number IN 1..10 LOOP
            INSERT INTO "Seats" ("Row", "Number", "RoomId", "IsDisabled") 
            VALUES (row_letter, seat_number, room_id, false);
        END LOOP;
    END LOOP;
END $$;

-- Insertar asientos para Sala 3 (RoomId = 3)
DO $$
DECLARE
    room_id INTEGER := 3;
    row_letter CHAR(1);
    seat_number INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        row_letter := CHR(64 + i); -- A=65, B=66, etc.
        FOR seat_number IN 1..10 LOOP
            INSERT INTO "Seats" ("Row", "Number", "RoomId", "IsDisabled") 
            VALUES (row_letter, seat_number, room_id, false);
        END LOOP;
    END LOOP;
END $$;

-- Verificar que se insertaron correctamente
SELECT 
    r."Name" as sala,
    COUNT(s."Id") as total_asientos
FROM "Room" r
LEFT JOIN "Seats" s ON r."Id" = s."RoomId"
GROUP BY r."Id", r."Name"
ORDER BY r."Id";

-- Insertar el primer administrador
-- NOTA: Esta contraseña debe ser cambiada inmediatamente después del primer login
-- La contraseña en texto plano es "AdminPassword123!" y debe ser hasheada por la aplicación
INSERT INTO "Users" ("Email", "Name", "Password", "Role") 
VALUES ('admin@cinema.com', 'Administrator', 'TEMP_PASSWORD_TO_BE_HASHED', 'Admin')
ON CONFLICT ("Email") DO NOTHING;

-- Insertar perfil para el administrador
INSERT INTO "UserProfiles" ("FullName", "BirthDate", "PhoneNumber", "Address", "AuthUserId", "UserId")
SELECT 
    'Administrador del Sistema',
    '1990-01-01'::DATE,
    '+123456789',
    'Sistema',
    u."Id",
    u."Id"
FROM "Users" u
WHERE u."Email" = 'admin@cinema.com'
AND NOT EXISTS (SELECT 1 FROM "UserProfiles" up WHERE up."AuthUserId" = u."Id");