import { useEffect, useState } from 'react';

function Carreras() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/universidad/universidad/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => setData(info))
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);

  if (!data || data.length === 0) return <p className="text-center">Cargando carreras...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-list-stars"></i> Carreras
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Disciplina</th>
              <th>Campo de formación</th>
              <th>Área de conocimiento</th>
              <th>Tipo de programa</th>
              <th>Modalidad</th>
              <th>Duración</th>
              <th>Grado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((programa, index) => (
              <tr key={index}>
                <td>{programa.nombre ?? "No disponible"}</td>
                <td>{programa.disciplina ?? "No disponible"}</td>
                <td>{programa.campo_formacion ?? "No disponible"}</td>
                <td>{programa.area_conocimiento ?? "No disponible"}</td>
                <td>{programa.tipo_programa ?? "No disponible"}</td>
                <td>{programa.modalidad ?? "No disponible"}</td>
                <td>{programa.duracion ?? "No disponible"}</td>
                <td>{programa.grado ?? "No disponible"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Carreras;
