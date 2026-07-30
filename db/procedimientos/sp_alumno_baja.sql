-- ============================================================
--  sp_alumno_baja  —  Dar de baja un alumno (baja logica)
-- ============================================================
--  No borra al alumno ni sus notas. Solo lo oculta de listados
--  y boletas poniendo estado=0 y ESTADO_REGISTRO=0.
--
--  El sistema filtra por ESTADO_REGISTRO, asi que ese es el que
--  lo hace desaparecer. Se pone estado=0 tambien por consistencia.
--
--  Para revivirlo:
--    UPDATE Alumnos SET estado=1, ESTADO_REGISTRO=1 WHERE id_estudiante=NNN;
--
--  Uso:  CALL sp_alumno_baja(id_estudiante);
-- ============================================================

DROP PROCEDURE IF EXISTS sp_alumno_baja;
DELIMITER $$
CREATE PROCEDURE sp_alumno_baja(IN p_id INT)
BEGIN
  UPDATE Alumnos
     SET estado = 0,
         ESTADO_REGISTRO = 0
   WHERE id_estudiante = p_id;
END$$
DELIMITER ;
