import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const TermsPage = () => (
  <div className="bg-white">
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-14 px-4 text-center">
      <h1 className="text-4xl font-extrabold mb-2">Terms & Conditions</h1>
      <p className="text-blue-200 text-sm">Last updated: April 2026</p>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using the Aerwiz platform (aerwiz.com), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services. These terms apply to all users including guests, registered users, and affiliates.</p>
      </Section>

      <Section title="2. Our Services">
        <p>Aerwiz is a flight booking intermediary. We connect travellers with airlines through the Amadeus Global Distribution System (GDS). We do not operate any airline and are not responsible for flight operations, schedules, delays, or cancellations.</p>
        <p>Our services include flight search, booking, e-ticket delivery, price alerts, baggage information, and seat selection assistance.</p>
      </Section>

      <Section title="3. Booking and Payment">
        <ul className="list-disc pl-5 space-y-1">
          <li>All bookings are subject to airline availability and fare rules at the time of booking.</li>
          <li>Fares are not guaranteed until full payment has been received and a booking reference has been issued.</li>
          <li>Payments are processed in Nigerian Naira (NGN) via Paystack. By completing a payment, you agree to Paystack's terms of service.</li>
          <li>Aerwiz charges a service fee which is included in the displayed total price. No additional fees are charged after booking.</li>
          <li>You are responsible for ensuring all passenger details entered are accurate and match valid travel documents. Aerwiz is not liable for costs arising from incorrect passenger information.</li>
        </ul>
      </Section>

      <Section title="4. Cancellations and Refunds">
        <p>Cancellation and refund policies are determined by the airline and fare type selected at the time of booking. Aerwiz will facilitate refund requests on your behalf but cannot guarantee a refund where the airline's fare rules do not permit one.</p>
        <p>Please refer to our Refund Policy for full details on how to request a cancellation or refund.</p>
      </Section>

      <Section title="5. Passenger Responsibility">
        <ul className="list-disc pl-5 space-y-1">
          <li>It is your responsibility to ensure you hold a valid passport and any required visas for your destination and transit countries.</li>
          <li>You must check in within the airline's required check-in window. Aerwiz is not responsible for missed flights due to late check-in.</li>
          <li>Baggage allowances are set by the airline. Aerwiz provides indicative baggage information but the airline's published policy takes precedence.</li>
          <li>You are responsible for complying with all applicable laws, including import/export restrictions and health requirements of your destination.</li>
        </ul>
      </Section>

      <Section title="6. Limitation of Liability">
        <p>Aerwiz acts as an intermediary and is not liable for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Flight delays, cancellations, or schedule changes by airlines</li>
          <li>Loss or damage to baggage</li>
          <li>Denied boarding by an airline</li>
          <li>Losses arising from visa refusal or immigration issues</li>
          <li>Force majeure events including natural disasters, pandemics, or government actions</li>
        </ul>
        <p>Our maximum liability in any circumstance shall not exceed the amount paid by you for the relevant booking.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>All content on the Aerwiz platform including logos, text, graphics, and software is the property of Aerwiz and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
      </Section>

      <Section title="8. User Accounts">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. Aerwiz reserves the right to suspend or terminate accounts that violate these terms.</p>
      </Section>

      <Section title="9. Governing Law">
        <p>These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the jurisdiction of Nigerian courts.</p>
      </Section>

      <Section title="10. Changes to Terms">
        <p>Aerwiz reserves the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the platform constitutes acceptance of the revised terms.</p>
      </Section>

      <Section title="11. Contact">
        <p>For questions about these Terms, contact us at <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a>.</p>
      </Section>
    </div>
  </div>
);

export default TermsPage;
