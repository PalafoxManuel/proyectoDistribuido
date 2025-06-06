import { useEffect, useState } from 'react';

function OfertaEducativa() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/universidad/oferta-educativa/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => setData(info))
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);

  if (!data || data.length === 0) return <p className="text-center">Cargando oferta educativa...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-journal-bookmark-fill"></i> Oferta educativa
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Tipo</th>
              <th>Disciplina</th>
              <th>Nombre del Programa</th>
              <th>Modalidad</th>
              <th>Duración (semestres)</th>
              <th>Matricula</th>
            </tr>
          </thead>
          <tbody>
            {data.map((programa, index) => (
              <tr key={index}>
                <td>{programa.tipo ?? "No disponible"}</td>
                <td>{programa.disciplina ?? "No disponible"}</td>
                <td>{programa.programa ?? "No disponible"}</td>
                <td>{programa.modalidad ?? "No disponible"}</td>
                <td>{programa.duracion ?? "No disponible"}</td>
                <td>{programa.matricula ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfertaEducativa;
