import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Portlandia Logistics',
  description: 'Privacy Policy for Portlandia Logistics - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <p className="text-gray-600 mb-8">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Portlandia Logistics ("we," "us," or "our") respects your privacy and is committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website,
            use our services, or interact with us.
          </p>
          <p className="text-gray-700 mb-4">
            This policy complies with applicable privacy laws, including the California Consumer Privacy Act (CCPA) and other
            relevant regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

          <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
          <p className="text-gray-700 mb-4">
            We may collect personal information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Name, email address, phone number, and mailing address</li>
            <li>Business information (company name, MC number, DOT number)</li>
            <li>Shipping origin and destination details</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Communication preferences and feedback</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 mb-3">Automatically Collected Information</h3>
          <p className="text-gray-700 mb-4">
            When you visit our website, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>IP address, browser type, and device information</li>
            <li>Pages visited, time spent on site, and referral sources</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use collected information for the following purposes:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Provide freight brokerage and logistics services</li>
            <li>Process quotes, bookings, and payments</li>
            <li>Communicate with you about your shipments</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations and regulatory requirements</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Service Providers:</strong> With carriers, payment processors, and technology partners necessary to provide our services</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or regulatory authority</li>
            <li><strong>Business Protection:</strong> To protect our rights, property, or safety, or that of our customers</li>
            <li><strong>Consent:</strong> With your explicit consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">California Consumer Privacy Act (CCPA) Rights</h2>
          <p className="text-gray-700 mb-4">
            If you are a California resident, you have the following rights under the CCPA:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Right to Know:</strong> Request information about the categories and specific pieces of personal information we have collected</li>
            <li><strong>Right to Delete:</strong> Request deletion of your personal information (subject to certain exceptions)</li>
            <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy,
            comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.
            You can control cookie preferences through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Links</h2>
          <p className="text-gray-700 mb-4">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these sites.
            We encourage you to review the privacy policies of any third-party sites you visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy
            on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700"><strong>Email:</strong> privacy@portlandialogistics.com</p>
            <p className="text-gray-700"><strong>Phone:</strong> (503) 555-0123</p>
            <p className="text-gray-700"><strong>Address:</strong> 123 Logistics Way, Portland, OR 97201</p>
          </div>
          <p className="text-gray-700 mt-4">
            This Privacy Policy is governed by the laws of the State of Oregon.
          </p>
        </section>
      </div>
    </div>
  );
}