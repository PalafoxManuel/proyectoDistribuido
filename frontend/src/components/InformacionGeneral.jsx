import { useEffect, useState } from 'react';

function InformacionGeneral() {
  const [data, setData] = useState(null);
  const [logoSrc, setLogoSrc] = useState('/img/default.png');

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`universidad/${encodeURIComponent(nombreUniversidad)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Error en la solicitud");
        return response.json();
      })
      .then((res) => {
        setData(res);
        if (res.imagen) {
          setLogoSrc(`/img/logos/${res.imagen}`);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (fecha) => {
    if (!fecha || fecha === "No disponible") return "No disponible";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  if (!data) return <p className="text-center">Cargando información...</p>;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-center align-items-center">
        <span>
          <i className="bi bi-info-circle"></i> Información general
        </span>
      </div>

      <div className="card m-3">
        <div className="card-body p-3">
          <div className="mb-3">
            <div className="row g-0">
              <div className="col-md-3 p-3">
                <img className="img-fluid rounded-start" src={logoSrc} alt="Logo de la universidad" />
              </div>
              <div className="col-md-9">
                <br />
                <h2 className="card-title text-center">
                  <b>{data.nombre_institucion || "No disponible"}</b>
                </h2>
                <hr />
                <h4 className="card-text">
                  <b>{data.puesto || "No disponible"}</b>{" "}
                  {data.grado || "No disponible"} {data.rector || "No disponible"}
                </h4>
                <h5 className="card-text">
                  Gestión:{" "}
                  <small className="text-muted">
                    Inicio: {formatDate(data.fecha_inicio)}. Término: {formatDate(data.fecha_termino)}.
                  </small>
                </h5>

                <div className="container">
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${data.gestion || 0}%` }}
                      aria-valuenow={data.gestion || 0}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {data.gestion || 0}%
                    </div>
                  </div>
                </div>

                <br />
                <table className="table table-bordered">
                  <thead className="table-active">
                    <tr>
                      <th>Órgano colegiado</th>
                      <th>Subsistema</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{data.organo_colegiado || "No disponible"}</td>
                      <td>{data.subsistema || "No disponible"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InformacionGeneral;