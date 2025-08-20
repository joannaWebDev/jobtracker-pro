"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/auth";
import { useSearchState } from "@/hooks/useSearchState";
import { usePathname } from "next/navigation";
import React from "react";

export default function SmartNavbar() {
  const { data: session } = useSession();
  const { navigateToJobs } = useSearchState();
  const pathname = usePathname();

  const handleJobsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateToJobs();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="JobTracker Pro"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                JobTracker Pro
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleJobsClick}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/jobs'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Jobs
            </button>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
