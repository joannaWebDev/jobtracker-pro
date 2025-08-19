import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Find user by email (consistent with API endpoints)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      appliedAt: "desc",
    },
  });

  // Convert Date objects to strings for client component
  const formattedApplications = applications.map(app => ({
    ...app,
    appliedAt: app.appliedAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Job Applications</h1>
        <div className="text-sm text-gray-500">
          {applications.length} applications tracked
        </div>
      </div>

      <DashboardClient initialApplications={formattedApplications} />
    </div>
  );
}