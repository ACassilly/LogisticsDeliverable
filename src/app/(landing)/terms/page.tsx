import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Portlandia Logistics',
  description: 'Terms of Service for Portlandia Logistics - Review our terms and conditions for freight brokerage and logistics services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <p className="text-gray-600 mb-8">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            Welcome to Portlandia Logistics. These Terms of Service ("Terms") govern your use of our freight brokerage
            and third-party logistics (3PL) services, website, and any related applications or services (collectively, the "Services").
            By accessing or using our Services, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-700 mb-4">
            If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have
            the authority to bind such entity to these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Services Description</h2>
          <p className="text-gray-700 mb-4">
            Portlandia Logistics is a licensed freight broker providing transportation coordination services. We arrange for
            the transportation of freight by connecting shippers with qualified carriers. We do not directly operate trucks
            or provide transportation services ourselves.
          </p>
          <p className="text-gray-700 mb-4">
            Our services include but are not limited to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Freight brokerage and carrier selection</li>
            <li>Rate negotiation and quote provision</li>
            <li>Shipment tracking and communication</li>
            <li>Documentation and compliance assistance</li>
            <li>Claims administration support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>

          <h3 className="text-xl font-medium text-gray-800 mb-3">Shipper Obligations</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Provide accurate and complete shipment information</li>
            <li>Ensure freight is properly packaged and ready for transportation</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Pay all applicable charges and fees</li>
            <li>Provide access to shipment facilities as needed</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 mb-3">Carrier Obligations</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Maintain valid operating authority and insurance</li>
            <li>Provide safe and timely transportation services</li>
            <li>Comply with all applicable transportation regulations</li>
            <li>Report shipment status and any issues promptly</li>
            <li>Handle freight with appropriate care</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
          <p className="text-gray-700 mb-4">
            Payment terms are specified in individual service agreements or quotes. Generally:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Freight charges are due upon completion of service</li>
            <li>Late payments may incur interest charges</li>
            <li>Disputed charges must be reported within 30 days</li>
            <li>We reserve the right to withhold services for non-payment</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Liability and Insurance</h2>
          <p className="text-gray-700 mb-4">
            Portlandia Logistics maintains appropriate insurance coverage as required by law. However, our liability is limited
            to the extent permitted by applicable law. Carriers are responsible for maintaining adequate cargo insurance.
          </p>
          <p className="text-gray-700 mb-4">
            We recommend shippers obtain appropriate cargo insurance for high-value shipments. Portlandia Logistics does not
            provide cargo insurance but can assist in arranging coverage through approved providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Claims and Disputes</h2>
          <p className="text-gray-700 mb-4">
            Claims for loss or damage must be filed promptly according to carrier policies and applicable law.
            Portlandia Logistics will assist in claims administration but is not liable for carrier actions or omissions.
          </p>
          <p className="text-gray-700 mb-4">
            All claims must be submitted in writing within the timeframes specified by the carrier's tariff or applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Force Majeure</h2>
          <p className="text-gray-700 mb-4">
            Neither party shall be liable for delays or failures in performance due to causes beyond their reasonable control,
            including but not limited to acts of God, natural disasters, war, terrorism, strikes, government regulations,
            or transportation disruptions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
          <p className="text-gray-700 mb-4">
            You agree to indemnify and hold Portlandia Logistics harmless from any claims, damages, losses, or expenses
            arising from your use of our services, violation of these Terms, or infringement of any third-party rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
          <p className="text-gray-700 mb-4">
            Any disputes arising from these Terms or our services shall be resolved through binding arbitration in accordance
            with the rules of the American Arbitration Association. The arbitration shall take place in Portland, Oregon,
            and the arbitrator's decision shall be final and binding.
          </p>
          <p className="text-gray-700 mb-4">
            This arbitration agreement does not preclude either party from seeking injunctive relief in court for matters
            involving intellectual property or confidentiality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the State of Oregon,
            without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms
            will be brought exclusively in the federal or state courts located in Portland, Oregon.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by law, Portlandia Logistics shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
            indirectly, or any loss of data, use, goodwill, or other intangible losses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-700 mb-4">
            Either party may terminate this agreement at any time with written notice. Termination shall not relieve either
            party of obligations incurred prior to the termination date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Terms at any time. Material changes will be communicated via email or
            posted on our website. Continued use of our services after such changes constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Severability</h2>
          <p className="text-gray-700 mb-4">
            If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700"><strong>Email:</strong> legal@portlandialogistics.com</p>
            <p className="text-gray-700"><strong>Phone:</strong> (503) 555-0123</p>
            <p className="text-gray-700"><strong>Address:</strong> 123 Logistics Way, Portland, OR 97201</p>
          </div>
        </section>
      </div>
    </div>
  );
}