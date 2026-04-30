-- Insert professions first
INSERT INTO "Profession" ("id", "name", "description", "status", "createdAt", "updatedAt") VALUES
('medico', 'Médico', 'Profissional médico', true, NOW(), NOW()),
('dentista', 'Dentista', 'Profissional odontológico', true, NOW(), NOW()),
('enfermeiro', 'Enfermeiro', 'Profissional de enfermagem', true, NOW(), NOW());

-- Insert specialties
INSERT INTO "Specialty" ("id", "name", "description", "status", "createdAt", "updatedAt") VALUES
('cardiologia', 'Cardiologia', 'Especialidade em cardiologia', true, NOW(), NOW()),
('ortodontia', 'Ortodontia', 'Especialidade em ortodontia', true, NOW(), NOW()),
('enfermagem_geral', 'Enfermagem Geral', 'Enfermagem geral', true, NOW(), NOW()),
('pediatria', 'Pediatria', 'Especialidade em pediatria', true, NOW(), NOW()),
('cirurgia_bucal', 'Cirurgia Bucal', 'Especialidade em cirurgia bucal', true, NOW(), NOW());

-- Update existing users with valid professionId
UPDATE "User" SET "professionId" = 'medico' WHERE "email" = 'alvarofederal';
UPDATE "User" SET "professionId" = 'dentista' WHERE "email" = 'joao.silva@example.com';
UPDATE "User" SET "professionId" = 'dentista' WHERE "email" = 'maria.santos@example.com';
UPDATE "User" SET "professionId" = 'enfermeiro' WHERE "email" = 'pedro.oliveira@example.com';
UPDATE "User" SET "professionId" = 'medico' WHERE "email" = 'ana.costa@example.com';
UPDATE "User" SET "professionId" = 'dentista' WHERE "email" = 'carlos.pereira@example.com';
