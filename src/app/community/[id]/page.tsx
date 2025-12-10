import { notFound } from 'next/navigation';

export default function CommunityPage({ params }: { params: { id: string } }) {
  // For now, just show a basic page
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Page</h1>
      <p>Community ID: {params.id}</p>
    </div>
  );
}

// This will be used to generate static paths at build time
export async function generateStaticParams() {
  // Return an empty array for now
  return [];
}
