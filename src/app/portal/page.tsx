import Link from 'next/link';
import { Users, Truck, Building2, UserCheck, BarChart3, Crown } from 'lucide-react';

const portalSections = [
  {
    title: 'Admin Portal',
    description: 'Manage users, system settings, and administrative functions',
    href: '/portal/admin',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    title: 'Agent Portal',
    description: 'Sales agent tools, leads management, and commission tracking',
    href: '/portal/agent',
    icon: UserCheck,
    color: 'bg-green-500'
  },
  {
    title: 'Carrier Portal',
    description: 'Carrier onboarding, load boards, and payment management',
    href: '/portal/carrier',
    icon: Truck,
    color: 'bg-orange-500'
  },
  {
    title: 'Dispatcher Portal',
    description: 'Load assignment, tracking, and communication tools',
    href: '/portal/dispatcher',
    icon: Building2,
    color: 'bg-purple-500'
  },
  {
    title: 'Leadership Portal',
    description: 'Executive dashboards, analytics, and strategic insights',
    href: '/portal/leadership',
    icon: Crown,
    color: 'bg-red-500'
  },
  {
    title: 'Shipper Portal',
    description: 'Booking management, shipment tracking, and account services',
    href: '/portal/shipper',
    icon: BarChart3,
    color: 'bg-indigo-500'
  }
];

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portlandia Logistics Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access your dedicated portal based on your role and permissions.
            Each portal provides specialized tools and information tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${section.color} text-white mr-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {section.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 font-medium">
                  <span>Access Portal</span>
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you're not sure which portal to access or need assistance with your account,
              please contact our support team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}