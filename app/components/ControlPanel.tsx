'use client';

import React, { useState } from 'react';
import { Tower, Link } from '@/app/types';
import { Button } from '@/app/ui/Button';
import { Input } from '@/app/ui/Input';
import { Label } from '@/app/ui/Label';
import { Card } from '@/app/ui/Card';
import { ScrollArea } from '@/app/ui/ScrollArea';
import { Badge } from '@/app/ui/Badge';
import { Separator } from '@/app/ui/Separator';
import { Trash2, Radio, Link2, MapPin, HelpCircle, X, Check, WifiIcon, MapPinIcon, LinkIcon, HelpCircleIcon, XIcon } from 'lucide-react';

interface ControlPanelProps {
    towers: Tower[];
    links: Link[];
    selectedTower: string | null;
    selectedLink: string | null;
    connectingTowerId: string | null;
    onTowerUpdate: (id: string, updates: Partial<Tower>) => void;
    onTowerDelete: (id: string) => void;
    onTowerSelect: (id: string) => void;
    onLinkDelete: (id: string) => void;
    onLinkSelect: (id: string) => void;
    onStartConnecting: (towerId: string) => void;
    onCancelConnecting: () => void;
    isMobileMenuOpen?: boolean;
    onMobileMenuClose?: () => void;
}

