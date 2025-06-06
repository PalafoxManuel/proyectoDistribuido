function UniversidadCard({ universidad }) {
  const imagen = universidad.imagen ? `/img/logos/${universidad.imagen}` : '/img/default.png';
  const nombreURL = encodeURIComponent(universidad.nombre_institucion);

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3  card-item">
      <a href={`/universidad/${nombreURL}`} className="card-enlace" style={{ textDecoration: 'none' }}>
        <div
          className="card boton-institucion shadow-sm"
          style={{
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div className="card-body">
            <div className="card-hero" style={{ height: '150px' }}>
              <img
                src={imagen}
                alt={universidad.nombre_institucion}
                className="img-fluid"
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <p
              className="card-title"
              style={{
                marginTop: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {universidad.nombre_institucion}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}

export default UniversidadCard;
