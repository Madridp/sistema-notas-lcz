"use client";
import React, { useState, useMemo, useEffect } from "react";

/**
 * VISTA POR CLASE
 * ---------------------------------------------------------------
 * Muestra UNA materia con TODOS los alumnos del grado cargado,
 * en vez de un alumno con todas sus materias.
 *
 * No consulta nada nuevo a la base: reutiliza los mismos datos que
 * ya trajo `handleCargarAlumnos`, solo que agrupados al revés.
 * El guardado también se reutiliza: llama al mismo `handleNotaChange`
 * de siempre, así que el botón "Guardar Todas las Notas" y el
 * autoguardado funcionan igual que en la vista por alumno.
 */

interface Props {
  estudiantes: any[];
  unidadesHabilitadas: number[];
  puedeEditarMateria: (idMateria: number) => boolean;
  onNotaChange: (idA: number, idM: number, u: string, v: string) => void;
  cambiosSinGuardar: number[];
}

export const VistaPorClase = ({
  estudiantes,
  unidadesHabilitadas,
  puedeEditarMateria,
  onNotaChange,
  cambiosSinGuardar,
}: Props) => {
  const [materiaSel, setMateriaSel] = useState<number | null>(null);

  // Junta todas las materias del grado, tomándolas del primer alumno.
  const materias = useMemo(() => {
    const base = estudiantes[0];
    if (!base) return [] as any[];
    const pools: any[][] = [
      base.curriculares || [],
      base.aspectos || [],
      ...Object.values(base.bloques || {}).map((b: any) => b || []),
    ];
    const vistas = new Set<number>();
    const out: any[] = [];
    pools.forEach((pool) => {
      pool.forEach((m: any) => {
        if (!m || !m.id_materia || vistas.has(m.id_materia)) return;
        vistas.add(m.id_materia);
        out.push({
          id_materia: m.id_materia,
          materia: m.materia,
          tipo: m.tipo,
        });
      });
    });
    return out;
  }, [estudiantes]);

  // Al entrar, se posiciona solo en la primera materia que el usuario
  // pueda editar. Un maestro cae directo en su clase.
  useEffect(() => {
    if (materiaSel !== null || materias.length === 0) return;
    const propia = materias.find((m) => puedeEditarMateria(m.id_materia));
    setMateriaSel((propia || materias[0]).id_materia);
  }, [materias, materiaSel, puedeEditarMateria]);

  const materiaActual =
    materias.find((m) => m.id_materia === materiaSel) || null;
  const editable = materiaActual
    ? puedeEditarMateria(materiaActual.id_materia)
    : false;
  const esNumerica = materiaActual?.tipo === "Numerica";
  const idMat = materiaActual?.id_materia ?? 0;

  // Busca la fila de esa materia dentro de un alumno, sin importar
  // en qué bloque viva (preprimaria usa curriculares/aspectos).
  const buscarItem = (est: any, idMateria: number) => {
    const pools: any[][] = [
      est.curriculares || [],
      est.aspectos || [],
      ...Object.values(est.bloques || {}).map((b: any) => b || []),
    ];
    for (const pool of pools) {
      const encontrado = pool.find((m: any) => m && m.id_materia === idMateria);
      if (encontrado) return encontrado;
    }
    return null;
  };

  // Mismo cálculo que la columna NOTAS FINALES de la boleta.
  const promedioDe = (m: any) => {
    if (!m || m.tipo !== "Numerica") return null;
    const n = ["u1", "u2", "u3", "u4"]
      .map((u) => parseFloat(m[u]))
      .filter((x) => !isNaN(x));
    if (n.length === 0) return null;
    return Math.round(n.reduce((a, b) => a + b, 0) / n.length);
  };

  // Promedio de toda la clase en una unidad.
  const promedioClase = (u: string) => {
    if (!materiaActual || !esNumerica) return "—";
    const vals = estudiantes
      .map((est) => {
        const it = buscarItem(est, materiaActual.id_materia);
        return it ? parseFloat(it[u]) : NaN;
      })
      .filter((x) => !isNaN(x));
    if (vals.length === 0) return "—";
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  if (estudiantes.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-4">
      {/* SELECTOR DE MATERIA */}
      <div className="bg-gray-50/70 border-b border-gray-100 p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#E60000] text-white flex items-center justify-center text-lg shadow-sm">
            📚
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Clase
          </span>
        </div>

        <select
          value={materiaSel ?? ""}
          onChange={(e) => setMateriaSel(Number(e.target.value))}
          className="flex-grow p-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-xs md:text-sm uppercase outline-none focus:border-red-600 transition-colors"
        >
          {materias.map((m) => (
            <option key={m.id_materia} value={m.id_materia}>
              {m.materia}
              {puedeEditarMateria(m.id_materia) ? "" : "  (bloqueado)"}
            </option>
          ))}
        </select>

        <div className="shrink-0 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {estudiantes.length} alumnos
        </div>
      </div>

      {!editable && (
        <div className="bg-red-50/60 border-b border-red-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-600">
          Solo lectura — esta clase no está asignada a tu usuario
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest text-center border-b border-gray-100">
            <tr>
              <th className="px-4 md:px-10 py-4 text-left w-[40%] md:w-1/2">
                Alumno
              </th>
              {[1, 2, 3, 4].map((n) => (
                <th
                  key={n}
                  className={`py-4 ${unidadesHabilitadas.includes(n) ? "text-gray-800" : "opacity-30"}`}
                >
                  U {["I", "II", "III", "IV"][n - 1]}
                </th>
              ))}
              <th className="py-4 text-gray-800">Promedio</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {estudiantes.map((est, i) => {
              const item = materiaActual
                ? buscarItem(est, materiaActual.id_materia)
                : null;
              const prom = promedioDe(item);
              const tieneCambios = cambiosSinGuardar.includes(est.id_alumno);

              return (
                <tr
                  key={est.id_alumno}
                  className={`transition-colors ${tieneCambios ? "bg-yellow-50/40" : "hover:bg-red-50/30"}`}
                >
                  <td className="px-4 md:px-10 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 w-6 shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-black text-[11px] uppercase text-gray-700">
                        {est.nombre}
                      </span>
                    </div>
                  </td>

                  {["u1", "u2", "u3", "u4"].map((u, idx) => {
                    const unidadActiva = unidadesHabilitadas.includes(idx + 1);
                    const bloqueado = !editable || !unidadActiva || !item;
                    const valor = item ? item[u] : "";
                    const n = parseFloat(valor);
                    const reprobado =
                      item?.tipo === "Numerica" && !isNaN(n) && n < 60;

                    return (
                      <td key={u} className="px-1 md:px-3 py-4 text-center">
                        {item?.tipo === "Numerica" ? (
                          <input
                            type="number"
                            value={valor}
                            onChange={(e) =>
                              onNotaChange(
                                est.id_alumno,
                                idMat,
                                u,
                                e.target.value,
                              )
                            }
                            disabled={bloqueado}
                            className={`w-[50px] md:w-[70px] h-[45px] border-2 rounded-xl text-center font-black outline-none transition-all ${bloqueado ? "bg-gray-100/50 border-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:border-red-600"} ${reprobado ? "text-red-600 bg-red-50 border-red-200" : ""}`}
                          />
                        ) : (
                          <select
                            value={valor}
                            onChange={(e) =>
                              onNotaChange(
                                est.id_alumno,
                                idMat,
                                u,
                                e.target.value,
                              )
                            }
                            disabled={bloqueado}
                            className={`w-full md:w-[80px] h-[45px] border-2 rounded-xl text-[9px] md:text-[10px] font-black text-center outline-none transition-all ${bloqueado ? "bg-gray-100/50 border-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:border-red-600"}`}
                          >
                            <option value="">-</option>
                            {item?.tipo === "Texto_Primaria" ? (
                              <>
                                <option value="DESTACA">Destaca</option>
                                <option value="AVANZA">Avanza</option>
                                <option value="NM">NM</option>
                              </>
                            ) : (
                              <>
                                <option value="F">F</option>
                                <option value="A">A</option>
                                <option value="NM">NM</option>
                              </>
                            )}
                          </select>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-1 md:px-3 py-4 text-center">
                    {prom !== null ? (
                      <span
                        className={`inline-flex items-center justify-center w-[50px] md:w-[70px] h-[45px] rounded-xl border-2 font-black text-sm ${prom < 60 ? "text-red-600 bg-red-50 border-red-200" : "text-[#17365D] bg-slate-50 border-slate-200"}`}
                      >
                        {prom}
                      </span>
                    ) : (
                      <span className="text-gray-300 font-black">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* PROMEDIO DE LA CLASE */}
            <tr className="bg-red-50/50 font-black text-[#E60000] border-t-2 border-red-100">
              <td className="px-4 md:px-10 py-4 text-right text-[10px] uppercase tracking-widest">
                Promedio de la clase
              </td>
              {["u1", "u2", "u3", "u4"].map((u) => (
                <td key={u} className="text-center py-4 text-sm">
                  {promedioClase(u)}
                </td>
              ))}
              <td className="text-center py-4 text-sm">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

VistaPorClase.displayName = "VistaPorClase";
