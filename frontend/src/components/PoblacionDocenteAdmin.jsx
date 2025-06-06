import { useEffect, useState } from 'react';

function PoblacionDocenteAdmin() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/universidad/poblacion/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => setData(info))
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);

  if (!data || data.length === 0) return <p className="text-center">Cargando población docente y administrativa...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-person-lines-fill"></i> Población Docente y Administrativa
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Puesto</th>
              <th>Tipo</th>
              <th>Hombres</th>
              <th>Mujeres</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((registro, index) => (
              <tr key={index}>
                <td>{registro.puesto ?? "No disponible"}</td>
                <td>{registro.tipo ?? "No disponible"}</td>
                <td>{registro.hombres ?? 0}</td>
                <td>{registro.mujeres ?? 0}</td>
                <td>{registro.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PoblacionDocenteAdmin;
