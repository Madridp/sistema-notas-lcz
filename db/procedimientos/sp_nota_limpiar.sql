-- ============================================================
--  sp_nota_limpiar  —  Borrar UNA nota a proposito
-- ============================================================
--  Como SP_NOTAS_INS ya no borra al dejar un campo vacio, este
--  procedimiento es la forma intencional de vaciar una unidad
--  (ej. una nota mal puesta que hay que quitar).
--
--  Uso:  CALL sp_nota_limpiar(id_estudiante, id_materia, unidad);
--        unidad = 1, 2, 3 o 4
-- ============================================================

DROP PROCEDURE IF EXISTS sp_nota_limpiar;
DELIMITER $$
CREATE PROCEDURE sp_nota_limpiar(
  IN p_id_estudiante INT, IN p_id_materia INT, IN p_unidad TINYINT)
BEGIN
  UPDATE Notas_Oficiales
     SET unidad_1 = IF(p_unidad = 1, '', unidad_1),
         unidad_2 = IF(p_unidad = 2, '', unidad_2),
         unidad_3 = IF(p_unidad = 3, '', unidad_3),
         unidad_4 = IF(p_unidad = 4, '', unidad_4)
   WHERE id_estudiante = p_id_estudiante AND id_materia = p_id_materia
     AND ESTADO_REGISTRO = 1;
END$$
DELIMITER ;
