import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type PropertyType = "piso" | "casa" | "local" | "otros";
type FloorLevel = "bajo" | "entresuelo" | "1-2" | "3-5" | "6+" | "atico";
type BuildingAge = "nueva" | "reciente" | "moderna" | "antigua" | "muy-antigua";
type DirectOfferInterest = "not-interested" | "open-to-offers";
type AgencyStatus = "yes" | "no" | "soon" | "no-agencies";
type Orientation = "norte" | "sur" | "este" | "oeste" | "noreste" | "noroeste" | "sureste" | "suroeste";
type PropertyCondition = "a-estrenar" | "muy-buen-estado" | "buen-estado" | "para-reformar" | "reformado";
type Quality = "lujo" | "alta" | "media" | "basica";

interface WizardState {
  // Navegación
  currentStep: number;
  totalSteps: number;

  // Datos del wizard
  propertyType: PropertyType | null;
  bedrooms: number | null;

  // Paso 1: Ubicación
  postalCode: string;
  municipality: string; // Población/Ciudad
  street: string;
  squareMeters: number | null;
  landSize: number | null; // Tamaño del terreno (solo para casas)

  // Paso 2: Características básicas
  bathrooms: number | null;
  floor: FloorLevel | null;
  hasElevator: boolean | null;
  buildingAge: BuildingAge | null;

  // Paso 3: Datos personales
  name: string;
  email: string;
  phone: string;
  additionalComments: string;
  consentMarketing: boolean;
  consentDataProcessing: boolean;

  // Oferta directa
  directOfferInterest: DirectOfferInterest | null;
  agencyStatus: AgencyStatus | null;

  // Paso 7: Características avanzadas
  orientation: Orientation | null;
  propertyCondition: PropertyCondition | null;
  hasTerrace: boolean | null;
  terraceSize: number | null;
  hasGarage: boolean | null;
  hasStorage: boolean | null;
  quality: Quality | null;

  // Paso 8: Fotos
  photos: File[];
  photoUrls: string[];

  // Resultados
  leadId: string | null;
  valuation: any | null;
  detailedValuation: any | null;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setPropertyType: (type: PropertyType) => void;
  setBedrooms: (bedrooms: number) => void;

  setPostalCode: (code: string) => void;
  setMunicipality: (municipality: string) => void;
  setStreet: (street: string) => void;
  setSquareMeters: (meters: number) => void;
  setLandSize: (size: number | null) => void;

  setBathrooms: (bathrooms: number) => void;
  setFloor: (floor: FloorLevel) => void;
  setHasElevator: (has: boolean) => void;
  setBuildingAge: (age: BuildingAge) => void;

  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setAdditionalComments: (comments: string) => void;
  setConsentMarketing: (consent: boolean) => void;
  setConsentDataProcessing: (consent: boolean) => void;

  setDirectOfferInterest: (interest: DirectOfferInterest) => void;
  setAgencyStatus: (status: AgencyStatus) => void;

  // Advanced actions
  setOrientation: (orientation: Orientation) => void;
  setPropertyCondition: (condition: PropertyCondition) => void;
  setHasTerrace: (has: boolean) => void;
  setTerraceSize: (size: number) => void;
  setHasGarage: (has: boolean) => void;
  setHasStorage: (has: boolean) => void;
  setQuality: (quality: Quality) => void;

  // Photo actions
  addPhotos: (files: File[]) => void;
  removePhoto: (index: number) => void;
  clearPhotos: () => void;

  setLeadId: (id: string) => void;
  setValuation: (valuation: any) => void;
  setDetailedValuation: (valuation: any) => void;

  reset: () => void;
}

