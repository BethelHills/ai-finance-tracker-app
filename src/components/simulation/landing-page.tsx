'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Shield, 
  Zap, 
  Globe, 
  CreditCard, 
  TrendingUp,
  Users,
  Building2,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useSimulation } from '@/lib/simulation/simulation-context';

export function SimulationLandingPage() {
  const { toggleSimulationMode } = useSimulation();

  const features = [
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Multi-Currency Support",
      description: "Manage accounts in USD, EUR, GBP, NGN, and more",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get intelligent spending analysis and recommendations",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Payment Rails",
      description: "Paystack, Stripe, Plaid integration for worldwide coverage",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-Level Security",
      description: "Enterprise-grade security with compliance standards",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Share insights and manage finances with your team",
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Business Tools",
      description: "Advanced features for business financial management",
    },
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: <Users className="h-4 w-4" /> },
    { label: "Transactions Processed", value: "$2.5B+", icon: <CreditCard className="h-4 w-4" /> },
    { label: "Countries Supported", value: "40+", icon: <Globe className="h-4 w-4" /> },
    { label: "Uptime", value: "99.9%", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Zap className="h-3 w-3 mr-1" />
              SIMULATION MODE
            </Badge>
            <Badge variant="outline">DEMO VERSION</Badge>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Finance Tracker
            <span className="block text-3xl text-blue-600 mt-2">
              Global Financial Management Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the future of personal and business finance with AI-powered insights, 
            multi-currency support, and global payment integration. All in a safe simulation environment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={toggleSimulationMode}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Simulation
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Finance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your finances with confidence and intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Simulation Notice */}
      <div className="container mx-auto px-6 py-16">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-yellow-600" />
                <h3 className="text-xl font-semibold text-yellow-800">
                  Safe Simulation Environment
                </h3>
              </div>
              <p className="text-yellow-700 mb-6 max-w-2xl mx-auto">
                This is a demonstration version of our AI Finance Tracker. All data shown is simulated 
                and no real financial information is processed. Experience the full functionality 
                without any risk to your actual finances.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-yellow-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>No Real Money Involved</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Simulated Data Only</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Full Feature Access</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Secure Environment</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience the Future of Finance?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start the simulation to explore all features and see how AI can transform your financial management.
          </p>
          <Button 
            onClick={toggleSimulationMode}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <Play className="h-5 w-5 mr-2" />
            Launch Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}
