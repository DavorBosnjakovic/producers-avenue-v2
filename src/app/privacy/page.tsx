// File: page.tsx
// Path: /src/app/privacy/page.tsx
// Privacy Policy page

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: November 9, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-12 prose prose-gray dark:prose-invert max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Welcome to Producers Avenue. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our platform and tell you about your privacy rights and how the law protects you.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              This privacy policy applies to information we collect about you when you use our platform, services, or otherwise interact with us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We collect and process the following types of information:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Account information (name, email, username, password)</li>
              <li>Profile information (bio, location, website, avatar)</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Content you create (posts, products, services, messages)</li>
              <li>Communications with us (support tickets, emails)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Location data (if you grant permission)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>To provide and maintain our platform</li>
              <li>To process your transactions and send you related information</li>
              <li>To send you technical notices, updates, security alerts</li>
              <li>To respond to your comments, questions, and customer service requests</li>
              <li>To communicate with you about products, services, offers, and events</li>
              <li>To monitor and analyze trends, usage, and activities</li>
              <li>To detect, prevent, and address technical issues and fraudulent activity</li>
              <li>To personalize and improve your experience</li>
              <li>To facilitate communication between users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. How We Share Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li><strong>With other users:</strong> Your profile information and content you post are visible to other users</li>
              <li><strong>With service providers:</strong> We share data with third-party vendors who perform services on our behalf (payment processing, hosting, analytics)</li>
              <li><strong>For legal reasons:</strong> We may disclose information if required by law or in response to valid legal requests</li>
              <li><strong>Business transfers:</strong> In connection with any merger, sale of assets, financing, or acquisition</li>
              <li><strong>With your consent:</strong> We may share information for any other purpose with your consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              When you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Your Privacy Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent at any time where we rely on consent</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400">
              To exercise these rights, please contact us at privacy@producersavenue.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              We use the following types of cookies:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li><strong>Essential cookies:</strong> Required for the platform to function</li>
              <li><strong>Analytics cookies:</strong> Help us understand how users interact with our platform</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing cookies:</strong> Track your activity to show relevant ads</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Third-Party Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              We integrate with the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Stripe (payment processing)</li>
              <li>Google OAuth (authentication)</li>
              <li>Analytics services</li>
              <li>Email delivery services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our platform is not intended for children under the age of 13. We do not knowingly collect personal data from children under 13. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. International Data Transfers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your information may be transferred to and processed in countries other than your own. These countries may have data protection laws that are different from the laws of your country. We take steps to ensure that your data receives an adequate level of protection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              13. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Email: privacy@producersavenue.com
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              By using Producers Avenue, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}