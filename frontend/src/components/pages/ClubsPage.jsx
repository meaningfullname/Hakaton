import React from 'react';

const ClubsPage = () => {
  const courses = {
    cs: {
      title: 'Computer Science',
      courses: [
        'Introduction Python (8 lessons)',
        'Algorithm for Beginner (6 lessons)',
        'Basics Web Development (10 lessons)'
      ]
    },
    design: {
      title: 'Design',
      courses: [
        'UI for beginners (5 lessons)',
        'Figma from scratch (7 lessons)',
        'Color and typography (4 lessons)'
      ]
    },
    lang: {
      title: 'Foreign languages',
      courses: [
        'English B2 (12 lessons)',
        'Spanish A1 (6 lessons)'
      ]
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      background: '#f5f5f5',
      color: '#333',
      minHeight: '100vh'
    }}>
      <div style={{
        background: '#0e1a35',
        color: '#fff',
        padding: '15px 20px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Курсы онлайн</h1>
      </div>

      <main style={{
        maxWidth: '800px',
        margin: '30px auto',
        padding: '0 20px'
      }}>
        {Object.entries(courses).map(([key, section]) => (
          <section
            key={key}
            style={{
              background: '#fff',
              marginBottom: '25px',
              padding: '20px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,.05)'
            }}
          >
            <h2 style={{
              marginBottom: '10px',
              color: '#0e1a35'
            }}>
              {section.title}
            </h2>
            <ul style={{ marginLeft: '20px' }}>
              {section.courses.map((course, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{course}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '15px',
        fontSize: '.9rem',
        color: '#777'
      }}>
        © 2025, Coventry University.
      </footer>
    </div>
  );
};

export default ClubsPage;