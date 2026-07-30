-- ============================================================
--  SP_NOTAS_INS  —  Guardar / actualizar notas de un alumno
-- ============================================================
--  Este procedimiento se llama cada vez que se guarda una nota.
--
--  Hace dos cosas importantes, ambas agregadas para corregir bugs:
--
--  1) UN CAMPO VACIO NO PISA UNA NOTA EXISTENTE.
--     Antes, al guardar se reescribian las 4 unidades de golpe. Si una
--     maestra tenia la pagina abierta con datos viejos, al guardar borraba
--     las notas que otra persona habia llenado despues. Ahora un valor
--     vacio conserva lo que ya estaba guardado.
--     (Para borrar una nota a proposito se usa sp_nota_limpiar.)
--
--  2) REDONDEA DECIMALES AL GUARDAR.
--     Las notas son texto (varchar). Si llega un 90.5, se guarda 91
--     (.5 sube). Se usa CAST a DECIMAL porque ROUND() directo sobre texto
--     no redondea bien.
-- ============================================================

DROP PROCEDURE IF EXISTS SP_NOTAS_INS;
DELIMITER $$
CREATE PROCEDURE SP_NOTAS_INS(
  IN p_id_estudiante INT, IN p_id_materia INT,
  IN p_u1 VARCHAR(20), IN p_u2 VARCHAR(20), IN p_u3 VARCHAR(20), IN p_u4 VARCHAR(20))
BEGIN
  DECLARE v_id INT DEFAULT NULL;
  DECLARE r1 VARCHAR(20); DECLARE r2 VARCHAR(20);
  DECLARE r3 VARCHAR(20); DECLARE r4 VARCHAR(20);

  SET r1 = IF(TRIM(COALESCE(p_u1,''))='', p_u1, CAST(ROUND(CAST(p_u1 AS DECIMAL(5,2))) AS UNSIGNED));
  SET r2 = IF(TRIM(COALESCE(p_u2,''))='', p_u2, CAST(ROUND(CAST(p_u2 AS DECIMAL(5,2))) AS UNSIGNED));
  SET r3 = IF(TRIM(COALESCE(p_u3,''))='', p_u3, CAST(ROUND(CAST(p_u3 AS DECIMAL(5,2))) AS UNSIGNED));
  SET r4 = IF(TRIM(COALESCE(p_u4,''))='', p_u4, CAST(ROUND(CAST(p_u4 AS DECIMAL(5,2))) AS UNSIGNED));

  SELECT id_nota INTO v_id FROM Notas_Oficiales
   WHERE id_estudiante = p_id_estudiante AND id_materia = p_id_materia
     AND ESTADO_REGISTRO = 1 LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO Notas_Oficiales
      (id_estudiante, id_materia, unidad_1, unidad_2, unidad_3, unidad_4, ESTADO_REGISTRO)
    VALUES (p_id_estudiante, p_id_materia, r1, r2, r3, r4, 1);
  ELSE
    UPDATE Notas_Oficiales
       SET unidad_1 = IF(TRIM(COALESCE(p_u1,'')) = '', unidad_1, r1),
           unidad_2 = IF(TRIM(COALESCE(p_u2,'')) = '', unidad_2, r2),
           unidad_3 = IF(TRIM(COALESCE(p_u3,'')) = '', unidad_3, r3),
           unidad_4 = IF(TRIM(COALESCE(p_u4,'')) = '', unidad_4, r4)
     WHERE id_nota = v_id;
  END IF;
END$$
DELIMITER ;
