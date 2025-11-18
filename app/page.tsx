'use client';

import { ControlPanel } from '@/app/components/ControlPanel';
import { MapContainer } from '@/app/components/MapContainer';
import { ToastProvider, useToast } from '@/app/components/Toast';
import { Tower, Link } from '@/app/types';
import { useState } from 'react';

function HomeContent() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [connectingTowerId, setConnectingTowerId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  const addTower = (lat: number, lng: number) => {
    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      lat,
      lng,
      frequency: 5.0, // Default 5 GHz
    };
    setTowers([...towers, newTower]);
    showToast(`Tower added at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
  };

  const updateTower = (id: string, updates: Partial<Tower>) => {
    setTowers(towers.map(tower =>
      tower.id === id ? { ...tower, ...updates } : tower
    ));
  };

  const deleteTower = (id: string) => {
    setTowers(towers.filter(tower => tower.id !== id));
    setLinks(links.filter(link => link.tower1Id !== id && link.tower2Id !== id));
    if (selectedTower === id) setSelectedTower(null);
    showToast('Tower deleted successfully', 'success');
  };

  const handleTowerClick = (towerId: string) => {
    if (connectingTowerId) {
      // Second tower selected - attempt to create link
      if (connectingTowerId !== towerId) {
        const tower1 = towers.find(t => t.id === connectingTowerId);
        const tower2 = towers.find(t => t.id === towerId);

        if (tower1 && tower2) {
          if (tower1.frequency === tower2.frequency) {
            // Check if link already exists
            const linkExists = links.some(link =>
              (link.tower1Id === connectingTowerId && link.tower2Id === towerId) ||
              (link.tower1Id === towerId && link.tower2Id === connectingTowerId)
            );

            if (!linkExists) {
              const newLink: Link = {
                id: `link-${Date.now()}`,
                tower1Id: connectingTowerId,
                tower2Id: towerId,
                frequency: tower1.frequency,
              };
              setLinks([...links, newLink]);
              showToast(`Link created successfully at ${tower1.frequency} GHz`, 'success');
            } else {
              showToast('Link already exists between these towers', 'info');
            }
          } else {
            showToast('Cannot connect towers with different frequencies!', 'error');
          }
        }
      }
      setConnectingTowerId(null);
    } else {
      // First tower selected
      setSelectedTower(towerId);
    }
  };

  const startConnecting = (towerId: string) => {
    setConnectingTowerId(towerId);
    setSelectedTower(null);
    setSelectedLink(null);
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    if (selectedLink === id) setSelectedLink(null);
    showToast('Link deleted successfully', 'success');
  };

  const handleLinkClick = (linkId: string | null) => {
    setSelectedLink(linkId);
    setSelectedTower(null);
    setConnectingTowerId(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-500 w-12 h-12 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 flex items-center justify-center hover:bg-white transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-slate-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <ControlPanel
        towers={towers}
        links={links}
        selectedTower={selectedTower}
        selectedLink={selectedLink}
        connectingTowerId={connectingTowerId}
        onTowerUpdate={updateTower}
        onTowerDelete={deleteTower}
        onTowerSelect={setSelectedTower}
        onLinkDelete={deleteLink}
        onLinkSelect={setSelectedLink}
        onStartConnecting={startConnecting}
        onCancelConnecting={() => setConnectingTowerId(null)}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
      <MapContainer
        towers={towers}
        links={links}
        selectedTower={selectedTower}
        selectedLink={selectedLink}
        connectingTowerId={connectingTowerId}
        onMapClick={addTower}
        onTowerClick={handleTowerClick}
        onLinkClick={handleLinkClick}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
