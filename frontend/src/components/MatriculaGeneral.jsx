import { useEffect, useState } from 'react';

function MatriculaGeneral() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/matricula/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => {
        // Aquí accedemos al objeto retornado
        if (info && info.tablasEMSyLugarEntidad) {
          setData([info.tablasEMSyLugarEntidad]); // lo pasamos como array para mapear
        } else {
          setData([]);
        }
      })
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);


  if (!data || data.length === 0) return <p className="text-center">Cargando matrícula general...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-people-fill"></i> Matrícula general EMS
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Subsistema</th>
              <th>Turno</th>
              <th>Hombres</th>
              <th>Mujeres</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((fila, index) => (
              <tr key={index}>
                <td>{fila.subsistema ?? "No disponible"}</td>
                <td>{fila.turno ?? "No disponible"}</td>
                <td>{fila.hombres ?? 0}</td>
                <td>{fila.mujeres ?? 0}</td>
                <td>{fila.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatriculaGeneral;
