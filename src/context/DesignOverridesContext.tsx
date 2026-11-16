/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ElementStyleOverride,
  DesignOverridesDoc,
  Studio3DBackgroundConfig,
  SectionBackgroundConfig,
  CustomCanvasLayer,
  DEFAULT_STUDIO_3D
} from '../types/designOverrides';

interface DesignSnapshot {
  elements: Record<string, ElementStyleOverride>;
  studio3D: Studio3DBackgroundConfig;
  sectionBackgrounds: Record<string, SectionBackgroundConfig>;
  customLayers: CustomCanvasLayer[];
  sectionOrder: string[];
}

const DEFAULT_SECTION_ORDER = [
  'caseStudies',
  'videoShowcase',
  'graphicShowcase',
  'aboutPreview',
  'trustTestimonials',
  'overviewDirectory'
];

function createEmptySnapshot(): DesignSnapshot {
  return {
    elements: {},
    studio3D: { ...DEFAULT_STUDIO_3D },
    sectionBackgrounds: {},
    customLayers: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER]
  };
}

function hydrateDocToSnapshot(data?: Partial<DesignOverridesDoc> | null): DesignSnapshot {
  return {
    elements: data?.elements ? { ...data.elements } : {},
    studio3D: { ...DEFAULT_STUDIO_3D, ...(data?.studio3D || {}) },
    sectionBackgrounds: data?.sectionBackgrounds ? { ...data.sectionBackgrounds } : {},
    customLayers: Array.isArray(data?.customLayers) ? [...data.customLayers] : [],
    sectionOrder:
      Array.isArray(data?.sectionOrder) && data.sectionOrder.length > 0
        ? [...data.sectionOrder]
        : [...DEFAULT_SECTION_ORDER]
  };
}

interface DesignOverridesContextType {
  isLiveEditMode: boolean;
  setIsLiveEditMode: (val: boolean) => void;
  activeElementId: string | null;
  activeElementLabel: string | null;
  selectElement: (id: string | null, label?: string | null) => void;
  activeLayerId: string | null;
  selectLayer: (id: string | null) => void;
  overrides: Record<string, ElementStyleOverride>;
  studio3D: Studio3DBackgroundConfig;
  sectionBackgrounds: Record<string, SectionBackgroundConfig>;
  customLayers: CustomCanvasLayer[];
  sectionOrder: string[];
  showHiddenInLiveEdit: boolean;
  setShowHiddenInLiveEdit: (val: boolean) => void;
  updateElementOverride: (id: string, style: Partial<ElementStyleOverride>) => void;
  resetElementOverride: (id: string) => void;
  hideElement: (id: string) => void;
  restoreElement: (id: string) => void;
  resetAllOverrides: () => void;
  updateStudio3D: (patch: Partial<Studio3DBackgroundConfig>) => void;
  updateSectionBackground: (sectionId: string, patch: Partial<SectionBackgroundConfig>) => void;
  resetSectionBackground: (sectionId: string) => void;
  addCustomLayer: (layer: CustomCanvasLayer) => void;
  updateCustomLayer: (id: string, patch: Partial<CustomCanvasLayer>) => void;
  removeCustomLayer: (id: string) => void;
  duplicateCustomLayer: (id: string) => void;
  setSectionOrder: (order: string[]) => void;
  saveDraftDesign: () => Promise<boolean>;
  publishDesign: () => Promise<boolean>;
  isSavingDraft: boolean;
  isPublishing: boolean;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  getElementStyle: (id: string) => React.CSSProperties;
  getElementText: (id: string, language?: string) => string | undefined;
  isElementHidden: (id: string) => boolean;
}

const DesignOverridesContext = createContext<DesignOverridesContextType | undefined>(undefined);