export const ControlPanel = ({
    towers,
    links,
    selectedTower,
    selectedLink,
    connectingTowerId,
    onTowerUpdate,
    onTowerDelete,
    onTowerSelect,
    onLinkDelete,
    onLinkSelect,
    onStartConnecting,
    onCancelConnecting,
    isMobileMenuOpen = false,
    onMobileMenuClose,
}: ControlPanelProps) => {
    const [deletingTower, setDeletingTower] = useState<string | null>(null);
    const [deletingLink, setDeletingLink] = useState<string | null>(null);
    const [editingFrequency, setEditingFrequency] = useState<string | null>(null);

    const handleFrequencyDoubleClick = (towerId: string) => {
        setEditingFrequency(towerId);
    };

    const handleFrequencyBlur = () => {
        setEditingFrequency(null);
    };

    const handleFrequencyKeyDown = (e: React.KeyboardEvent, towerId: string) => {
        if (e.key === 'Enter') {
            setEditingFrequency(null);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-500 backdrop-blur-sm"
                    onClick={onMobileMenuClose}
                />
            )}

            <div className={`
                fixed md:static
                top-0 left-0
                w-full md:w-96 max-w-sm md:max-w-none
                h-full
                bg-gradient-to-b from-slate-50 via-white to-slate-50
                border-r border-slate-200/60
                flex flex-col
                shadow-xl md:shadow-xl
                backdrop-blur-sm
                z-2000 md:z-auto
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 transition-transform">
                            <Radio className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">RF Link Planner</h1>
                            <p className="text-gray-500 text-xs md:text-sm font-medium">Plan point-to-point RF links</p>
                        </div>
                        {/* Mobile Close Button */}
                        <button
                            onClick={onMobileMenuClose}
                            className="md:hidden w-8 h-8 flex items-center justify-center"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Linking Mode Indicator */}
                {connectingTowerId && (
                    <div className="mx-3 md:mx-4 mt-3 md:mt-4 p-3 md:p-4 bg-emerald-50 border-2 border-emerald-300/60 rounded-xl md:rounded-2xl shadow-lg shadow-emerald-500/10 backdrop-blur-sm animate-in slide-in-from-top duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 md:gap-2.5">
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-pulse ring-2 ring-emerald-400/50" />
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700" />
                                    <span className="text-emerald-800 font-semibold text-xs md:text-sm">Linking Mode Active</span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onCancelConnecting}
                                className="h-6 w-6 md:h-7 md:w-7 p-0 hover:bg-emerald-100/80 rounded-lg transition-colors"
                            >
                                <XIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700" />
                            </Button>
                        </div>
                        <p className="text-emerald-700 text-xs md:text-sm mt-1.5 leading-relaxed">Click another tower with matching frequency to create a link</p>
                    </div>
                )}

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                        {/* Towers Section */}
                        <div>
                            <div className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4 px-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-black flex items-center justify-center shadow-lg ring-4 ring-gray-300/30">
                                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                </div>
                                <h2 className="text-base md:text-lg font-bold text-gray-900">Towers</h2>
                                <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700 border-gray-200 font-semibold px-2 md:px-2.5 py-0.5 text-xs md:text-sm">{towers.length}</Badge>
                            </div>

                            {towers.length === 0 ? (
                                <Card className="p-6 md:p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300/60 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                                        <MapPinIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium text-sm md:text-base">Click on the map to place towers</p>
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">Start by adding your first tower</p>
                                </Card>
                            ) : (
                                <div className="space-y-2 md:space-y-3">
                                    {towers.map(tower => {
                                        const isSelected = selectedTower === tower.id;
                                        const isConnecting = connectingTowerId === tower.id;
                                        const isDeleting = deletingTower === tower.id;

                                        return (
                                            <Card
                                                key={tower.id}
                                                className={`p-3 md:p-4 cursor-pointer transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:scale-[1.01] md:hover:scale-[1.02] ${isConnecting ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 ring-2 ring-amber-300/50 shadow-amber-200/50' :
                                                    isSelected ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-300/50 shadow-blue-200/50' :
                                                        'hover:border-slate-300 bg-white'
                                                    }`}
                                                onClick={() => !isDeleting && onTowerSelect(tower.id)}
                                            >
                                                <div className="flex items-start justify-between gap-2 md:gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-2.5">
                                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-base md:text-lg shadow-md transition-transform flex-shrink-0 ${isConnecting ? 'bg-gradient-to-br from-amber-400 to-amber-500 ring-2 ring-amber-300/50' :
                                                                isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-300/50' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                                                }`}>
                                                                <WifiIcon className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-slate-900 font-semibold text-xs md:text-sm truncate">Tower {tower.id.split('-')[1].slice(0, 6)}</p>
                                                                {editingFrequency === tower.id ? (
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        min="0.1"
                                                                        max="100"
                                                                        value={tower.frequency}
                                                                        onChange={(e) => onTowerUpdate(tower.id, {
                                                                            frequency: parseFloat(e.target.value) || 0
                                                                        })}
                                                                        onBlur={handleFrequencyBlur}
                                                                        onKeyDown={(e) => handleFrequencyKeyDown(e, tower.id)}
                                                                        className="h-7 text-sm mt-1"
                                                                        autoFocus
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                ) : (
                                                                    <p
                                                                        className="text-blue-600 font-medium cursor-pointer hover:text-blue-700 hover:underline transition-colors text-sm"
                                                                        onDoubleClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleFrequencyDoubleClick(tower.id);
                                                                        }}
                                                                        title="Double-click to edit"
                                                                    >
                                                                        {tower.frequency} GHz
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                                                            <MapPinIcon className="w-3.5 h-3.5 text-gray-500" />
                                                            <span>{tower.lat.toFixed(4)}, {tower.lng.toFixed(4)}</span>
                                                        </p>

                                                        {isSelected && !isDeleting && (
                                                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200/60 space-y-2 md:space-y-3 animate-in slide-in-from-top duration-300">
                                                                <div>
                                                                    <Label htmlFor={`freq-${tower.id}`} className="text-slate-700 font-medium text-xs md:text-sm mb-1.5 block">Frequency (GHz)</Label>
                                                                    <Input
                                                                        id={`freq-${tower.id}`}
                                                                        type="number"
                                                                        step="0.1"
                                                                        min="0.1"
                                                                        max="100"
                                                                        value={tower.frequency}
                                                                        onChange={(e) => onTowerUpdate(tower.id, {
                                                                            frequency: parseFloat(e.target.value) || 0
                                                                        })}
                                                                        className="mt-1"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onStartConnecting(tower.id);
                                                                        }}
                                                                    >
                                                                        <Link2 className="w-3.5 h-3.5 mr-1.5" />
                                                                        Connect
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeletingTower(tower.id);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {isDeleting && (
                                                            <div className="mt-4 pt-4 border-t border-red-200 bg-gradient-to-br from-red-50 to-rose-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl animate-in fade-in duration-300 shadow-inner">
                                                                <p className="text-red-800 font-semibold mb-3 text-sm">Delete this tower?</p>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onTowerDelete(tower.id);
                                                                            setDeletingTower(null);
                                                                        }}
                                                                    >
                                                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                                                        Yes
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="flex-1 border-slate-300 hover:bg-slate-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeletingTower(null);
                                                                        }}
                                                                    >
                                                                        <X className="w-3.5 h-3.5 mr-1.5" />
                                                                        No
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Links Section */}
                        <div>
                            <div className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4 px-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-black flex items-center justify-center shadow-lg ring-4 ring-gray-300/30">
                                    <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                </div>
                                <h2 className="text-base md:text-lg font-bold text-gray-900">Links</h2>
                                <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700 border-gray-200 font-semibold px-2 md:px-2.5 py-0.5 text-xs md:text-sm">{links.length}</Badge>
                            </div>

                            {links.length === 0 ? (
                                <Card className="p-6 md:p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300/60 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                                        <LinkIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium text-sm md:text-base">No links created yet</p>
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">Connect towers to create links</p>
                                </Card>
                            ) : (
                                <div className="space-y-2 md:space-y-3">
                                    {links.map(link => {
                                        const tower1 = towers.find(t => t.id === link.tower1Id);
                                        const tower2 = towers.find(t => t.id === link.tower2Id);
                                        const isSelected = selectedLink === link.id;
                                        const isDeleting = deletingLink === link.id;

                                        return (
                                            <Card
                                                key={link.id}
                                                className={`p-4 cursor-pointer transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:scale-[1.02] ${isSelected ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 ring-2 ring-emerald-300/50 shadow-emerald-200/50' : 'hover:border-slate-300 bg-white'
                                                    }`}
                                                onClick={() => !isDeleting && onLinkSelect(link.id)}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2.5">
                                                            <div 
                                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-base md:text-lg shadow-md transition-transform flex-shrink-0 ${isSelected ? 'bg-emerald-500 ring-2 ring-emerald-300/50' :
                                                                'bg-gradient-to-br from-slate-400 to-slate-500'
                                                                }`}>
                                                                <LinkIcon className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-slate-900 font-semibold text-sm truncate">Link {link.id.split('-')[1].slice(0, 6)}</p>
                                                                <p className="text-emerald-600 font-medium text-sm">{link.frequency} GHz</p>
                                                            </div>
                                                        </div>
                                                        {tower1 && tower2 && (
                                                            <p className="text-slate-500 text-xs flex items-center gap-1.5">
                                                                <span>Tower {tower1.id.split('-')[1].slice(0, 6)}</span>
                                                                <span className="text-slate-400">↔</span>
                                                                <span>Tower {tower2.id.split('-')[1].slice(0, 6)}</span>
                                                            </p>
                                                        )}

                                                        {isSelected && !isDeleting && (
                                                            <div className="mt-4 pt-4 border-t border-slate-200/60 animate-in slide-in-from-top duration-300">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeletingLink(link.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                                    Delete Link
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {isDeleting && (
                                                            <div className="mt-4 pt-4 border-t border-red-200 bg-gradient-to-br from-red-50 to-rose-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl animate-in fade-in duration-300 shadow-inner">
                                                                <p className="text-red-800 font-semibold mb-3 text-sm">Delete this link?</p>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onLinkDelete(link.id);
                                                                            setDeletingLink(null);
                                                                        }}
                                                                    >
                                                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                                                        Yes
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="flex-1 border-slate-300 hover:bg-slate-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeletingLink(null);
                                                                        }}
                                                                    >
                                                                        <X className="w-3.5 h-3.5 mr-1.5" />
                                                                        No
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Help / Quick Guide */}
                        <div>
                            <div className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4 px-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-black flex items-center justify-center shadow-lg ring-4 ring-gray-300/30">
                                    <HelpCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                </div>
                                <h2 className="text-base md:text-lg font-bold text-gray-900">Quick Guide</h2>
                            </div>
                            <Card className="p-4 md:p-5 bg-gray-50 border-2 border-gray-300/60 shadow-md">
                                <ul className="space-y-2 md:space-y-2.5 text-gray-700">
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-gray-600 mt-0.5 font-bold">•</span>
                                        <span className="text-xs md:text-sm leading-relaxed">Click map to place towers</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-gray-600 mt-0.5 font-bold">•</span>
                                        <span className="text-xs md:text-sm leading-relaxed">Double-click frequency to edit inline</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-gray-600 mt-0.5 font-bold">•</span>
                                        <span className="text-xs md:text-sm leading-relaxed">Select tower and click "Connect"</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-gray-600 mt-0.5 font-bold">•</span>
                                        <span className="text-xs md:text-sm leading-relaxed">Towers must have matching frequencies</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-gray-600 mt-0.5 font-bold">•</span>
                                        <span className="text-xs md:text-sm leading-relaxed">Click links to view Fresnel zones</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </>
    );
};