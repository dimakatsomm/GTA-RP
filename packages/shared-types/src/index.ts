/**
 * Shared domain types used across services.
 * Keep narrow and stable — breaking changes here ripple everywhere.
 */

export type PlayerId = string & { readonly __brand: 'PlayerId' };
export type FamilyId = string & { readonly __brand: 'FamilyId' };
export type GangId = string & { readonly __brand: 'GangId' };
export type BusinessId = string & { readonly __brand: 'BusinessId' };
export type TerritoryId = string & { readonly __brand: 'TerritoryId' };
export type CrimeId = string & { readonly __brand: 'CrimeId' };
export type EvidenceId = string & { readonly __brand: 'EvidenceId' };
export type EventId = string & { readonly __brand: 'EventId' };

export type ISODateString = string;

export type Province =
  | 'GP' // Gauteng (Joburg, Pretoria)
  | 'WC' // Western Cape (Cape Town)
  | 'KZN' // KwaZulu-Natal (Durban)
  | 'EC'
  | 'NC'
  | 'FS'
  | 'NW'
  | 'MP'
  | 'LP';

export type CrimeType =
  | 'hijack'
  | 'robbery'
  | 'cit_robbery'
  | 'drug_deal'
  | 'counterfeit'
  | 'tender_fraud'
  | 'protection'
  | 'firearm_trafficking'
  | 'smuggling'
  | 'money_laundering'
  | 'corruption_bribe'
  | 'assault'
  | 'murder';

export type CrimeSeverity = 'petty' | 'minor' | 'major' | 'serious' | 'capital';

export type Faction = 'civilian' | 'criminal' | 'police' | 'government' | 'business';

export type AiTier = 0 | 1 | 2 | 3;

export interface GeoPoint {
  x: number;
  y: number;
  z: number;
  province: Province;
  area: string; // neighborhood / suburb slug
}

export interface ReputationDelta {
  player?: PlayerId;
  family?: FamilyId;
  gang?: GangId;
  area?: string;
  amount: number; // signed
  reason: string;
}
