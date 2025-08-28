export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-default">
        <h1 className="text-3xl md:text-4xl font-bold text-default-900 mb-8">Privacy Policy</h1>
        <p className="text-default-600 mb-8">Effective Date: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">1. Information We Collect</h2>
          <p className="text-default-700 mb-4">We collect information you provide directly to us, such as:</p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Account information (name, email, company details)</li>
            <li>Facebook lead data synced through Meta Graph API</li>
            <li>Usage data and analytics</li>
            <li>Communications between you and LeadNova</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-default-700 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and sync your Facebook leads</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">3. Information Sharing</h2>
          <p className="text-default-700 mb-4">
            We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>With your consent or at your direction</li>
            <li>To comply with legal obligations</li>
            <li>To protect rights, property, and safety</li>
            <li>With service providers who assist in our operations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">4. Data Security</h2>
          <p className="text-default-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. This includes:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Limited access to personal information</li>
            <li>Secure data storage with industry-standard providers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">5. Data Retention</h2>
          <p className="text-default-700 mb-4">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. 
            When we no longer need to use your information, we will securely delete or anonymize it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">6. Your Rights</h2>
          <p className="text-default-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your information</li>
            <li>Export your data in a portable format</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">7. Meta Platform Integration</h2>
          <p className="text-default-700 mb-4">
            Our integration with Meta platforms is subject to Meta's Platform Terms and Developer Policies. 
            We access only the minimum data necessary to provide our lead management services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">8. Children's Privacy</h2>
          <p className="text-default-700 mb-4">
            Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">9. Changes to This Policy</h2>
          <p className="text-default-700 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page 
            and updating the effective date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">10. Contact Us</h2>
          <p className="text-default-700 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none text-default-700 space-y-2">
            <li>Email: privacy@leadnova.io</li>
            <li>Address: LeadNova Inc., Privacy Team</li>
          </ul>
        </section>
      </div>
    </div>
  );
}