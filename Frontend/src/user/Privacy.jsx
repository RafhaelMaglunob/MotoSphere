import React from 'react';
import { useNavigate } from 'react-router-dom';
import MotoSphere_logo from '../component/img/MotoSphere Logo.png';

function Privacy() {
  const navigate = useNavigate();


  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-6">
      <div className="max-w-4xl mx-auto">
        { }
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={MotoSphere_logo} alt="MotoSphere" className="w-16 h-16" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>

        { }
        <div className="bg-[#0F1729]/90 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
          <p className="text-sm text-[#94A3B8] mb-6">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-[#CCCCCC]">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
              <p>
                Welcome to MotoSphere. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our smart helmet system service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.1 Personal Information</h3>
              <p>We collect personal information that you provide to us, including:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><strong>Account Information:</strong> Username, email address, phone number, address</li>
                <li><strong>Profile Information:</strong> Profile picture, device ID</li>
                <li><strong>Authentication Data:</strong> Password (hashed), two-factor authentication settings</li>
                <li><strong>Emergency Contacts:</strong> Names and contact information of your emergency contacts</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.2 Usage Data</h3>
              <p>We automatically collect information about how you use the Service:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><strong>Location Data:</strong> GPS coordinates for tracking and emergency services</li>
                <li><strong>Sensor Data:</strong> Accelerometer, gyroscope, and other helmet sensor readings</li>
                <li><strong>Device Information:</strong> Device model, operating system, unique device identifiers</li>
                <li><strong>Activity Logs:</strong> Login attempts, system activity, alert history</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.3 Technical Data</h3>
              <p>We collect technical information including:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>IP address and network information</li>
                <li>Browser type and version</li>
                <li>Time zone and language preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve the MotoSphere service</li>
                <li><strong>Accident Detection:</strong> To detect accidents and trigger emergency alerts</li>
                <li><strong>Emergency Response:</strong> To notify emergency contacts and services in case of incidents</li>
                <li><strong>Account Management:</strong> To manage your account, verify your identity, and process registrations</li>
                <li><strong>Communication:</strong> To send you important notifications, updates, and alerts</li>
                <li><strong>Security:</strong> To detect and prevent fraud, unauthorized access, and security threats</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve our services</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and respond to legal requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Data Sharing and Disclosure</h2>
              <p>We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.1 Emergency Services</h3>
              <p>
                In the event of an accident or emergency, we may share your location and personal information with:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Emergency response services (ambulance, police, fire department)</li>
                <li>Your designated emergency contacts</li>
                <li>Medical personnel if necessary</li>xxx
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.2 Service Providers</h3>
              <p>We may share data with trusted third-party service providers who:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Host our servers and databases</li>
                <li>Process payments (if applicable)</li>
                <li>Send emails and SMS notifications</li>
                <li>Provide analytics services</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.3 Legal Requirements</h3>
              <p>We may disclose your information if required by law or to:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Comply with legal processes or government requests</li>
                <li>Enforce our Terms and Conditions</li>
                <li>Protect our rights, privacy, safety, or property</li>
                <li>Prevent or investigate potential fraud or security threats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal data:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><strong>Encryption:</strong> Data in transit is encrypted using SSL/TLS protocols</li>
                <li><strong>Password Security:</strong> Passwords are hashed using bcrypt</li>
                <li><strong>Authentication:</strong> Multi-factor authentication support for additional security</li>
                <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                <li><strong>Regular Updates:</strong> Security patches and updates applied regularly</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for security threats and vulnerabilities</li>
              </ul>
              <p className="mt-3 text-yellow-400">
                <strong>However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Your Privacy Rights</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing (where applicable)</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us at <strong>support@motosphere.com</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Data Retention</h2>
              <p>
                We retain your personal data for as long as necessary to provide the Service and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Data deleted within 30 days of account deletion, except:</li>
                <li>Data required for legal compliance may be retained longer</li>
                <li>Anonymized analytics data may be retained indefinitely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Authenticate your sessions</li>
                <li>Analyze usage patterns</li>
                <li>Improve service performance</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings, but this may affect service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Children's Privacy</h2>
              <p>
                MotoSphere is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Service, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Sending an email to your registered email address</li>
                <li>Posting a notice on our website</li>
                <li>Displaying a notification within the Service</li>
              </ul>
              <p className="mt-3">
                Continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">12. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="mt-2 ml-4 space-y-1">
                <li><strong>Email:</strong> support@motosphere.com</li>
                <li><strong>Privacy Officer:</strong> privacy@motosphere.com</li>
                <li><strong>Phone:</strong> +63 XXX XXX XXXX</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">13. Consent</h2>
              <p>
                By using MotoSphere, you consent to the collection and use of your information as described in this Privacy Policy. If you do not agree with this policy, please do not use our Service.
              </p>
            </section>
          </div>

          <div className="mt-8 p-4 bg-[#0A1A3A] rounded-lg border border-[#22D3EE]/30">
            <p className="text-center text-[#9BB3D6]">
              By using MotoSphere, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Privacy;
