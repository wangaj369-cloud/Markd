export default function LandingPage({
  onGetStarted,
  onLogin,
  onGuest,
}) {
  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <header className="landing-nav">

        <div className="landing-logo">
          <div className="landing-logo-mark">M</div>
          <span>Markd</span>
        </div>

        <div className="landing-nav-actions">
          <button
            className="landing-login-button"
            onClick={onLogin}
          >
            Log in
          </button>

          <button
            className="landing-nav-cta"
            onClick={onGetStarted}
          >
            Get Started
          </button>
        </div>

      </header>


      {/* HERO */}
      <section className="landing-hero">

        <div className="landing-hero-glow"></div>

        <div className="landing-hero-content">

          <div className="landing-badge">
            AI-POWERED A-LEVEL REVISION
          </div>

          <h1>
            Revise smarter.
            <br />
            <span>Improve faster.</span>
          </h1>

          <p>
            Videos, AI-generated questions, instant marking and
            progress tracking — everything you need to make
            your A-Level revision more effective.
          </p>

          <div className="landing-hero-buttons">

            <button
              className="landing-primary-button"
              onClick={onGetStarted}
            >
              Start Revising Free
              <span>→</span>
            </button>

            <button
              className="landing-secondary-button"
              onClick={onGuest}
            >
              Continue as Guest
            </button>

          </div>

          <div className="landing-hero-note">
            No account required to get started
          </div>

          <div className="landing-year-note">
            Built for Year 12 & Year 13
          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="landing-section landing-features">

        <div className="landing-section-heading">

          <span>EVERYTHING YOU NEED</span>

          <h2>
            One place for your
            <br />
            A-Level revision.
          </h2>

          <p>
            Learn, practise, improve and track your progress
            without jumping between different revision tools.
          </p>

        </div>


        <div className="landing-feature-grid">

          <div className="landing-feature-card">

            <div className="landing-feature-icon">
              🎥
            </div>

            <h3>Learn</h3>

            <h4>Focused topic videos</h4>

            <p>
              Watch revision videos focused on the exact
              topic you're studying.
            </p>

          </div>


          <div className="landing-feature-card">

            <div className="landing-feature-icon">
              🧠
            </div>

            <h3>Practise</h3>

            <h4>AI-generated questions</h4>

            <p>
              Generate A-Level questions based on the
              subject and topic you're revising.
            </p>

          </div>


          <div className="landing-feature-card">

            <div className="landing-feature-icon">
              📝
            </div>

            <h3>Improve</h3>

            <h4>Instant AI marking</h4>

            <p>
              Get feedback on your answers and understand
              exactly what you need to improve.
            </p>

          </div>


          <div className="landing-feature-card">

            <div className="landing-feature-icon">
              📊
            </div>

            <h3>Track</h3>

            <h4>See your progress</h4>

            <p>
              Keep track of your revision and identify
              the topics that need more attention.
            </p>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="landing-section landing-how">

        <div className="landing-section-heading">

          <span>HOW MARKD WORKS</span>

          <h2>
            From learning to
            <br />
            exam ready.
          </h2>

        </div>


        <div className="landing-steps">

          <div className="landing-step">

            <div className="landing-step-number">
              01
            </div>

            <div>
              <h3>Learn</h3>

              <p>
                Watch a focused video for the topic
                you're revising.
              </p>
            </div>

          </div>


          <div className="landing-step-line"></div>


          <div className="landing-step">

            <div className="landing-step-number">
              02
            </div>

            <div>
              <h3>Practise</h3>

              <p>
                Test your knowledge with AI-generated
                A-Level questions.
              </p>
            </div>

          </div>


          <div className="landing-step-line"></div>


          <div className="landing-step">

            <div className="landing-step-number">
              03
            </div>

            <div>
              <h3>Improve</h3>

              <p>
                Get your answers marked and learn from
                your mistakes.
              </p>
            </div>

          </div>


          <div className="landing-step-line"></div>


          <div className="landing-step">

            <div className="landing-step-number">
              04
            </div>

            <div>
              <h3>Track</h3>

              <p>
                See your progress and focus your
                revision where it matters.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* SUBJECTS */}
      <section className="landing-section landing-subjects">

        <div className="landing-section-heading">

          <span>YOUR A-LEVELS</span>

          <h2>
            Built around
            <br />
            your subjects.
          </h2>

        </div>


        <div className="landing-subject-grid">

          <div className="landing-subject-card">
            <span>🧬</span>
            <h3>Biology</h3>
            <p>AQA A-Level</p>
          </div>

          <div className="landing-subject-card">
            <span>⚗️</span>
            <h3>Chemistry</h3>
            <p>AQA A-Level</p>
          </div>

          <div className="landing-subject-card">
            <span>🧠</span>
            <h3>Psychology</h3>
            <p>AQA A-Level</p>
          </div>

        </div>

      </section>


      {/* YEAR 12 / YEAR 13 */}
      <section className="landing-year-section">

        <div className="landing-year-content">

          <span>WHEREVER YOU ARE IN YOUR A-LEVELS</span>

          <h2>
            Revision that
            <br />
            moves with you.
          </h2>

          <p>
            Whether you're building your foundations in Year 12
            or preparing for your final exams in Year 13, Markd
            helps you focus on what matters.
          </p>

        </div>


        <div className="landing-year-cards">

          <div className="landing-year-card">

            <span>YEAR 12</span>

            <h3>
              Build strong foundations.
            </h3>

            <p>
              Stay on top of your course, strengthen your
              knowledge and develop effective revision habits.
            </p>

          </div>


          <div className="landing-year-card">

            <span>YEAR 13</span>

            <h3>
              Sharpen your exam technique.
            </h3>

            <p>
              Identify weak areas, practise exam-style
              questions and focus your revision where it matters.
            </p>

          </div>

        </div>

      </section>


      {/* EXAM MODE */}
      <section className="landing-exam-section">

        <div className="landing-exam-card">

          <div className="landing-exam-icon">
            📝
          </div>

          <div className="landing-exam-content">

            <span>EXAM MODE</span>

            <h2>
              Ready to test yourself?
            </h2>

            <p>
              Put your knowledge to the test with
              A-Level style exams and see how you perform.
            </p>

            <button
              onClick={onGetStarted}
              className="landing-exam-button"
            >
              Try Markd
              <span>→</span>
            </button>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="landing-final-cta">

        <div className="landing-final-glow"></div>

        <span>
          AI-POWERED A-LEVEL REVISION
        </span>

        <h2>
          Make your revision count.
        </h2>

        <p>
          Start revising smarter today.
        </p>

        <button
          className="landing-primary-button"
          onClick={onGetStarted}
        >
          Start Revising Free
          <span>→</span>
        </button>

      </section>


      {/* FOOTER */}
      <footer className="landing-footer">

        <div className="landing-logo">

          <div className="landing-logo-mark">
            M
          </div>

          <span>Markd</span>

        </div>

        <p>
          AI-powered A-Level revision.
        </p>

      </footer>

    </div>
  );
}