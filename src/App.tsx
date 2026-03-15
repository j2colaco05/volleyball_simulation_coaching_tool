import React, { useState, useEffect } from 'react';
import Court from './components/Court';
import { Player as PlayerType } from './types';
import { sampleCurve } from './utils/path';

interface SavedSimulation {
  name: string;
  players: PlayerType[];
}

function App() {
  const initialPlayers: PlayerType[] = [
    {
      id: 'p1',
      name: 'OH',
      team: 'A',
      color: '#00ff00',
      currentPosition: { x: 100, y: 100 },
      anchorPoints: [],
      computedPath: []
    },
    {
      id: 'p2',
      name: 'MB',
      team: 'A',
      color: '#ffff00',
      currentPosition: { x: 200, y: 100 },
      anchorPoints: [],
      computedPath: []
    },
    {
      id: 'p3',
      name: 'RS',
      team: 'A',
      color: '#00ffff',
      currentPosition: { x: 300, y: 100 },
      anchorPoints: [],
      computedPath: []
    },
    {
      id: 'p4',
      name: 'S',
      team: 'A',
      color: '#ff0000',
      currentPosition: { x: 100, y: 200 },
      anchorPoints: [],
      computedPath: []
    },
    {
      id: 'p5',
      name: 'MB',
      team: 'A',
      color: '#ff00ff',
      currentPosition: { x: 200, y: 200 },
      anchorPoints: [],
      computedPath: []
    },
    {
      id: 'p6',
      name: 'OH',
      team: 'A',
      color: '#0000ff',
      currentPosition: { x: 300, y: 200 },
      anchorPoints: [],
      computedPath: []
    }
  ];

  const [players, setPlayers] = useState<PlayerType[]>(initialPlayers.map(p => ({ ...p })));

  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('volleyballSimulations');
    if (saved) {
      setSavedSimulations(JSON.parse(saved));
    }
  }, []);

  const saveSimulations = (sims: SavedSimulation[]) => {
    localStorage.setItem('volleyballSimulations', JSON.stringify(sims));
    setSavedSimulations(sims);
  };

  const handleMove = (id: string, x: number, y: number) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              currentPosition: { x, y },
              computedPath: sampleCurve([{ x, y }, ...p.anchorPoints])
            }
          : p
      )
    );
  };

  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#0000ff');
  const addPlayer = () => {
    if (!newName.trim()) return;
    const id = `p${Date.now()}`;
    setPlayers(prev => [
      ...prev,
      {
        id,
        name: newName,
        team: 'A',
        color: '#0000ff',
        currentPosition: { x: 50, y: 50 },
        anchorPoints: [],
        computedPath: []
      }
    ]);
    setNewName('');
  };

  const deletePlayer = () => {
    if (selectedIds.length === 0) return;
    setPlayers(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const updateSelectedName = () => {
    if (selectedIds.length === 0 || !editName.trim()) return;
    setPlayers(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, name: editName } : p));
  };

  const updateSelectedColor = () => {
    if (selectedIds.length === 0) return;
    setPlayers(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, color: editColor } : p));
  };

  const [saveName, setSaveName] = useState('');
  const saveSimulation = () => {
    if (!saveName.trim()) return;
    const newSim: SavedSimulation = { name: saveName, players: [...players] };
    const updated = [...savedSimulations, newSim];
    saveSimulations(updated);
    setSaveName('');
  };

  const loadSimulation = (sim: SavedSimulation) => {
    setPlayers(sim.players.map(p => ({ ...p }))); // deep copy
  };

  const resetAll = () => {
    setPlayers(initialPlayers.map(p => ({ ...p })));
    setTimeline(0);
    setPlaying(false);
    setSelectedIds([]);
  };

  const deleteSimulation = (idx: number) => {
    const updated = savedSimulations.filter((_, i) => i !== idx);
    saveSimulations(updated);
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (selectedIds.length === 0) return;
    setPlayers(prev =>
      prev.map(p => {
        if (!selectedIds.includes(p.id)) return p;
        const newAnchors = [...p.anchorPoints, { x, y }];
        const computed = sampleCurve([p.currentPosition, ...newAnchors]);
        return { ...p, anchorPoints: newAnchors, computedPath: computed };
      })
    );
  };

  const handleDeleteAnchor = (playerId: string, anchorIdx: number) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id !== playerId) return p;
        const newAnchors = p.anchorPoints.filter((_, i) => i !== anchorIdx);
        const computed = sampleCurve([p.currentPosition, ...newAnchors]);
        return { ...p, anchorPoints: newAnchors, computedPath: computed };
      })
    );
  };

  // animation state
  const [timeline, setTimeline] = useState(0); // 0..1
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);

  const getPosAt = (p: PlayerType, t: number) => {
    if (!p.computedPath || p.computedPath.length === 0) {
      return p.currentPosition;
    }
    const idx = Math.floor(t * (p.computedPath.length - 1));
    return p.computedPath[idx];
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (playing) {
        setTimeline(prev => {
          const next = prev + speed * 0.016; // ~60fps increment
          if (next >= 1) {
            setPlaying(false);
            return 1;
          }
          return next;
        });
      }
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [playing, speed]);


  const displayPlayers = players.map(p => ({
    ...p,
    currentPosition: getPosAt(p, timeline)
  }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', marginBottom: '10px' }}>Volleyball Formation Sandbox</h1>
      <div style={{ color: 'white', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
        Click a player to select/deselect. Selected players show in blue. Click on court to add movement points. Drag players to reposition. Use Play/Pause to animate.
      </div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}>
        <input
          type="text"
          placeholder="Player name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ padding: '5px', borderRadius: '5px', border: 'none' }}
        />
        <button onClick={addPlayer} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#4CAF50', color: 'white' }}>Add Player</button>
        <button onClick={deletePlayer} disabled={selectedIds.length === 0} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: selectedIds.length > 0 ? '#f44336' : '#ccc', color: 'white' }}>Delete Selected Player</button>
        {selectedIds.length > 0 && (
          <>
            <input
              type="text"
              placeholder="Edit name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{ padding: '5px', borderRadius: '5px', border: 'none' }}
            />
            <button onClick={updateSelectedName} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#FF9800', color: 'white' }}>Update Name</button>
            <input
              type="color"
              value={editColor}
              onChange={e => setEditColor(e.target.value)}
              style={{ padding: '5px', borderRadius: '5px', border: 'none' }}
            />
            <button onClick={updateSelectedColor} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#9C27B0', color: 'white' }}>Update Color</button>
          </>
        )}
        <input
          type="text"
          placeholder="Simulation name"
          value={saveName}
          onChange={e => setSaveName(e.target.value)}
          style={{ padding: '5px', borderRadius: '5px', border: 'none' }}
        />
        <button onClick={saveSimulation} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#2196F3', color: 'white' }}>Save Simulation</button>
        <button onClick={resetAll} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#FF5722', color: 'white' }}>Reset All</button>
      </div>
      <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}>
        <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Saved Simulations:</h3>
        {savedSimulations.map((sim, idx) => (
          <div key={idx} style={{ margin: '5px 0' }}>
            <button onClick={() => loadSimulation(sim)} style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#FF9800', color: 'white' }}>
              {sim.name}
            </button>
            <button onClick={() => deleteSimulation(idx)} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#f44336', color: 'white' }}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* animation controls */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}>
        <button onClick={() => setPlaying(p => !p)} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: playing ? '#f44336' : '#4CAF50', color: 'white' }}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => { setTimeline(0); setPlaying(false); }} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#9C27B0', color: 'white' }}>Reset</button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={timeline}
          onChange={e => setTimeline(parseFloat(e.target.value))}
          style={{ width: '200px', margin: '0 1rem' }}
        />
        <label style={{ color: 'white' }}>
          Speed:
          <input
            type="number"
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            style={{ width: '50px', marginLeft: '0.5rem', padding: '5px', borderRadius: '5px', border: 'none' }}
          />
        </label>
      </div>

      <Court
        players={displayPlayers}
        onPlayerMove={handleMove}
        selectedIds={selectedIds}
        onSelectPlayer={handleSelect}
        onSelectionChange={setSelectedIds}
        onCanvasClick={handleCanvasClick}
        onDeleteAnchor={handleDeleteAnchor}
        playing={playing}
      />
    </div>
  );
}

export default App;
