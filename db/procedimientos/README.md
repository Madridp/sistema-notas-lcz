# Procedimientos de la base de datos

Estos son los procedimientos almacenados (stored procedures) que hemos
modificado o creado. Viven dentro del MySQL de producción, **no** en el
código de la aplicación.

⚠️ **Importante:** el respaldo automático de Coolify NO incluye los
procedimientos. Si se restaura la base desde ese respaldo, hay que volver
a aplicar estos archivos para que el sistema funcione.

## Archivos

| Archivo | Qué hace |
|---|---|
| `SP_NOTAS_INS.sql` | Guarda notas. No borra al dejar un campo vacío, y redondea decimales al guardar. |
| `sp_nota_limpiar.sql` | Borra una nota a propósito (una unidad específica). |
| `sp_alumno_baja.sql` | Da de baja un alumno sin borrar sus notas (baja lógica). |

## Cómo aplicar uno en producción

En la terminal de Coolify (contenedor MySQL `hlfijf1kauuid3qgsiodrhoi`):

```
docker exec -i hlfijf1kauuid3qgsiodrhoi mysql -u root -pTU_PASSWORD \
  --default-character-set=utf8mb4 Registro_Notas_Guatemala < archivo.sql
```

Siempre sacar respaldo antes de aplicar cambios.