export const DesignOverridesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(false);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [activeElementLabel, setActiveElementLabel] = useState<string | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [showHiddenInLiveEdit, setShowHiddenInLiveEdit] = useState<boolean>(false);

  const [snapshot, setSnapshot] = useState<DesignSnapshot>(createEmptySnapshot);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo / Redo history stacks (max 25)
  const historyRef = useRef<DesignSnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryFlags = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const commitSnapshot = useCallback((updater: (prev: DesignSnapshot) => DesignSnapshot) => {
    setSnapshot((prev) => {
      const next = updater(prev);
      const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
      trimmed.push(JSON.parse(JSON.stringify(next)));
      if (trimmed.length > 25) {
        trimmed.shift();
      }
      historyRef.current = trimmed;
      historyIndexRef.current = trimmed.length - 1;
      syncHistoryFlags();
      setHasUnsavedChanges(true);
      return next;
    });
  }, []);

  // 1. Initial Load for Public Site: loads 'design_published'
  useEffect(() => {
    const loadPublishedDesign = async () => {
      try {
        const snap = await getDoc(doc(db, 'portfolio', 'design_published'));
        if (snap.exists()) {
          const data = snap.data() as DesignOverridesDoc;
          const hydrated = hydrateDocToSnapshot(data);
          setSnapshot(hydrated);
          historyRef.current = [JSON.parse(JSON.stringify(hydrated))];
          historyIndexRef.current = 0;
          syncHistoryFlags();
        }
      } catch (err) {
        console.warn('Design published doc not found or unreachable. Using clean default styling.', err);
      }
    };

    if (!isLiveEditMode) {
      loadPublishedDesign();
    }
  }, [isLiveEditMode]);

  // 2. When entering Live Edit Mode: load 'design_draft' (or current snapshot)
  useEffect(() => {
    if (!isLiveEditMode) return;

    const loadDraftDesign = async () => {
      try {
        const snap = await getDoc(doc(db, 'portfolio', 'design_draft'));
        if (snap.exists()) {
          const data = snap.data() as DesignOverridesDoc;
          const hydrated = hydrateDocToSnapshot(data);
          setSnapshot(hydrated);
          historyRef.current = [JSON.parse(JSON.stringify(hydrated))];
          historyIndexRef.current = 0;
          syncHistoryFlags();
          setHasUnsavedChanges(false);
          return;
        }
      } catch (err) {
        console.warn('Draft design load fallback', err);
      }

      historyRef.current = [JSON.parse(JSON.stringify(snapshot))];
      historyIndexRef.current = 0;
      syncHistoryFlags();
      setHasUnsavedChanges(false);
    };

    loadDraftDesign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveEditMode]);

  const selectElement = useCallback((id: string | null, label?: string | null) => {
    setActiveElementId(id);
    setActiveElementLabel(label || id);
    if (id) setActiveLayerId(null);
  }, []);

  const selectLayer = useCallback((id: string | null) => {
    setActiveLayerId(id);
    if (id) {
      setActiveElementId(null);
      setActiveElementLabel(null);
    }
  }, []);

  const updateElementOverride = useCallback(
    (id: string, style: Partial<ElementStyleOverride>) => {
      commitSnapshot((prev) => {
        const current = prev.elements[id] || {};
        const updatedItem: ElementStyleOverride = {
          ...current,
          ...style
        };

        if (updatedItem.color === '') delete updatedItem.color;
        if (updatedItem.fontFamily === '') delete updatedItem.fontFamily;
        if (updatedItem.fontSize === undefined) delete updatedItem.fontSize;
        if (updatedItem.bgColor === '') delete updatedItem.bgColor;

        return {
          ...prev,
          elements: {
            ...prev.elements,
            [id]: updatedItem
          }
        };
      });
    },
    [commitSnapshot]
  );

  const resetElementOverride = useCallback(
    (id: string) => {
      commitSnapshot((prev) => {
        if (!prev.elements[id]) return prev;
        const nextElements = { ...prev.elements };
        delete nextElements[id];
        return { ...prev, elements: nextElements };
      });
    },
    [commitSnapshot]
  );

  const hideElement = useCallback(
    (id: string) => {
      updateElementOverride(id, { hidden: true });
      if (activeElementId === id) {
        setActiveElementId(null);
        setActiveElementLabel(null);
      }
    },
    [updateElementOverride, activeElementId]
  );

  const restoreElement = useCallback(
    (id: string) => {
      updateElementOverride(id, { hidden: false });
    },
    [updateElementOverride]
  );

  const resetAllOverrides = useCallback(() => {
    const empty = createEmptySnapshot();
    commitSnapshot(() => empty);
    setActiveElementId(null);
    setActiveElementLabel(null);
    setActiveLayerId(null);
  }, [commitSnapshot]);

  const updateStudio3D = useCallback(
    (patch: Partial<Studio3DBackgroundConfig>) => {
      commitSnapshot((prev) => ({
        ...prev,
        studio3D: { ...prev.studio3D, ...patch }
      }));
    },
    [commitSnapshot]
  );

  const updateSectionBackground = useCallback(
    (sectionId: string, patch: Partial<SectionBackgroundConfig>) => {
      commitSnapshot((prev) => ({
        ...prev,
        sectionBackgrounds: {
          ...prev.sectionBackgrounds,
          [sectionId]: {
            ...(prev.sectionBackgrounds[sectionId] || {}),
            ...patch
          }
        }
      }));
    },
    [commitSnapshot]
  );

  const resetSectionBackground = useCallback(
    (sectionId: string) => {
      commitSnapshot((prev) => {
        const nextBg = { ...prev.sectionBackgrounds };
        delete nextBg[sectionId];
        return { ...prev, sectionBackgrounds: nextBg };
      });
    },
    [commitSnapshot]
  );

  const addCustomLayer = useCallback(
    (layer: CustomCanvasLayer) => {
      commitSnapshot((prev) => ({
        ...prev,
        customLayers: [...prev.customLayers, layer]
      }));
      setActiveLayerId(layer.id);
      setActiveElementId(null);
    },
    [commitSnapshot]
  );

  const updateCustomLayer = useCallback(
    (id: string, patch: Partial<CustomCanvasLayer>) => {
      commitSnapshot((prev) => ({
        ...prev,
        customLayers: prev.customLayers.map((l) => (l.id === id ? { ...l, ...patch } : l))
      }));
    },
    [commitSnapshot]
  );

  const removeCustomLayer = useCallback(
    (id: string) => {
      commitSnapshot((prev) => ({
        ...prev,
        customLayers: prev.customLayers.filter((l) => l.id !== id)
      }));
      if (activeLayerId === id) setActiveLayerId(null);
    },
    [commitSnapshot, activeLayerId]
  );

  const duplicateCustomLayer = useCallback(
    (id: string) => {
      const source = snapshot.customLayers.find((l) => l.id === id);
      if (!source) return;
      const cloned: CustomCanvasLayer = {
        ...source,
        id: 'layer-' + Date.now(),
        name: `${source.name} Copy`,
        x: Math.min(85, (source.x ?? 10) + 4),
        y: (source.y ?? 40) + 28
      };
      addCustomLayer(cloned);
    },
    [snapshot.customLayers, addCustomLayer]
  );

  const setSectionOrder = useCallback(
    (order: string[]) => {
      commitSnapshot((prev) => ({
        ...prev,
        sectionOrder: order
      }));
    },
    [commitSnapshot]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setSnapshot(prev);
      setHasUnsavedChanges(true);
      syncHistoryFlags();
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setSnapshot(next);
      setHasUnsavedChanges(true);
      syncHistoryFlags();
    }
  }, []);

  const buildDocPayload = (snap: DesignSnapshot): DesignOverridesDoc => ({
    updatedAt: new Date().toISOString(),
    elements: snap.elements,
    studio3D: snap.studio3D,
    sectionBackgrounds: snap.sectionBackgrounds,
    customLayers: snap.customLayers,
    sectionOrder: snap.sectionOrder
  });

  const saveDraftDesign = useCallback(async (): Promise<boolean> => {
    setIsSavingDraft(true);
    try {
      await setDoc(doc(db, 'portfolio', 'design_draft'), buildDocPayload(snapshot));
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error('Failed to save draft design overrides:', err);
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  }, [snapshot]);

  const publishDesign = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    try {
      const payload = buildDocPayload(snapshot);
      await setDoc(doc(db, 'portfolio', 'design_published'), payload);
      await setDoc(doc(db, 'portfolio', 'design_draft'), payload);
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error('Failed to publish design overrides:', err);
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [snapshot]);

  const getElementStyle = useCallback(
    (id: string): React.CSSProperties => {
      const o = snapshot.elements[id];
      if (!o) return {};

      const style: React.CSSProperties = {};
      if (o.color) {
        style.color = o.color;
        style.WebkitTextFillColor = o.color;
      }
      if (o.fontSize !== undefined) style.fontSize = `${o.fontSize}px`;
      if (o.fontFamily) style.fontFamily = `"${o.fontFamily}", sans-serif`;
      if (o.textAlign) style.textAlign = o.textAlign;
      if (o.opacity !== undefined) style.opacity = o.opacity;
      if (o.zIndex !== undefined) style.zIndex = o.zIndex;

      if (o.width !== undefined && o.width !== '') {
        style.width = typeof o.width === 'number' ? `${o.width}px` : o.width;
        style.maxWidth = '100%';
      }
      if (o.height !== undefined && o.height !== '') {
        style.minHeight = typeof o.height === 'number' ? `${o.height}px` : o.height;
      }
      if (o.padding !== undefined) style.padding = `${o.padding}px`;
      if (o.borderRadius !== undefined) style.borderRadius = `${o.borderRadius}px`;

      // Combined Transform (Move + Zoom Scale + Rotate)
      const transforms: string[] = [];
      if (o.offsetX || o.offsetY) {
        transforms.push(`translate3d(${o.offsetX || 0}px, ${o.offsetY || 0}px, 0)`);
      }
      if (o.scale !== undefined && o.scale !== 1) {
        transforms.push(`scale(${o.scale})`);
      }
      if (o.rotate !== undefined && o.rotate !== 0) {
        transforms.push(`rotate(${o.rotate}deg)`);
      }
      if (transforms.length > 0) {
        style.transform = transforms.join(' ');
      }

      // Blur filter
      if (o.blur !== undefined && o.blur > 0) {
        style.filter = `blur(${o.blur}px)`;
      }

      // Glassmorphism & Background
      if (o.glassBlur !== undefined && o.glassBlur > 0) {
        style.backdropFilter = `blur(${o.glassBlur}px)`;
        (style as any).WebkitBackdropFilter = `blur(${o.glassBlur}px)`;
      }
      if (o.bgColor) {
        style.backgroundColor = o.bgColor;
      } else if (o.glassOpacity !== undefined && o.glassOpacity > 0) {
        style.backgroundColor = `rgba(255, 255, 255, ${o.glassOpacity})`;
        style.border = `1px solid rgba(255, 255, 255, ${Math.min(0.45, o.glassOpacity * 1.8)})`;
      }

      // Shadow
      if (o.shadowIntensity !== undefined && o.shadowIntensity > 0) {
        const sColor = o.shadowColor || 'rgba(0,0,0,0.65)';
        style.boxShadow = `0 ${Math.round(o.shadowIntensity * 0.4)}px ${o.shadowIntensity}px ${sColor}`;
      }

      if (o.motionMode === 'none') {
        style.animation = 'none';
        style.transition = 'none';
      }

      return style;
    },
    [snapshot.elements]
  );

  const getElementText = useCallback(
    (id: string, language = 'en'): string | undefined => {
      const t = snapshot.elements[id]?.textOverride;
      if (!t) return undefined;
      return t[language] !== undefined ? t[language] : t.default;
    },
    [snapshot.elements]
  );

  const isElementHidden = useCallback(
    (id: string): boolean => {
      return Boolean(snapshot.elements[id]?.hidden);
    },
    [snapshot.elements]
  );

  return (
    <DesignOverridesContext.Provider
      value={{
        isLiveEditMode,
        setIsLiveEditMode,
        activeElementId,
        activeElementLabel,
        selectElement,
        activeLayerId,
        selectLayer,
        overrides: snapshot.elements,
        studio3D: snapshot.studio3D,
        sectionBackgrounds: snapshot.sectionBackgrounds,
        customLayers: snapshot.customLayers,
        sectionOrder: snapshot.sectionOrder,
        showHiddenInLiveEdit,
        setShowHiddenInLiveEdit,
        updateElementOverride,
        resetElementOverride,
        hideElement,
        restoreElement,
        resetAllOverrides,
        updateStudio3D,
        updateSectionBackground,
        resetSectionBackground,
        addCustomLayer,
        updateCustomLayer,
        removeCustomLayer,
        duplicateCustomLayer,
        setSectionOrder,
        saveDraftDesign,
        publishDesign,
        isSavingDraft,
        isPublishing,
        hasUnsavedChanges,
        canUndo,
        canRedo,
        undo,
        redo,
        getElementStyle,
        getElementText,
        isElementHidden
      }}
    >
      {children}
    </DesignOverridesContext.Provider>
  );
};

export const useDesignOverrides = () => {
  const ctx = useContext(DesignOverridesContext);
  if (!ctx) {
    throw new Error('useDesignOverrides must be used within a DesignOverridesProvider');
  }
  return ctx;
};