const initialState = {
  currentStep: 1,
  totalSteps: 10, // Nuevo flujo: 1-6 básico + 7 avanzadas + 8 fotos + 9 loading IA + 10 resultado final

  propertyType: null,
  bedrooms: null,

  postalCode: "",
  municipality: "",
  street: "",
  squareMeters: null,
  landSize: null,

  bathrooms: null,
  floor: null,
  hasElevator: null,
  buildingAge: null,

  name: "",
  email: "",
  phone: "",
  additionalComments: "",
  consentMarketing: false,
  consentDataProcessing: false,

  directOfferInterest: null,
  agencyStatus: null,

  // Advanced fields
  orientation: null,
  propertyCondition: null,
  hasTerrace: null,
  terraceSize: null,
  hasGarage: null,
  hasStorage: null,
  quality: null,

  // Photos
  photos: [],
  photoUrls: [],

  leadId: null,
  valuation: null,
  detailedValuation: null,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setPropertyType: (propertyType) => set({ propertyType }),
  setBedrooms: (bedrooms) => set({ bedrooms }),

  setPostalCode: (postalCode) => set({ postalCode }),
  setMunicipality: (municipality) => set({ municipality }),
  setStreet: (street) => set({ street }),
  setSquareMeters: (squareMeters) => set({ squareMeters }),
  setLandSize: (landSize) => set({ landSize }),

  setBathrooms: (bathrooms) => set({ bathrooms }),
  setFloor: (floor) => set({ floor }),
  setHasElevator: (hasElevator) => set({ hasElevator }),
  setBuildingAge: (buildingAge) => set({ buildingAge }),

  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPhone: (phone) => set({ phone }),
  setAdditionalComments: (additionalComments) => set({ additionalComments }),
  setConsentMarketing: (consentMarketing) => set({ consentMarketing }),
  setConsentDataProcessing: (consentDataProcessing) => set({ consentDataProcessing }),

  setDirectOfferInterest: (directOfferInterest) => set({ directOfferInterest }),
  setAgencyStatus: (agencyStatus) => set({ agencyStatus }),

  // Advanced setters
  setOrientation: (orientation) => set({ orientation }),
  setPropertyCondition: (propertyCondition) => set({ propertyCondition }),
  setHasTerrace: (hasTerrace) => set({ hasTerrace }),
  setTerraceSize: (terraceSize) => set({ terraceSize }),
  setHasGarage: (hasGarage) => set({ hasGarage }),
  setHasStorage: (hasStorage) => set({ hasStorage }),
  setQuality: (quality) => set({ quality }),

  // Photo management
  addPhotos: (newPhotos) => set((state) => ({
    photos: [...state.photos, ...newPhotos],
    photoUrls: [...state.photoUrls, ...newPhotos.map(f => URL.createObjectURL(f))]
  })),
  removePhoto: (index) => set((state) => ({
    photos: state.photos.filter((_, i) => i !== index),
    photoUrls: state.photoUrls.filter((_, i) => i !== index)
  })),
  clearPhotos: () => set({ photos: [], photoUrls: [] }),

      setLeadId: (leadId) => set({ leadId }),
      setValuation: (valuation) => set({ valuation }),
      setDetailedValuation: (detailedValuation) => set({ detailedValuation }),

      reset: () => set(initialState),
    }),
    {
      name: 'wizard-storage',
      storage: createJSONStorage(() => localStorage),
      // No persistir fotos (son objetos File, no serializables)
      // No persistir photoUrls (se regeneran)
      partialize: (state) => ({
        currentStep: state.currentStep,
        propertyType: state.propertyType,
        bedrooms: state.bedrooms,
        postalCode: state.postalCode,
        municipality: state.municipality,
        street: state.street,
        squareMeters: state.squareMeters,
        landSize: state.landSize,
        bathrooms: state.bathrooms,
        floor: state.floor,
        hasElevator: state.hasElevator,
        buildingAge: state.buildingAge,
        name: state.name,
        email: state.email,
        phone: state.phone,
        additionalComments: state.additionalComments,
        consentMarketing: state.consentMarketing,
        consentDataProcessing: state.consentDataProcessing,
        directOfferInterest: state.directOfferInterest,
        agencyStatus: state.agencyStatus,
        orientation: state.orientation,
        propertyCondition: state.propertyCondition,
        hasTerrace: state.hasTerrace,
        terraceSize: state.terraceSize,
        hasGarage: state.hasGarage,
        hasStorage: state.hasStorage,
        quality: state.quality,
        leadId: state.leadId,
        valuation: state.valuation,
        detailedValuation: state.detailedValuation,
      }),
    }
  )
);
