import Card from '../components/ui/Card.jsx'

export default function About() {
  return (
    <div>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div className="emoji-large" style={{ marginBottom: '1rem' }}>💜</div>
        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="emoji">ℹ️</span>
          À propos de W.ALLfit
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Votre partenaire pour un parcours de fitness personnalisé et adapté
        </p>
      </div>
      
      <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="emoji"></span>
          Notre Mission
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.8' }}>
          <span className="emoji"></span> W.ALLfit est une plateforme de fitness conçue spécifiquement pour répondre aux besoins uniques des femmes.
        </p>
      </Card>

      <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="emoji"></span>
          Le Problème
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
          Les applications de fitness classiques sont génériques et ignorent les besoins spécifiques des femmes, 
          ce qui entraîne :
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Frustration des utilisatrices</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Abandon des programmes</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Résultats inefficaces</span>
          </li>
        </ul>
      </Card>

      <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="emoji"></span>
          Notre Solution
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
          W.ALLfit offre un parcours <strong>personnalisé et adapté</strong> qui prend en compte les spécificités 
          féminines pour garantir des résultats durables et un suivi efficace.
        </p>
        <p style={{ marginTop: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
          <span className="emoji"></span> Notre plateforme vous permet de :
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Choisir parmi des programmes adaptés à vos besoins</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Suivre votre progression en temps réel</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Accéder à un contenu personnalisé et évolutif</span>
          </li>
          <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="emoji"></span>
            <span>Bénéficier d'un accompagnement adapté à votre rythme</span>
          </li>
        </ul>
      </Card>

      <Card style={{ background: 'var(--card-soft)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="emoji">💜</span>
          Pourquoi W.ALLfit ?
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.8' }}>
          <span className="emoji"></span> Nous croyons que chaque femme mérite un programme de fitness qui respecte son corps, 
          son rythme et ses objectifs. W.ALLfit n'est pas juste une autre app de fitness - 
          c'est votre partenaire pour un parcours de transformation durable et respectueux.
        </p>
      </Card>
    </div>
  )
}

