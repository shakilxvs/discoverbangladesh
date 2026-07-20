import { SpotForm } from '@/components/admin/SpotForm';

export default function NewSpotPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-neutral-900 dark:text-white">
        New spot
      </h1>
      <SpotForm />
    </div>
  );
}
