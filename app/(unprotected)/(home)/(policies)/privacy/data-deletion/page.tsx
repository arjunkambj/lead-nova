export default function DataDeletionPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-default">
        <h1 className="text-3xl md:text-4xl font-bold text-default-900 mb-8">Data Deletion Policy</h1>
        <p className="text-default-600 mb-8">Last Updated: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Your Right to Delete Data</h2>
          <p className="text-default-700 mb-4">
            At LeadNova, we respect your privacy and provide you with the ability to delete your personal data. 
            This page explains how you can request deletion of your data and what happens when you make such a request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">How to Request Data Deletion</h2>
          <p className="text-default-700 mb-4">You can request deletion of your data through the following methods:</p>
          <ol className="list-decimal pl-6 text-default-700 space-y-2">
            <li><strong>In-App Request:</strong> Go to Settings → Privacy → Delete My Data</li>
            <li><strong>Email Request:</strong> Send an email to privacy@leadnova.io with the subject "Data Deletion Request"</li>
            <li><strong>Support Portal:</strong> Submit a request through our support portal at support.leadnova.io</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">What Data Can Be Deleted</h2>
          <p className="text-default-700 mb-4">Upon your request, we will delete the following data:</p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Personal account information (name, email, profile data)</li>
            <li>Facebook lead data synced through our platform</li>
            <li>Usage analytics associated with your account</li>
            <li>Communication history and support tickets</li>
            <li>Custom settings and preferences</li>
            <li>Team member data associated with your organization</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Data We May Retain</h2>
          <p className="text-default-700 mb-4">
            Certain data may be retained even after a deletion request for legal and operational purposes:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Transaction and billing records (retained for tax and accounting purposes)</li>
            <li>Data required for legal compliance or dispute resolution</li>
            <li>Anonymized and aggregated data that cannot identify you</li>
            <li>Backup data (will be deleted according to our backup retention schedule)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Facebook Data Deletion</h2>
          <p className="text-default-700 mb-4">
            When you disconnect your Facebook account or request data deletion:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>We immediately revoke our app's access to your Facebook account</li>
            <li>All Facebook lead data stored in our system is permanently deleted</li>
            <li>Cached Facebook page information is removed</li>
            <li>Access tokens and permissions are revoked and deleted</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Deletion Timeline</h2>
          <p className="text-default-700 mb-4">
            We process data deletion requests according to the following timeline:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li><strong>Acknowledgment:</strong> Within 24 hours of receiving your request</li>
            <li><strong>Verification:</strong> We may contact you to verify your identity (1-2 business days)</li>
            <li><strong>Processing:</strong> Data deletion begins immediately after verification</li>
            <li><strong>Completion:</strong> Most data deleted within 30 days</li>
            <li><strong>Backup removal:</strong> Backup data deleted within 90 days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Account Reactivation</h2>
          <p className="text-default-700 mb-4">
            Once your data is deleted:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Your account cannot be reactivated</li>
            <li>Deleted data cannot be recovered</li>
            <li>You may create a new account using the same email address</li>
            <li>Historical data from your previous account will not be available</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Data Portability</h2>
          <p className="text-default-700 mb-4">
            Before requesting deletion, you may want to export your data. You can:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Export your leads in CSV format from the dashboard</li>
            <li>Download your account information from Settings</li>
            <li>Request a complete data export by emailing privacy@leadnova.io</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Contact Us</h2>
          <p className="text-default-700 mb-4">
            If you have questions about data deletion or need assistance, please contact us:
          </p>
          <ul className="list-none text-default-700 space-y-2">
            <li><strong>Email:</strong> privacy@leadnova.io</li>
            <li><strong>Support Portal:</strong> support.leadnova.io</li>
            <li><strong>Response Time:</strong> Within 24-48 hours</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-default-900 mb-4">Your Privacy Rights</h2>
          <p className="text-default-700 mb-4">
            Data deletion is just one of your privacy rights. You also have the right to:
          </p>
          <ul className="list-disc pl-6 text-default-700 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Restrict processing of your data</li>
            <li>Object to certain uses of your data</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
        </section>
      </div>
    </div>
  );
}