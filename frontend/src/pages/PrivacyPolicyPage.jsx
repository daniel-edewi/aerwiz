import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const PrivacyPolicyPage = () => (
  <div className="bg-white">
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-14 px-4 text-center">
      <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-blue-200 text-sm">Last updated: April 2026</p>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">

      <Section title="1. Who We Are">
        <p>Aerwiz is an online flight booking platform operated in Nigeria. We provide flight search, booking, and travel management services. References to "Aerwiz", "we", "us" or "our" in this policy refer to the Aerwiz platform and its operators.</p>
        <p>For any privacy-related enquiries, contact us at: <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a></p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect the following personal information when you use Aerwiz:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information:</strong> First name, last name, email address, phone number and password when you register.</li>
          <li><strong>Booking details:</strong> Passenger names, dates of birth, passport numbers, passport expiry dates, nationality, and travel dates required to complete a flight booking.</li>
          <li><strong>Payment information:</strong> We do not store your card details. Payments are processed securely by Paystack. We only retain the transaction reference and amount.</li>
          <li><strong>Contact information:</strong> Any messages you send us via the contact form.</li>
          <li><strong>Usage data:</strong> IP address, browser type, pages visited, and timestamps — collected automatically to improve our service.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use your personal data to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and manage your flight bookings</li>
          <li>Send booking confirmations and e-tickets to your email</li>
          <li>Respond to your enquiries and support requests</li>
          <li>Send price alerts if you have opted in</li>
          <li>Improve our platform and user experience</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
      </Section>

      <Section title="4. Sharing Your Information">
        <p>We share your data only where necessary:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Airlines and GDS (Amadeus):</strong> Passenger details are shared with airlines to fulfil your booking. This is required by aviation regulations.</li>
          <li><strong>Paystack:</strong> Payment data is processed by Paystack under their own privacy policy.</li>
          <li><strong>Legal authorities:</strong> We may disclose information where required by Nigerian law or a court order.</li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain your personal data for as long as your account is active or as needed to provide our services. Booking records are retained for a minimum of 7 years for financial and legal compliance purposes. You may request deletion of your account and associated data at any time by contacting us.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data (subject to legal retention requirements)</li>
          <li>Opt out of marketing communications at any time</li>
        </ul>
        <p>To exercise any of these rights, email us at <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a>.</p>
      </Section>

      <Section title="7. Security">
        <p>We implement industry-standard security measures including SSL encryption on all data transmissions, secure password hashing, and access controls. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and keep your login credentials confidential.</p>
      </Section>

      <Section title="8. Cookies">
        <p>We use cookies to maintain your session and improve your experience. Please refer to our Cookie Policy for full details.</p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of Aerwiz after changes constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="10. Contact Us">
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a> or call +234 800 000 0000.</p>
      </Section>
    </div>
  </div>
);

export default PrivacyPolicyPage;
