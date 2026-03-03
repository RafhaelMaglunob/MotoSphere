import React from 'react';
import { useNavigate } from 'react-router-dom';
import MotoSphere_logo from '../component/img/MotoSphere Logo.png';

function Terms() {
  const navigate = useNavigate();

  // ✅ Back button fix with fallback
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/"); // fallback if no previous page
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={MotoSphere_logo} alt="MotoSphere" className="w-16 h-16" />
            <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#0F1729]/90 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
          <p className="text-sm text-[#94A3B8] mb-6">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-[#CCCCCC]">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using MotoSphere ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
              <p>
                MotoSphere is a smart helmet system that provides real-time monitoring, GPS tracking, accident detection, and emergency alerts for motorcycle riders. The service includes:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Real-time helmet sensor monitoring</li>
                <li>GPS location tracking</li>
                <li>Accident detection and alerts</li>
                <li>Emergency contact notifications</li>
                <li>User account management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. User Account Requirements</h2>
              <p>To use MotoSphere, you must:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Verify your email address and phone number</li>
                <li>Accept these Terms and Conditions</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. User Responsibilities</h2>
              <p>You are responsible for:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Maintaining the confidentiality of your account password</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your device is properly connected and functioning</li>
                <li>Using the Service in accordance with all applicable laws</li>
                <li>Not sharing your account with others</li>
                <li>Promptly reporting any security breaches or unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Safety Disclaimer</h2>
              <p>
                <strong className="text-yellow-400">IMPORTANT:</strong> MotoSphere is a safety assistance tool but does not guarantee accident prevention or personal safety.
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Is not a substitute for safe riding practices</li>
                <li>May not detect all accidents or emergencies</li>
                <li>Requires proper device installation and maintenance</li>
                <li>Relies on network connectivity which may not always be available</li>
                <li>Should not be relied upon as the sole safety mechanism</li>
              </ul>
              <p className="mt-3">
                <strong>You assume all risks associated with motorcycle riding. Always ride safely and within legal limits.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Data and Privacy</h2>
              <p>
                Your use of MotoSphere is also governed by our Privacy Policy.
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Location data for GPS tracking</li>
                <li>Sensor data for accident detection</li>
                <li>Contact information for emergency notifications</li>
                <li>Device information and usage statistics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Service Availability</h2>
              <p>
                We strive to maintain service availability but do not guarantee uninterrupted access.
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Maintenance and updates</li>
                <li>Technical difficulties</li>
                <li>Network connectivity issues</li>
                <li>Force majeure events</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Prohibited Uses</h2>
              <p>You may not:</p>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the system</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Reverse engineer or decompile the software</li>
                <li>Create false emergency alerts</li>
                <li>Share your account with unauthorized users</li>
                <li>Use automated systems to access the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MotoSphere shall not be liable for damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account if you violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">12. Contact Information</h2>
              <ul className="mt-2 ml-4 space-y-1">
                <li><strong>Email:</strong> support@motosphere.com</li>
                <li><strong>Phone:</strong> +63 XXX XXX XXXX</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">13. Governing Law</h2>
              <p>
                Governed by the laws of the Philippines.
              </p>
            </section>
          </div>

          <div className="mt-8 p-4 bg-[#0A1A3A] rounded-lg border border-[#22D3EE]/30">
            <p className="text-center text-[#9BB3D6]">
              By using MotoSphere, you acknowledge that you agree to these Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
