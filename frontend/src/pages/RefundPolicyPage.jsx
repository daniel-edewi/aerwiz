import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

const RefundPolicyPage = () => (
  <div className="bg-white">
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-14 px-4 text-center">
      <h1 className="text-4xl font-extrabold mb-2">Refund Policy</h1>
      <p className="text-blue-200 text-sm">Last updated: April 2026</p>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Important:</strong> Aerwiz is a flight booking intermediary. Refund eligibility is determined by the airline and the fare rules that applied at the time of booking — not by Aerwiz. We will always act on your behalf to process your refund request as quickly as possible.
        </p>
      </div>

      <Section title="1. Refund Eligibility">
        <p>Whether your ticket is refundable depends on the fare type you purchased:</p>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="font-bold text-green-800 mb-1">Fully Refundable Fares</p>
            <p>If you purchased a fully refundable fare, you are entitled to a full refund of the ticket price (less any applicable airline cancellation fees) if you cancel before departure.</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="font-bold text-yellow-800 mb-1">Partially Refundable Fares</p>
            <p>Some fares allow partial refunds subject to airline cancellation penalties. The refundable amount will be calculated based on the airline's fare rules.</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="font-bold text-red-800 mb-1">Non-Refundable Fares</p>
            <p>Most economy promotional fares are non-refundable. If you cancel a non-refundable ticket, you will not receive a refund of the base fare. Taxes and airport charges may still be recoverable — contact us to check.</p>
          </div>
        </div>
      </Section>

      <Section title="2. Airline-Initiated Cancellations">
        <p>If your flight is cancelled by the airline, you are entitled to either:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>A full refund of the ticket price, or</li>
          <li>Rebooking on an alternative flight at no additional cost</li>
        </ul>
        <p>Aerwiz will contact you as soon as we are notified of an airline-initiated cancellation and will process your preferred option promptly.</p>
      </Section>

      <Section title="3. How to Request a Refund">
        <p>To request a cancellation and refund:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Log into your Aerwiz account and go to <strong>My Bookings</strong>.</li>
          <li>Select the booking you wish to cancel and click <strong>Request Cancellation</strong>.</li>
          <li>Alternatively, email us at <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a> with your booking reference and last name.</li>
          <li>Our team will confirm your refund eligibility within 24 hours.</li>
        </ol>
      </Section>

      <Section title="4. Refund Processing Times">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-700 border-b border-gray-200">Refund Type</th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 border-b border-gray-200">Processing Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-3 text-gray-600">Airline-approved refund to card</td><td className="px-4 py-3 text-gray-600">7–14 business days</td></tr>
              <tr><td className="px-4 py-3 text-gray-600">Airline-approved refund to bank</td><td className="px-4 py-3 text-gray-600">5–10 business days</td></tr>
              <tr><td className="px-4 py-3 text-gray-600">Aerwiz service fee</td><td className="px-4 py-3 text-gray-600">Non-refundable</td></tr>
              <tr><td className="px-4 py-3 text-gray-600">Tax/airport charge recovery</td><td className="px-4 py-3 text-gray-600">10–21 business days</td></tr>
            </tbody>
          </table>
        </div>
        <p>Refund timelines are dependent on your bank and the airline. Aerwiz has no control over delays on the airline or banking side once a refund has been approved.</p>
      </Section>

      <Section title="5. Aerwiz Service Fee">
        <p>Aerwiz charges a service fee that is included in the total price displayed at checkout. This service fee is non-refundable in all circumstances, including voluntary cancellations and airline-initiated cancellations, as it covers the cost of processing your booking.</p>
      </Section>

      <Section title="6. No-Show Policy">
        <p>If you fail to board your flight without cancelling in advance (a "no-show"), most airlines will forfeit the entire ticket value. Aerwiz cannot process refunds for no-shows unless the airline's fare rules specifically permit it. Contact us before your departure time if you are unable to travel.</p>
      </Section>

      <Section title="7. Voluntary Changes (Date / Route)">
        <p>If you wish to change your flight date or route rather than cancel, change fees and fare differences are set by the airline. Some fares do not permit changes at all. Contact our support team and we will check your options and applicable fees before making any changes.</p>
      </Section>

      <Section title="8. Contact Us">
        <p>For any refund enquiries, reach us at:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email: <a href="mailto:support@aerwiz.com" className="text-blue-600 hover:underline">support@aerwiz.com</a></li>
          <li>Phone / WhatsApp: +234 800 000 0000</li>
          <li>Hours: 24 hours a day, 7 days a week</li>
        </ul>
        <p>Please have your booking reference number ready when you contact us.</p>
      </Section>
    </div>
  </div>
);

export default RefundPolicyPage;
