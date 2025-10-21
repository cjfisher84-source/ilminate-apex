'use client';

import React from 'react';

type TechniqueScore = { techniqueID: string; score: number };
type Layer = { 
  name: string; 
  description?: string; 
  techniques: TechniqueScore[]; 
  gradient?: { colors: string[] } 
};
type TechniqueMeta = { id: string; name: string; tactics: string[] };

function scoreToAlpha(score: number, max: number) { 
  if (!max) return 0; 
  const x = Math.min(score / max, 1); 
  return 0.15 + x * 0.85; 
}

export default function AttackMatrix({ 
  layer, 
  meta, 
  onClickTechnique 
}: {
  layer: Layer; 
  meta: TechniqueMeta[]; 
  onClickTechnique?: (techId: string) => void;
}) {
  const scoreMap = new Map(layer.techniques.map(t => [t.techniqueID, t.score]));
  const maxScore = Math.max(1, ...layer.techniques.map(t => t.score));
  
  const tacticOrder = [
    'Reconnaissance',
    'Resource Development',
    'Initial Access',
    'Execution',
    'Persistence',
    'Privilege Escalation',
    'Defense Evasion',
    'Credential Access',
    'Discovery',
    'Lateral Movement',
    'Collection',
    'Command And Control',
    'Exfiltration',
    'Impact'
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-2">{layer.name}</h2>
      {layer.description && <p className="text-sm opacity-80">{layer.description}</p>}
      
      <div className="overflow-x-auto rounded-2xl mt-2 border border-white/10">
        <div 
          className="min-w-[900px] grid" 
          style={{ gridTemplateColumns: `200px repeat(${tacticOrder.length}, minmax(120px, 1fr))` }}
        >
          {/* Header row */}
          <div className="sticky left-0 z-10 bg-black/5 dark:bg-white/5 p-3 font-semibold border-b border-white/10">
            Technique
          </div>
          {tacticOrder.map(t => (
            <div 
              key={t} 
              className="p-3 text-sm font-semibold text-center bg-black/5 dark:bg-white/5 border-b border-white/10"
            >
              {t}
            </div>
          ))}

          {/* Technique rows */}
          {meta.map(tech => {
            const score = scoreMap.get(tech.id) || 0;
            const alpha = scoreToAlpha(score, maxScore);
            const base = `rgba(0, 168, 168, ${alpha})`; // UNCW teal with dynamic alpha
            
            return (
              <React.Fragment key={tech.id}>
                <div className="sticky left-0 z-10 bg-background p-2 border-b border-white/10">
                  <button 
                    onClick={() => onClickTechnique?.(tech.id)} 
                    className="text-left hover:underline w-full"
                    title={`${tech.id} — ${tech.name}`}
                  >
                    <div className="text-sm font-medium">{tech.id}</div>
                    <div className="text-xs opacity-80">{tech.name}</div>
                  </button>
                </div>
                
                {tacticOrder.map(tac => {
                  const active = tech.tactics.includes(tac);
                  return (
                    <div 
                      key={tech.id + tac} 
                      className={`border-b border-white/5 ${active ? '' : 'opacity-20'}`}
                      style={{ 
                        background: active && score ? base : 'transparent',
                        minHeight: '48px'
                      }}
                      title={active ? `${tech.id} score ${score}` : ''}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      <div className="mt-2 text-xs opacity-70">
        Max technique count: {maxScore}
      </div>
    </div>
  );
}

