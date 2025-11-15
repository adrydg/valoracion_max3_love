import { create } from 'zustand';

type PropertyType = "piso" | "casa" | "local" | "otros";
type FloorLevel = "bajo" | "entresuelo" | "1-2" | "3-5" | "6+" | "atico";
type BuildingAge = "nueva" | "reciente" | "moderna" | "antigua" | "muy-antigua";
type DirectOfferInterest = "not-interested" | "open-to-offers";

interface WizardState {
  // Navegación
  currentStep: number;
  totalSteps: number;

  // Datos del wizard
  propertyType: PropertyType | null;
  bedrooms: number | null;

  // Paso 1: Ubicación
  postalCode: string;
  street: string;
  squareMeters: number | null;

  // Paso 2: Características
  bathrooms: number | null;
  floor: FloorLevel | null;
  hasElevator: boolean | null;
  buildingAge: BuildingAge | null;

  // Paso 3: Datos personales
  name: string;
  email: string;
  phone: string;
  consentMarketing: boolean;
  consentDataProcessing: boolean;

  // Oferta directa
  directOfferInterest: DirectOfferInterest | null;

  // Resultado
  leadId: string | null;
  valuation: any | null;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setPropertyType: (type: PropertyType) => void;
  setBedrooms: (bedrooms: number) => void;

  setPostalCode: (code: string) => void;
  setStreet: (street: string) => void;
  setSquareMeters: (meters: number) => void;

  setBathrooms: (bathrooms: number) => void;
  setFloor: (floor: FloorLevel) => void;
  setHasElevator: (has: boolean) => void;
  setBuildingAge: (age: BuildingAge) => void;

  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setConsentMarketing: (consent: boolean) => void;
  setConsentDataProcessing: (consent: boolean) => void;

  setDirectOfferInterest: (interest: DirectOfferInterest) => void;

  setLeadId: (id: string) => void;
  setValuation: (valuation: any) => void;

  reset: () => void;
}

const initialState = {
  currentStep: 1,
  totalSteps: 6, // 1: ubicacion, 2: caracteristicas, 3: datos personales, 4: loading, 5: oferta directa, 6: resultado

  propertyType: null,
  bedrooms: null,

  postalCode: "",
  street: "",
  squareMeters: null,

  bathrooms: null,
  floor: null,
  hasElevator: null,
  buildingAge: null,

  name: "",
  email: "",
  phone: "",
  consentMarketing: false,
  consentDataProcessing: false,

  directOfferInterest: null,

  leadId: null,
  valuation: null,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setPropertyType: (propertyType) => set({ propertyType }),
  setBedrooms: (bedrooms) => set({ bedrooms }),

  setPostalCode: (postalCode) => set({ postalCode }),
  setStreet: (street) => set({ street }),
  setSquareMeters: (squareMeters) => set({ squareMeters }),

  setBathrooms: (bathrooms) => set({ bathrooms }),
  setFloor: (floor) => set({ floor }),
  setHasElevator: (hasElevator) => set({ hasElevator }),
  setBuildingAge: (buildingAge) => set({ buildingAge }),

  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPhone: (phone) => set({ phone }),
  setConsentMarketing: (consentMarketing) => set({ consentMarketing }),
  setConsentDataProcessing: (consentDataProcessing) => set({ consentDataProcessing }),

  setDirectOfferInterest: (directOfferInterest) => set({ directOfferInterest }),

  setLeadId: (leadId) => set({ leadId }),
  setValuation: (valuation) => set({ valuation }),

  reset: () => set(initialState),
}));
