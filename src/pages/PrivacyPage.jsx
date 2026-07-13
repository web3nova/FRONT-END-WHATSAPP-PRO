import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to BizIQ</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who We Are</h2>
            <p>BizIQ is a product of Web3 Lab Concept, a technology company registered in Nigeria. We provide a WhatsApp business automation platform that helps small and medium businesses manage customer conversations, orders, and their online presence.</p>
            <p className="mt-2">For questions about this policy, contact us at: <a href="mailto:biziqonline@gmail.com" className="text-blue-600 hover:underline">biziqonline@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
            <p>We collect the following information when you use BizIQ:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account information:</strong> your name, email address, and password when you sign up</li>
              <li><strong>Business information:</strong> business name, phone number, address, and other details you provide during onboarding</li>
              <li><strong>WhatsApp data:</strong> messages, customer conversations, and interaction data processed through your connected WhatsApp Business account</li>
              <li><strong>Customer data:</strong> contact details and order information of your customers that flows through our platform</li>
              <li><strong>Usage data:</strong> how you interact with the BizIQ dashboard, pages visited, and features used</li>
              <li><strong>Payment information:</strong> billing details processed through our payment providers (we do not store card numbers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide and operate the BizIQ platform</li>
              <li>To power the AI assistant that responds to your customers on WhatsApp</li>
              <li>To send you notifications about your account, orders, and escalations</li>
              <li>To process payments for your subscription</li>
              <li>To send weekly performance reports if you have enabled that preference</li>
              <li>To improve our platform and fix issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. WhatsApp and Meta Data</h2>
            <p>BizIQ integrates with the Meta WhatsApp Business API. By connecting your WhatsApp account to BizIQ, you agree to Meta's WhatsApp Business Terms of Service. We access your WhatsApp messages solely to operate the automation features you have configured. We do not sell or share WhatsApp conversation data with third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>AI providers</strong> (e.g. Anthropic, OpenAI) to power the AI assistant — only conversation content needed for a response is sent</li>
              <li><strong>Payment processors</strong> to handle billing</li>
              <li><strong>Infrastructure providers</strong> (cloud hosting, databases) who process data on our behalf under strict agreements</li>
              <li><strong>Meta</strong> as required to operate the WhatsApp Business API integration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you cancel your account, we delete your data within 30 days, except where we are required to retain it by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Security</h2>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls. No method of transmission over the internet is 100% secure — we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <a href="mailto:biziqonline@gmail.com" className="text-blue-600 hover:underline">biziqonline@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Cookies</h2>
            <p>We use essential cookies to keep you logged in and maintain your session. We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of BizIQ after changes means you accept the updated policy.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
