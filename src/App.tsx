import { useState, useEffect } from 'react';
import ScenariosPage from './pages/ScenariosPage';
import Prototype from './prototype/Prototype';

type AppPage = 'scenarios' | 'prototype';

export default function App() {
  const [page, setPage] = useState<AppPage>('scenarios');
  const [flowId, setFlowId] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle('prototype-active', page === 'prototype');
  }, [page]);

  const handleSelectFlow = (id: string) => {
    setFlowId(id);
    setPage('prototype');
  };

  if (page === 'scenarios') {
    return <ScenariosPage onSelectFlow={handleSelectFlow} />;
  }

  return (
    <Prototype
      flowId={flowId}
      onNavigateScenarios={() => setPage('scenarios')}
    />
  );
}
