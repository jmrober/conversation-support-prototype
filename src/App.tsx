import { useState, useEffect } from 'react';
import ScenariosPage from './pages/ScenariosPage';
import FlowPage from './pages/FlowPage';
import Prototype from './prototype/Prototype';
import PatternLibrary from './pages/PatternLibrary';
import { getFlow, type ScenarioFlow } from './scenarios';

type AppPage = 'scenarios' | 'prototype' | 'flow-diagram' | 'patterns';

export default function App() {
  const [page, setPage] = useState<AppPage>('scenarios');
  const [flowId, setFlowId] = useState<string | null>(null);
  const [diagramFlow, setDiagramFlow] = useState<ScenarioFlow | null>(null);

  useEffect(() => {
    document.body.classList.toggle('prototype-active', page === 'prototype');
  }, [page]);

  const handleSelectFlow = (id: string) => {
    setFlowId(id);
    setPage('prototype');
  };

  const handleViewDiagram = (id: string) => {
    const flow = getFlow(id);
    if (flow) {
      setDiagramFlow(flow);
      setPage('flow-diagram');
    }
  };

  if (page === 'scenarios') {
    return <ScenariosPage onSelectFlow={handleSelectFlow} onViewDiagram={handleViewDiagram} />;
  }

  if (page === 'patterns') {
    return <PatternLibrary onNavigate={(p) => setPage(p as AppPage)} />;
  }

  if (page === 'flow-diagram' && diagramFlow) {
    return <FlowPage flow={diagramFlow} onBack={() => setPage('scenarios')} />;
  }

  return (
    <Prototype
      flowId={flowId}
      onNavigateScenarios={() => setPage('scenarios')}
    />
  );
}
