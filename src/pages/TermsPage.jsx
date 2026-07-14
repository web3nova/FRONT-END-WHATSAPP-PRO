import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to BizIQ</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account or using BizIQ, you agree to these Terms of Service. BizIQ is operated by Web3 Lab Concept ("we", "us", "our"). If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>BizIQ is a WhatsApp business automation platform that allows businesses to automate customer conversations using AI, manage orders, build a storefront, and access business analytics. Features are provided on a subscription basis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Account Registration</h2>
            <p>You must provide accurate information when creating your account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use BizIQ. Each account represents one business (tenant) unless otherwise agreed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Subscription and Billing</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>BizIQ offers a 14-day free trial. No payment is required during the trial.</li>
              <li>After the trial, continued use requires a paid subscription.</li>
              <li>Subscription fees are billed in advance and are non-refundable unless required by law.</li>
              <li>We may change pricing with 30 days notice. Continued use after the notice period constitutes acceptance.</li>
              <li>Failed payments may result in suspension of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Acceptable Use</h2>
            <p>You agree not to use BizIQ to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Send spam, unsolicited messages, or bulk promotional messages that violate WhatsApp's policies</li>
              <li>Harass, threaten, or deceive customers or other users</li>
              <li>Violate any applicable Nigerian or international laws</li>
              <li>Attempt to reverse-engineer, hack, or disrupt the platform</li>
              <li>Resell or sublicense BizIQ without our written permission</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. WhatsApp and Meta Compliance</h2>
            <p>By using BizIQ's WhatsApp integration, you agree to comply with Meta's WhatsApp Business Policy and Commerce Policy. You are solely responsible for the content of messages sent through your account and for ensuring your use complies with Meta's terms. BizIQ is not responsible for actions Meta takes against your WhatsApp account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. AI-Generated Content</h2>
            <p>BizIQ uses AI to generate responses to your customers. You acknowledge that AI responses may occasionally be inaccurate or inappropriate. You are responsible for reviewing AI behaviour and configuring your knowledge base to ensure accurate responses. BizIQ is not liable for any loss resulting from AI-generated content sent to your customers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Data Ownership</h2>
            <p>You retain ownership of your business data and customer data. By using BizIQ, you grant us a limited licence to process that data solely to operate the platform on your behalf. We do not claim ownership of your content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Service Availability</h2>
            <p>We aim for high availability but do not guarantee uninterrupted service. We are not liable for downtime caused by third-party services (Meta, cloud providers, payment processors) or events outside our control.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Web3 Lab Concept's total liability to you for any claim arising from use of BizIQ shall not exceed the amount you paid us in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages including lost revenue or lost customers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Termination</h2>
            <p>You may cancel your account at any time from your dashboard settings. We may suspend or terminate your account immediately if you breach these terms. Upon termination, your data will be deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Governing Law</h2>
            <p>These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in Nigerian courts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Contact</h2>
            <p>For questions about these terms, contact us on WhatsApp at <a href="https://wa.me/2348029545794" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">+234 802 954 5794</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
