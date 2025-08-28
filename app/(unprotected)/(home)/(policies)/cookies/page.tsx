export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-default">
        <h1 className="text-3xl md:text-4xl font-bold text-default-900 mb-8">Cookie Policy</h1>
        <p className="text-default-600 mb-8">Effective Date: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">What Are Cookies</h2>
          <p className="text-default-700 mb-4">
            Cookies are small text files that are placed on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">How We Use Cookies</h2>
          <p className="text-default-700 mb-4">LeadNova uses cookies for the following purposes:</p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li><strong>Authentication:</strong> To keep you signed in to your account</li>
            <li><strong>Security:</strong> To protect against fraudulent activity</li>
            <li><strong>Preferences:</strong> To remember your settings and preferences</li>
            <li><strong>Analytics:</strong> To understand how you use our service</li>
            <li><strong>Performance:</strong> To improve the speed and functionality of our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Types of Cookies We Use</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-default-900 mb-2">Essential Cookies</h3>
            <p className="text-default-700 mb-2">
              These cookies are necessary for the website to function properly. They cannot be disabled.
            </p>
            <ul className="list-disc pl-6 text-default-700 space-y-1">
              <li>Session management cookies</li>
              <li>Authentication cookies</li>
              <li>Security cookies</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-default-900 mb-2">Functional Cookies</h3>
            <p className="text-default-700 mb-2">
              These cookies enable personalized features and remember your preferences.
            </p>
            <ul className="list-disc pl-6 text-default-700 space-y-1">
              <li>Language preferences</li>
              <li>Theme settings (light/dark mode)</li>
              <li>Dashboard layout preferences</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-default-900 mb-2">Analytics Cookies</h3>
            <p className="text-default-700 mb-2">
              These cookies help us understand how visitors interact with our website.
            </p>
            <ul className="list-disc pl-6 text-default-700 space-y-1">
              <li>Google Analytics</li>
              <li>Usage tracking cookies</li>
              <li>Performance monitoring cookies</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Third-Party Cookies</h2>
          <p className="text-default-700 mb-4">
            Some cookies are placed by third-party services that appear on our pages:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li><strong>Meta/Facebook:</strong> For Facebook login and lead integration</li>
            <li><strong>Google:</strong> For Google sign-in and analytics</li>
            <li><strong>Stripe:</strong> For secure payment processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Cookie Duration</h2>
          <p className="text-default-700 mb-4">Cookies have different lifespans:</p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 30 days to 1 year)</li>
            <li><strong>Authentication Cookies:</strong> Valid for 30 days or until you sign out</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Managing Cookies</h2>
          <p className="text-default-700 mb-4">
            You can control and manage cookies in several ways:
          </p>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-default-900 mb-2">Browser Settings</h3>
            <p className="text-default-700">
              Most browsers allow you to refuse or delete cookies. Check your browser's help section for instructions:
            </p>
            <ul className="list-disc pl-6 text-default-700 space-y-1 mt-2">
              <li>Chrome: Settings → Privacy and Security → Cookies</li>
              <li>Firefox: Settings → Privacy & Security → Cookies</li>
              <li>Safari: Preferences → Privacy → Cookies</li>
              <li>Edge: Settings → Privacy, Search, and Services → Cookies</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-default-900 mb-2">Cookie Preferences</h3>
            <p className="text-default-700">
              You can manage your cookie preferences in your LeadNova account settings under Privacy → Cookie Preferences.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Impact of Disabling Cookies</h2>
          <p className="text-default-700 mb-4">
            If you disable cookies, you may experience:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Inability to stay logged in to your account</li>
            <li>Loss of personalized settings and preferences</li>
            <li>Reduced functionality of certain features</li>
            <li>Need to re-enter information more frequently</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Do Not Track</h2>
          <p className="text-default-700 mb-4">
            LeadNova respects Do Not Track (DNT) browser settings. When DNT is enabled, we limit tracking to essential cookies only.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Updates to This Policy</h2>
          <p className="text-default-700 mb-4">
            We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting 
            a notice on our website or sending you an email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Contact Us</h2>
          <p className="text-default-700 mb-4">
            If you have questions about our use of cookies, please contact us:
          </p>
          <ul className="list-none text-default-700 space-y-2">
            <li>Email: privacy@leadnova.io</li>
            <li>Support: support.leadnova.io</li>
          </ul>
        </section>
      </div>
    </div>
  );
}