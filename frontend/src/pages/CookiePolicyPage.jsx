import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const CookiePolicyPage = () => (
  <div className="bg-white">
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-14 px-4 text-center">
      <h1 className="text-4xl font-extrabold mb-2">Cookie Policy</h1>
      <p className="text-blue-200 text-sm">Last updated: April 2026</p>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">

      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, such as your login status and preferences, making your next visit easier and the site more useful to you.</p>
      </Section>

      <Section title="2. How Aerwiz Uses Cookies">
        <p>Aerwiz uses cookies to provide a functional, secure, and personalised experience. We do not use cookies to serve third-party advertising.</p>
      </Section>

      <Section title="3. Types of Cookies We Use">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">Essential Cookies</p>
            <p>Required for the website to function. These include session cookies that keep you logged in and security tokens that protect your account. These cannot be disabled.</p>
            <p className="text-xs text-gray-400 mt-1">Examples: authentication token, session ID, CSRF protection</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">Functional Cookies</p>
            <p>Remember your preferences such as search parameters, cabin class selection, and recently searched routes to improve your booking experience.</p>
            <p className="text-xs text-gray-400 mt-1">Examples: search preferences, language settings</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">Analytics Cookies</p>
            <p>Help us understand how visitors use Aerwiz so we can improve the platform. Data is aggregated and anonymised — we cannot identify individual users from analytics data.</p>
            <p className="text-xs text-gray-400 mt-1">Examples: page views, session duration, error tracking</p>
          </div>
        </div>
      </Section>

      <Section title="4. Cookies We Do Not Use">
        <p>Aerwiz does not use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Third-party advertising or tracking cookies</li>
          <li>Social media tracking pixels</li>
          <li>Cookies that track your activity across other websites</li>
        </ul>
      </Section>

      <Section title="5. Managing Cookies">
        <p>You can control cookies through your browser settings. Most browsers allow you to refuse or delete cookies. However, disabling essential cookies will prevent you from logging in or completing bookings on Aerwiz.</p>
        <p>How to manage cookies in popular browsers:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
        </ul>
      </Section>

      <Section title="6. Cookie Lifespan">
        <p>Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period — typically 30 days for authentication and up to 12 months for preference cookies — unless you delete them earlier.</p>
      </Section>

      <Section title="7. Changes to This Policy">
        <p>We may update this Cookie Policy to reflect changes in our practices or for legal reasons. We will update the date at the top of this page when changes are made.</p>
      </Section>

      <Section title="8. Contact">
        <p>For questions about our use of cookies, contact us at <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a>.</p>
      </Section>
    </div>
  </div>
);

export default CookiePolicyPage;
