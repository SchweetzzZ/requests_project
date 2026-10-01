import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Solicitações Internas</h1>
      <p className="mt-2 text-neutral-600">Bem-vindo ao sistema de solicitações internas.</p>
    </div>
  );
}
