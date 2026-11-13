/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ElementStyleOverride, DesignOverridesDoc } from '../types/designOverrides';

interface DesignOverridesContextType {
  isLiveEditMode: boolean;
  setIsLiveEditMode: (val: boolean) => void;
  activeElementId: string | null;
  activeElementLabel: string | null;
  selectElement: (id: string | null, label?: string | null) => void;
  overrides: Record<string, ElementStyleOverride>;
  updateElementOverride: (id: string, style: Partial<ElementStyleOverride>) => void;
  resetElementOverride: (id: string) => void;
  resetAllOverrides: () => void;
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
}

const DesignOverridesContext = createContext<DesignOverridesContextType | undefined>(undefined);

export const DesignOverridesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(false);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [activeElementLabel, setActiveElementLabel] = useState<string | null>(null);
  
  const [overrides, setOverrides] = useState<Record<string, ElementStyleOverride>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo / Redo history stacks (max 20)
  const historyRef = useRef<Record<string, ElementStyleOverride>[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const pushHistory = (newState: Record<string, ElementStyleOverride>) => {
    // Slice off future history if we made a new change after undoing
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    trimmed.push(JSON.parse(JSON.stringify(newState)));
    if (trimmed.length > 20) {
      trimmed.shift();
    }
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
    updateHistoryState();
  };

  // 1. Initial Load for Public Site: loads 'design_published'
  useEffect(() => {
    const loadPublishedDesign = async () => {
      try {
        const snap = await getDoc(doc(db, 'portfolio', 'design_published'));
        if (snap.exists()) {
          const data = snap.data() as DesignOverridesDoc;
          if (data && data.elements) {
            setOverrides(data.elements);
            historyRef.current = [JSON.parse(JSON.stringify(data.elements))];
            historyIndexRef.current = 0;
            updateHistoryState();
          }
        }
      } catch (err) {
        // Fallback safely: if missing or network offline, site looks exactly default
        console.warn('Design published doc not found or unreachable. Using clean default styling.', err);
      }
    };

    if (!isLiveEditMode) {
      loadPublishedDesign();
    }
  }, [isLiveEditMode]);

  // 2. When entering Live Edit Mode: load 'design_draft' (or fallback to current published)
  useEffect(() => {
    if (!isLiveEditMode) return;

    const loadDraftDesign = async () => {
      try {
        const snap = await getDoc(doc(db, 'portfolio', 'design_draft'));
        if (snap.exists()) {
          const data = snap.data() as DesignOverridesDoc;
          if (data && data.elements) {
            setOverrides(data.elements);
            historyRef.current = [JSON.parse(JSON.stringify(data.elements))];
            historyIndexRef.current = 0;
            updateHistoryState();
            setHasUnsavedChanges(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Draft design load fallback', err);
      }

      // If draft doc doesn't exist yet, start with whatever is published or empty
      historyRef.current = [JSON.parse(JSON.stringify(overrides))];
      historyIndexRef.current = 0;
      updateHistoryState();
      setHasUnsavedChanges(false);
    };

    loadDraftDesign();
  }, [isLiveEditMode]);

  const selectElement = useCallback((id: string | null, label?: string | null) => {
    setActiveElementId(id);
    setActiveElementLabel(label || id);
  }, []);

  const updateElementOverride = useCallback((id: string, style: Partial<ElementStyleOverride>) => {
    setOverrides(prev => {
      const current = prev[id] || {};
      const updatedItem: ElementStyleOverride = {
        ...current,
        ...style
      };

      // Clean undefined or empty string values
      if (updatedItem.color === '') delete updatedItem.color;
      if (updatedItem.fontFamily === '') delete updatedItem.fontFamily;
      if (updatedItem.fontSize === undefined) delete updatedItem.fontSize;

      const nextState = {
        ...prev,
        [id]: updatedItem
      };

      pushHistory(nextState);
      setHasUnsavedChanges(true);
      return nextState;
    });
  }, []);

  const resetElementOverride = useCallback((id: string) => {
    setOverrides(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      pushHistory(next);
      setHasUnsavedChanges(true);
      return next;
    });
  }, []);

  const resetAllOverrides = useCallback(() => {
    const empty = {};
    setOverrides(empty);
    pushHistory(empty);
    setHasUnsavedChanges(true);
    setActiveElementId(null);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setOverrides(prev);
      setHasUnsavedChanges(true);
      updateHistoryState();
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setOverrides(next);
      setHasUnsavedChanges(true);
      updateHistoryState();
    }
  }, []);

  const saveDraftDesign = useCallback(async (): Promise<boolean> => {
    setIsSavingDraft(true);
    try {
      const docData: DesignOverridesDoc = {
        updatedAt: new Date().toISOString(),
        elements: overrides
      };
      await setDoc(doc(db, 'portfolio', 'design_draft'), docData);
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error('Failed to save draft design overrides:', err);
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  }, [overrides]);

  const publishDesign = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    try {
      const docData: DesignOverridesDoc = {
        updatedAt: new Date().toISOString(),
        elements: overrides
      };
      // Write to both published and draft to stay in sync
      await setDoc(doc(db, 'portfolio', 'design_published'), docData);
      await setDoc(doc(db, 'portfolio', 'design_draft'), docData);
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error('Failed to publish design overrides:', err);
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [overrides]);

  // Helper for applying styles to elements efficiently
  const getElementStyle = useCallback((id: string): React.CSSProperties => {
    const override = overrides[id];
    if (!override) return {};

    const style: React.CSSProperties = {};
    if (override.color) {
      style.color = override.color;
    }
    if (override.fontSize) {
      style.fontSize = `${override.fontSize}px`;
    }
    if (override.fontFamily) {
      style.fontFamily = `"${override.fontFamily}", sans-serif`;
    }
    return style;
  }, [overrides]);

  return (
    <DesignOverridesContext.Provider
      value={{
        isLiveEditMode,
        setIsLiveEditMode,
        activeElementId,
        activeElementLabel,
        selectElement,
        overrides,
        updateElementOverride,
        resetElementOverride,
        resetAllOverrides,
        saveDraftDesign,
        publishDesign,
        isSavingDraft,
        isPublishing,
        hasUnsavedChanges,
        canUndo,
        canRedo,
        undo,
        redo,
        getElementStyle
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
